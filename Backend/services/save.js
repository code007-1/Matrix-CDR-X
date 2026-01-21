import net from 'net';
import { incoming_cdr_table_name, internal_cdr_table_name, outgoing_cdr_table_name } from '../statics.js'
import { DB } from '../modules/db.js';
import winston from 'winston';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.simple()
    ),
    defaultMeta: { service: 'save-service' },
    transports: [
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});

const activePorts = new Set();

async function Save(rows, name) {

    try {
        let columns = '(source, soruceipport, destination, destinationipport, connectednumber, connectedipport, date, time, answerduration, calltype, device_ip)';
        //let values = `(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        if (name === "incoming") {
            columns = '(source, soruceipport, trunk, destination, destinationipport, connectednumber, connectedipport, date, time, answerduration, holdduration, speechduration, calltype, device_ip)';
            //values = `(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        }
        else if (name === "outgoing") {
            columns = '(source, soruceipport, trunk, destination, destinationipport, connectednumber, connectedipport, date, time, answerduration, calltype, device_ip)';
            //values = `(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        }

        await DB.insertBatch(name, columns, rows);
        logger.info(`rows has been inserted`);
    }
    catch (error) {
        logger.error({ message: 'error occured while savind data to db', error: error });
        //return response.status(500).send(error);
    }
}

function SplitData(data) {
    try {
        let d = data.split('\n');
        if (d[d.length - 1] == '')
            d.pop();
        return d.map(element => element.replace(/\s+/g, ' ').trimEnd().split(' ').map(s => s.replace(/'/g, "''")));
    }
    catch (error) {
        logger.error({ message: 'error occured while splitting data', error: error });
    }
}

function ParseInternal(data, deviceIp) {
    try {
        const e = SplitData(data);

        let rows = [];
        e.forEach(d => {
            if (!d.some(el => el === undefined)) {
                const [da, m, y] = d[3].split('-');
                const date = `${y}-${m}-${da}`;
                //csv += `('${d[1]}', '', '${d[2]}', '', '${d[2]}', '', '${date}', '${d[4]}', '${d[5]}', 'INT'),`;
                rows.push([d[1], '', d[2], '', d[2], '', date, d[4], d[5], 'INT', deviceIp]);
            }
        });

        Save(rows, internal_cdr_table_name);

    }
    catch (error) {
        logger.error({ message: 'error while parsing internal data', error: error });
    }
}

function ParseIncoming(data, deviceIp) {
    try {
        const e = SplitData(data);

        let rows = [];
        e.forEach(d => {
            if (!d.some(el => el === undefined)) {
                const [da, m, y] = d[5].split('-');
                const date = `20${y}-${m}-${da}`;
                //csv += `('${d[2]}', '', '${d[3]}', '${d[4]}', '', '${d[4]}', '', '${date}', '${d[6]}', '${d[7]}', '${d[8]}', '${d[8]}', 'INC'),`;
                rows.push([d[2], '', d[3], d[4], '', d[4], '', date, d[6], d[7], d[8], d[8], 'INC', deviceIp]);
            }
        });

        Save(rows, incoming_cdr_table_name);
    }
    catch (error) {
        logger.error({ message: 'error while parsing incoming data', error: error });
    }
}

function ParseOutgoing(data, deviceIp) {
    try {
        const e = SplitData(data);
        let rows = [];

        e.forEach(d => {
            if (!d.some(el => el === undefined)) {
                const [da, m, y] = d[5].split('-');

                const date = `20${y}-${m}-${da}`;
                //csv += `('${d[1]}', '', '${d[3]}', '${d[4]}', '', '${d[4]}', '', '${date}', '${d[6]}', '${d[7]}', 'OUT'),`;
                rows.push([d[1], '', d[3], d[4], '', d[4], '', date, d[6], d[7], 'OUT', deviceIp]);
            }
        });

        //console.log("outgoing : ", csv, " and ", e);
        Save(rows, outgoing_cdr_table_name);
    }
    catch (error) {
        logger.error({ message: 'error while parsing outgoing data', error: error });
    }
}

// Function to start server for a specific port and type
function StartSocketServer(port, type) {
    try {
        const server = net.createServer((socket) => {
            logger.info(`Client connected => ${socket.remoteAddress} on port ${port} (${type})`);

            socket.on('data', (data) => {
                console.info(`Received data on port => ${port} from ${socket.remoteAddress} : ${data.toString()}`);
                if (type === 'internal') ParseInternal(data.toString(), socket.remoteAddress);
                else if (type === 'incoming') ParseIncoming(data.toString(), socket.remoteAddress);
                else if (type === 'outgoing') ParseOutgoing(data.toString(), socket.remoteAddress);
            });

            socket.on('end', () => {
                logger.info(`Client disconnected from port ${port}`);
            });

            socket.on('error', (err) => {
                logger.error(`Socket error on port ${port}: ${err}`);
            });
        });

        server.listen(port, () => {
            console.log(`Server listening on port ${port} for ${type} calls`);
        });

        return server;
    } catch (error) {
        logger.error({ message: `Error starting server on port ${port}`, error: error });
    }
}

export async function StartServer() {
    try {
        // Fetch all devices from DB
        // Note: DB.getDevices() might not be available if imported directly if it relies on pool which might perform async init?
        // But DB is exported object with methods.
        // We need to wait for DB to be potentially ready or just call query.

        const devices = await DB.getDevices();

        if (!devices || devices.length === 0) {
            logger.warn("No devices found in database. Starting default ports from statics if needed, or doing nothing.");
            // Optional: Fallback to static ports if desired, but user generic request implies using DB.
            return;
        }

        devices.forEach(device => {
            if (device.incoming_port) {
                if (!activePorts.has(device.incoming_port)) {
                    StartSocketServer(device.incoming_port, 'incoming');
                    activePorts.add(device.incoming_port);
                }
            }
            if (device.outgoing_port) {
                if (!activePorts.has(device.outgoing_port)) {
                    StartSocketServer(device.outgoing_port, 'outgoing');
                    activePorts.add(device.outgoing_port);
                }
            }
            if (device.intercalls_port) {
                if (!activePorts.has(device.intercalls_port)) {
                    StartSocketServer(device.intercalls_port, 'internal');
                    activePorts.add(device.intercalls_port);
                }
            }
        });

    }
    catch (error) {
        logger.error({ message: "Some Error happened while starting servers from DB", error: error });
    }
}

// Ensure DB is ready? Pool connects on query.
// StartServers
//StartServer();