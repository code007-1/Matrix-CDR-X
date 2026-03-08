import pkg from 'pg';
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER } from '../statics.js';
import { fileLogger } from './prod_logger.js';
const { Pool } = pkg;

const pool = new Pool({
    user: DB_USER,
    host: DB_HOST,
    database: DB_NAME,
    password: DB_PASSWORD,
    port: DB_PORT,
});

pool.on('error', (err) => {
    fileLogger.error('Unexpected error on idle client', err);
    process.exit(-1);
});

export const DB = {
    getUser: (id) => {
        return new Promise((resolve, reject) => {
            pool.query("SELECT * FROM users WHERE id = $1", [id], (err, res) => {
                if (err) reject(err);
                else resolve(res.rows);
            });
        });
    },

    updatePassword: (id, password) => {
        return new Promise((resolve, reject) => {
            pool.query("UPDATE users SET password = $1 WHERE id = $2", [password, id], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    },

    getCdrLogs: (table, limit, offset, deviceIp) => {
        return new Promise((resolve, reject) => {
            const allowedTables = ['internal', 'incoming', 'outgoing'];
            if (!allowedTables.includes(table)) {
                return reject(new Error("Invalid table name"));
            }
            let sql = `SELECT * FROM ${table} `;
            const params = [];

            if (deviceIp && deviceIp !== 'ALL') {
                sql += `WHERE device_ip = $1 `;
                params.push(deviceIp);
            }

            sql += "ORDER BY sno DESC ";

            if (limit !== undefined && offset !== undefined) {
                sql += `LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
                params.push(limit, offset);
            }

            pool.query(sql, params, (err, res) => {
                if (err) reject(err);
                else resolve(res.rows);
            });
        });
    },

    getCdrCount: (table, deviceIp) => {
        return new Promise((resolve, reject) => {
            const allowedTables = ['internal', 'incoming', 'outgoing'];
            if (!allowedTables.includes(table)) {
                return reject(new Error("Invalid table name"));
            }
            let sql = `SELECT count(*) as count FROM ${table}`;
            const params = [];

            if (deviceIp && deviceIp !== 'ALL') {
                sql += ` WHERE device_ip = $1`;
                params.push(deviceIp);
            }

            pool.query(sql, params, (err, res) => {
                if (err) reject(err);
                else resolve(res.rows[0] ? parseInt(res.rows[0].count) : 0);
            });
        });
    },

    searchCdr: (table, start, end, source, limit) => {
        return new Promise((resolve, reject) => {
            const allowedTables = ['internal', 'incoming', 'outgoing'];
            if (!allowedTables.includes(table)) {
                return reject(new Error("Invalid table name"));
            }

            // (source LIKE '%${source}%' or destination LIKE '%${source}%')
            // Postgres uses ILIKE for case-insensitive search if desired, but LIKE is standard.
            const sql = `SELECT * FROM ${table} where date >= $1 and date <= $2 and (source LIKE $3 or destination LIKE $4) LIMIT $5`;
            const sourceParam = `%${source}%`;

            pool.query(sql, [start, end, sourceParam, sourceParam, limit], (err, res) => {
                if (err) reject(err);
                else resolve(res.rows);
            });
        });
    },

    insertBatch: (table, columns, rows) => {
        return new Promise(async (resolve, reject) => {
            if (!rows || rows.length === 0) return resolve();

            const allowedTables = ['internal', 'incoming', 'outgoing'];
            if (!allowedTables.includes(table)) {
                return reject(new Error("Invalid table name"));
            }

            // Postgres bulk insert is slightly different optimization-wise but standard insert works.
            // We need to generate placeholders like ($1, $2), ($3, $4)...

            const columnNames = columns.replace(/[()]/g, '').split(',');
            const colCount = columnNames.length;

            let placeholders = [];
            rows.forEach((row, rowIndex) => {
                const rowPlaceholders = [];
                for (let i = 1; i <= colCount; i++) {
                    rowPlaceholders.push(`$${(rowIndex * colCount) + i}`);
                }
                placeholders.push(`(${rowPlaceholders.join(',')})`);
            });

            const sql = `INSERT INTO ${table} ${columns} VALUES ${placeholders.join(',')}`;
            const flatValues = rows.flat();

            pool.query(sql, flatValues, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    },

    seedDemoData: async () => {
        const demoData = {
            internal: [
                { source: '100', destination: '200', date: '2024-01-15', time: '10:30:00', answerduration: '120', calltype: 'internal', soruceipport: 5061, destinationipport: 5191, connectednumber: '200', connectedipport: 5191, device_ip: '192.168.1.5' },
                { source: '101', destination: '201', date: '2024-01-15', time: '11:00:00', answerduration: '60', calltype: 'internal', soruceipport: 5062, destinationipport: 5192, connectednumber: '201', connectedipport: 5192, device_ip: '192.168.1.6' },
                { source: '102', destination: '202', date: '2024-01-15', time: '11:15:00', answerduration: '45', calltype: 'internal', soruceipport: 5063, destinationipport: 5193, connectednumber: '202', connectedipport: 5193, device_ip: '192.168.1.7' },
                { source: '103', destination: '203', date: '2024-01-15', time: '11:30:00', answerduration: '180', calltype: 'internal', soruceipport: 5064, destinationipport: 5194, connectednumber: '203', connectedipport: 5194, device_ip: '192.168.1.8' },
                { source: '104', destination: '204', date: '2024-01-15', time: '12:00:00', answerduration: '90', calltype: 'internal', soruceipport: 5065, destinationipport: 5195, connectednumber: '204', connectedipport: 5195, device_ip: '192.168.1.9' },
                { source: '105', destination: '205', date: '2024-01-15', time: '12:30:00', answerduration: '30', calltype: 'internal', soruceipport: 5066, destinationipport: 5196, connectednumber: '205', connectedipport: 5196, device_ip: '192.168.1.10' },
                { source: '106', destination: '206', date: '2024-01-15', time: '13:00:00', answerduration: '150', calltype: 'internal', soruceipport: 5067, destinationipport: 5197, connectednumber: '206', connectedipport: 5197, device_ip: '192.168.1.11' },
                { source: '107', destination: '207', date: '2024-01-15', time: '13:30:00', answerduration: '20', calltype: 'internal', soruceipport: 5068, destinationipport: 5198, connectednumber: '207', connectedipport: 5198, device_ip: '192.168.1.12' },
                { source: '108', destination: '208', date: '2024-01-15', time: '14:00:00', answerduration: '300', calltype: 'internal', soruceipport: 5069, destinationipport: 5199, connectednumber: '208', connectedipport: 5199, device_ip: '192.168.1.13' },
                { source: '109', destination: '209', date: '2024-01-15', time: '14:30:00', answerduration: '240', calltype: 'internal', soruceipport: 5070, destinationipport: 5200, connectednumber: '209', connectedipport: 5200, device_ip: '192.168.1.14' }
            ],
            incoming: [
                { source: '9876543210', destination: '100', date: '2024-01-16', time: '09:15:00', answerduration: '300', calltype: 'incoming', trunk: 'TrunkA', soruceipport: 5060, destinationipport: 5080, connectednumber: '100', connectedipport: 5080, holdduration: '10', speechduration: '290', device_ip: '192.168.1.20' },
                { source: '9876543211', destination: '101', date: '2024-01-16', time: '09:30:00', answerduration: '120', calltype: 'incoming', trunk: 'TrunkB', soruceipport: 5061, destinationipport: 5081, connectednumber: '101', connectedipport: 5081, holdduration: '5', speechduration: '115', device_ip: '192.168.1.21' },
                { source: '9876543212', destination: '102', date: '2024-01-16', time: '10:00:00', answerduration: '60', calltype: 'incoming', trunk: 'TrunkA', soruceipport: 5062, destinationipport: 5082, connectednumber: '102', connectedipport: 5082, holdduration: '0', speechduration: '60', device_ip: '192.168.1.22' },
                { source: '9876543213', destination: '103', date: '2024-01-16', time: '10:15:00', answerduration: '450', calltype: 'incoming', trunk: 'TrunkC', soruceipport: 5063, destinationipport: 5083, connectednumber: '103', connectedipport: 5083, holdduration: '20', speechduration: '430', device_ip: '192.168.1.23' },
                { source: '9876543214', destination: '104', date: '2024-01-16', time: '10:45:00', answerduration: '30', calltype: 'incoming', trunk: 'TrunkA', soruceipport: 5064, destinationipport: 5084, connectednumber: '104', connectedipport: 5084, holdduration: '0', speechduration: '30', device_ip: '192.168.1.24' },
                { source: '9876543215', destination: '105', date: '2024-01-16', time: '11:00:00', answerduration: '180', calltype: 'incoming', trunk: 'TrunkB', soruceipport: 5065, destinationipport: 5085, connectednumber: '105', connectedipport: 5085, holdduration: '15', speechduration: '165', device_ip: '192.168.1.25' },
                { source: '9876543216', destination: '106', date: '2024-01-16', time: '11:30:00', answerduration: '900', calltype: 'incoming', trunk: 'TrunkC', soruceipport: 5066, destinationipport: 5086, connectednumber: '106', connectedipport: 5086, holdduration: '60', speechduration: '840', device_ip: '192.168.1.26' },
                { source: '9876543217', destination: '107', date: '2024-01-16', time: '12:00:00', answerduration: '240', calltype: 'incoming', trunk: 'TrunkA', soruceipport: 5067, destinationipport: 5087, connectednumber: '107', connectedipport: 5087, holdduration: '10', speechduration: '230', device_ip: '192.168.1.27' },
                { source: '9876543218', destination: '108', date: '2024-01-16', time: '13:00:00', answerduration: '50', calltype: 'incoming', trunk: 'TrunkB', soruceipport: 5068, destinationipport: 5088, connectednumber: '108', connectedipport: 5088, holdduration: '5', speechduration: '45', device_ip: '192.168.1.28' },
                { source: '9876543219', destination: '109', date: '2024-01-16', time: '14:00:00', answerduration: '120', calltype: 'incoming', trunk: 'TrunkA', soruceipport: 5069, destinationipport: 5089, connectednumber: '109', connectedipport: 5089, holdduration: '0', speechduration: '120', device_ip: '192.168.1.29' }
            ],
            outgoing: [
                { source: '100', destination: '1234567890', date: '2024-01-16', time: '14:20:00', answerduration: '45', calltype: 'outgoing', trunk: 'TrunkA', soruceipport: 5060, destinationipport: 1234, connectednumber: '1234567890', connectedipport: 1234, device_ip: '192.168.1.40' },
                { source: '101', destination: '1234567891', date: '2024-01-16', time: '14:25:00', answerduration: '120', calltype: 'outgoing', trunk: 'TrunkB', soruceipport: 5061, destinationipport: 1235, connectednumber: '1234567891', connectedipport: 1235, device_ip: '192.168.1.41' },
                { source: '102', destination: '1234567892', date: '2024-01-16', time: '14:30:00', answerduration: '180', calltype: 'outgoing', trunk: 'TrunkA', soruceipport: 5062, destinationipport: 1236, connectednumber: '1234567892', connectedipport: 1236, device_ip: '192.168.1.42' },
                { source: '103', destination: '1234567893', date: '2024-01-16', time: '14:45:00', answerduration: '300', calltype: 'outgoing', trunk: 'TrunkC', soruceipport: 5063, destinationipport: 1237, connectednumber: '1234567893', connectedipport: 1237, device_ip: '192.168.1.43' },
                { source: '104', destination: '1234567894', date: '2024-01-16', time: '15:00:00', answerduration: '60', calltype: 'outgoing', trunk: 'TrunkA', soruceipport: 5064, destinationipport: 1238, connectednumber: '1234567894', connectedipport: 1238, device_ip: '192.168.1.44' },
                { source: '105', destination: '1234567895', date: '2024-01-16', time: '15:30:00', answerduration: '90', calltype: 'outgoing', trunk: 'TrunkB', soruceipport: 5065, destinationipport: 1239, connectednumber: '1234567895', connectedipport: 1239, device_ip: '192.168.1.45' },
                { source: '106', destination: '1234567896', date: '2024-01-16', time: '16:00:00', answerduration: '15', calltype: 'outgoing', trunk: 'TrunkA', soruceipport: 5066, destinationipport: 1240, connectednumber: '1234567896', connectedipport: 1240, device_ip: '192.168.1.46' },
                { source: '107', destination: '1234567897', date: '2024-01-16', time: '16:15:00', answerduration: '210', calltype: 'outgoing', trunk: 'TrunkC', soruceipport: 5067, destinationipport: 1241, connectednumber: '1234567897', connectedipport: 1241, device_ip: '192.168.1.47' },
                { source: '108', destination: '1234567898', date: '2024-01-16', time: '16:30:00', answerduration: '35', calltype: 'outgoing', trunk: 'TrunkB', soruceipport: 5068, destinationipport: 1242, connectednumber: '1234567898', connectedipport: 1242, device_ip: '192.168.1.48' },
                { source: '109', destination: '1234567899', date: '2024-01-16', time: '17:00:00', answerduration: '400', calltype: 'outgoing', trunk: 'TrunkA', soruceipport: 5069, destinationipport: 1243, connectednumber: '1234567899', connectedipport: 1243, device_ip: '192.168.1.49' }
            ]
        };

        const insertIfEmpty = async (table, data) => {
            try {
                const res = await pool.query(`SELECT count(*) as count FROM ${table}`);
                const count = parseInt(res.rows[0].count);

                if (count === 0) {
                    fileLogger.info(`Seeding demo data for ${table}...`);
                    const columns = Object.keys(data[0]);
                    const colNames = columns.join(',');

                    // Simple loop insert for demo data simplicity
                    for (const row of data) {
                        const values = Object.values(row);
                        const placeholders = values.map((_, i) => `$${i + 1}`).join(',');
                        await pool.query(`INSERT INTO ${table} (${colNames}) VALUES (${placeholders})`, values);
                    }
                }
            } catch (err) {
                fileLogger.error(`Error seeding ${table}:`, err.message);
            }
        };

        for (const table of Object.keys(demoData)) {
            await insertIfEmpty(table, demoData[table]);
        }
    },

    getDevices: () => {
        return new Promise((resolve, reject) => {
            pool.query("SELECT * FROM devices ORDER BY id ASC", (err, res) => {
                if (err) reject(err);
                else resolve(res.rows);
            });
        });
    },

    saveDevicesBulk: (devices) => {
        return new Promise(async (resolve, reject) => {
            const client = await pool.connect();
            try {
                await client.query('BEGIN');
                // for simplicity in this bulk replace logic: 
                // Iterate list:
                //   delete if id not present
                //   If id present -> Update
                //   If id not present -> Insert

                // Optional: Delete devices not in the list if we want full sync
                if (devices.length > 0) {
                    const ids = devices.filter(d => d.id).map(d => d.id);
                    if (ids.length > 0) {
                        await client.query("DELETE FROM devices WHERE NOT (id = ANY($1))", [ids]);
                    }
                } else {
                    // If list is empty, delete all devices
                    await client.query("DELETE FROM devices");
                }

                for (const device of devices) {
                    if (device.id) {
                        await client.query(
                            "UPDATE devices SET name=$1, ip=$2, incoming_port=$3, outgoing_port=$4, intercalls_port=$5 WHERE id=$6",
                            [device.name, device.ip, device.incomingPort, device.outgoingPort, device.intercallsPort, device.id]
                        );
                    } else {
                        await client.query(
                            "INSERT INTO devices (name, ip, incoming_port, outgoing_port, intercalls_port) VALUES ($1, $2, $3, $4, $5)",
                            [device.name, device.ip, device.incomingPort, device.outgoingPort, device.intercallsPort]
                        );
                    }
                }

                await client.query('COMMIT');
                resolve();
            } catch (e) {
                await client.query('ROLLBACK');
                reject(e);
            } finally {
                client.release();
            }
        });
    },

    runCustomQuery: (sql) => {
        return new Promise((resolve, reject) => {
            // Basic safety check: only allow SELECT statements for now to prevent AI from dropping tables
            if (!sql.trim().toLowerCase().startsWith('select')) {
                return reject(new Error("Only SELECT queries are allowed via AI chat."));
            }

            pool.query(sql, (err, res) => {
                if (err) reject(err);
                else resolve(res.rows);
            });
        });
    },

    initialize: async () => {

        const createTable = async (query) => {
            try {
                await pool.query(query);
            } catch (err) {
                fileLogger.error("Error creating table:", err.message);
            }
        };

        await createTable(`CREATE TABLE IF NOT EXISTS internal (
            sno SERIAL PRIMARY KEY,
            source VARCHAR(100),
            soruceipport INTEGER,
            destination VARCHAR(100),
            destinationipport INTEGER,
            connectednumber VARCHAR(100),
            connectedipport INTEGER,
            date DATE,  
            time TIME,
            answerduration INTEGER,
            calltype VARCHAR(45),
            device_ip VARCHAR(45))`);

        fileLogger.info('Internal Table check/creation done.');

        await createTable(`CREATE TABLE IF NOT EXISTS incoming (
            sno SERIAL PRIMARY KEY,
            source VARCHAR(100),
            soruceipport INTEGER,
            trunk VARCHAR(100),
            destination VARCHAR(100),
            destinationipport INTEGER,
            connectednumber VARCHAR(100),
            connectedipport INTEGER,
            date DATE,  
            time TIME,
            answerduration INTEGER,
            holdduration INTEGER,
            speechduration INTEGER,
            calltype VARCHAR(45),
            callcategory VARCHAR(45),
            device_ip VARCHAR(45))`);

        fileLogger.info('Incoming Table check/creation done.');

        await createTable(`CREATE TABLE IF NOT EXISTS outgoing (
            sno SERIAL PRIMARY KEY,
            source VARCHAR(100),
            soruceipport INTEGER,
            trunk VARCHAR(100),
            destination VARCHAR(100),
            destinationipport INTEGER,
            connectednumber VARCHAR(100),
            connectedipport INTEGER,
            date DATE,  
            time TIME,
            answerduration INTEGER,
            calltype VARCHAR(45),
            callcategory VARCHAR(45),
            device_ip VARCHAR(45))`);

        fileLogger.info('Outgoing Table check/creation done.');

        await createTable(`CREATE TABLE IF NOT EXISTS devices (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100),
            ip VARCHAR(45),
            incoming_port INT,
            outgoing_port INT,
            intercalls_port INT
        )`);
        fileLogger.info('Devices Table check/creation done.');


        const createIndexIfNotExists = async (table, column) => {
            try {
                const indexName = `idx_${table}_${column}`;
                await pool.query(`CREATE INDEX IF NOT EXISTS ${indexName} ON ${table} (${column})`);
                fileLogger.info(`Index ${indexName} checked/created.`);
            } catch (err) {
                fileLogger.error(`Error creating index on ${table} for ${column}:`, err.message);
            }
        };

        const tables = ['internal', 'incoming', 'outgoing'];
        const columns = ['source', 'destination', 'date'];

        for (const table of tables) {
            for (const col of columns) {
                await createIndexIfNotExists(table, col);
            }
        }

        await createTable(`CREATE TABLE IF NOT EXISTS users
            (id VARCHAR(100) PRIMARY KEY,
            password VARCHAR(100))`);

        fileLogger.info('Users Table check/creation done.');

        const sql = `INSERT INTO users (id, password) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`;
        try {
            await pool.query(sql, ['admin', '$2a$10$XVzr8KeSM6xAFbLcFYdaiebI93o3YGYAFs2p9MpJaCvxwiqMi.R6q']);
        } catch (err) {
            fileLogger.error(err.message);
        }

        //await DB.seedDemoData();
    }
};