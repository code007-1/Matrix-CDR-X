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
                { source: '100', destination: '200', date: '2024-01-15', time: '10:30:00', answerduration: '120', calltype: 'internal', soruceipport: '192.168.1.10', destinationipport: '192.168.1.11', connectednumber: '200', connectedipport: '192.168.1.11' },
                { source: '101', destination: '201', date: '2024-01-15', time: '11:00:00', answerduration: '60', calltype: 'internal', soruceipport: '192.168.1.12', destinationipport: '192.168.1.13', connectednumber: '201', connectedipport: '192.168.1.13' }
            ],
            incoming: [
                { source: '9876543210', destination: '100', date: '2024-01-16', time: '09:15:00', answerduration: '300', calltype: 'incoming', trunk: 'TrunkA', soruceipport: '1.2.3.4', destinationipport: '192.168.1.10', connectednumber: '100', connectedipport: '192.168.1.10', holdduration: '10', speechduration: '290' }
            ],
            outgoing: [
                { source: '100', destination: '1234567890', date: '2024-01-16', time: '14:20:00', answerduration: '45', calltype: 'outgoing', trunk: 'TrunkA', soruceipport: '192.168.1.10', destinationipport: '5.6.7.8', connectednumber: '1234567890', connectedipport: '5.6.7.8' }
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

    initialize: async () => {
        const createTable = async (query) => {
            try {
                await pool.query(query);
            } catch (err) {
                fileLogger.error("Error creating table:", err.message);
            }
        };

        const addColumnIfNotExists = async (table, columnDefinition) => {
            try {
                await pool.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${columnDefinition}`);
            } catch (err) {
                // If the error is not about the column already existing (which IF NOT EXISTS caches), log it.
                fileLogger.error(`Error adding column to ${table}:`, err.message);
            }
        };

        await createTable(`CREATE TABLE IF NOT EXISTS internal (
            sno SERIAL PRIMARY KEY,
            source VARCHAR(100),
            soruceipport VARCHAR(100),
            destination VARCHAR(100),
            destinationipport VARCHAR(100),
            connectednumber VARCHAR(100),
            connectedipport VARCHAR(100),
            date VARCHAR(100),  
            time VARCHAR(100),
            answerduration VARCHAR(100),
            calltype VARCHAR(100),
            device_ip VARCHAR(45))`);

        await addColumnIfNotExists('internal', 'device_ip VARCHAR(45)');

        fileLogger.info('Internal Table check/creation done.');

        await createTable(`CREATE TABLE IF NOT EXISTS incoming (
            sno SERIAL PRIMARY KEY,
            source VARCHAR(100),
            soruceipport VARCHAR(100),
            trunk VARCHAR(100),
            destination VARCHAR(100),
            destinationipport VARCHAR(100),
            connectednumber VARCHAR(100),
            connectedipport VARCHAR(100),
            date VARCHAR(100),  
            time VARCHAR(100),
            answerduration VARCHAR(100),
            holdduration VARCHAR(100),
            speechduration VARCHAR(100),
            calltype VARCHAR(100),
            device_ip VARCHAR(45))`);

        await addColumnIfNotExists('incoming', 'device_ip VARCHAR(45)');

        fileLogger.info('Incoming Table check/creation done.');

        await createTable(`CREATE TABLE IF NOT EXISTS outgoing (
            sno SERIAL PRIMARY KEY,
            source VARCHAR(100),
            soruceipport VARCHAR(100),
            trunk VARCHAR(100),
            destination VARCHAR(100),
            destinationipport VARCHAR(100),
            connectednumber VARCHAR(100),
            connectedipport VARCHAR(100),
            date VARCHAR(100),  
            time VARCHAR(100),
            answerduration VARCHAR(100),
            calltype VARCHAR(100),
            device_ip VARCHAR(45))`);

        await addColumnIfNotExists('outgoing', 'device_ip VARCHAR(45)');

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