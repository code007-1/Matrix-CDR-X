import net from 'net';
import { incoming_cdr_table_name, internal_cdr_table_name, outgoing_cdr_table_name, ports } from '../statics.js'
import { db } from '../modules/db.js';
import winston from 'winston';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.simple()
    ),
    defaultMeta: { service: 'user-service' },
    transports: [
        //
        // - Write all logs with importance level of `error` or higher to `error.log`
        //   (i.e., error, fatal, but not other levels)
        //
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        //
        // - Write all logs with importance level of `info` or higher to `combined.log`
        //   (i.e., fatal, error, warn, and info, but not trace)
        //
        new winston.transports.File({ filename: 'combined.log' }),

        //new winston.transports.Console()
    ],
});

function Save(csv, name) {

    try {
        let columns = '(source, soruceipport, destination, destinationipport, connectednumber, connectedipport, date, time, answerduration, calltype)';
        //let values = `(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        if (name === "incoming") {
            columns = '(source, soruceipport, trunk, destination, destinationipport, connectednumber, connectedipport, date, time, answerduration, holdduration, speechduration, calltype)';
            //values = `(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        }
        else if (name === "outgoing") {
            columns = '(source, soruceipport, trunk, destination, destinationipport, connectednumber, connectedipport, date, time, answerduration, calltype)';
            //values = `(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        }

        //let sql = `INSERT INTO ${name} ${columns} VALUES ${values}`;
        let sql = `INSERT INTO ${name} ${columns} VALUES ${csv}`;
        //let params = ['445', '', '424', '', '424', '', '27-12-2005', '07:38:11', '16', ''];

        //db.run(sql, csv, function (err) {
        db.query(sql, function (error) {
            if (error) {
                logger.error({ "message": error });
                //return logger.error(err.message);
            }
            logger.info(`rows has been inserted`);
        });
        //logger.log(sql);
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
        return d.map(element => element.replace(/\s+/g, ' ').trimEnd().split(' '));
    }
    catch (error) {
        logger.error({ message: 'error occured while splitting data', error: error });
    }
}

function ParseInternal(data) {
    try {
        const e = SplitData(data);

        let csv = '';
        e.forEach(d => {
            if (!d.some(el => el === undefined)) {
                const [da, m, y] = d[3].split('-');
                const date = `${y}-${m}-${da}`;
                csv += `('${d[1]}', '', '${d[2]}', '', '${d[2]}', '', '${date}', '${d[4]}', '${d[5]}', 'INT'),`;
            }
        });
        csv = csv.substring(0, csv.length - 1);
        Save(csv, internal_cdr_table_name);

    }
    catch (error) {
        logger.error({ message: 'error while parsing internal data', error: error });
    }
}

function ParseIncoming(data) {
    try {
        const e = SplitData(data);

        let csv = '';
        e.forEach(d => {
            if (!d.some(el => el === undefined)) {
                const [da, m, y] = d[5].split('-');
                const date = `20${y}-${m}-${da}`;
                csv += `('${d[2]}', '', '${d[3]}', '${d[4]}', '', '${d[4]}', '', '${date}', '${d[6]}', '${d[7]}', '${d[8]}', '${d[8]}', 'INC'),`;
            }
        });
        csv = csv.substring(0, csv.length - 1);
        Save(csv, incoming_cdr_table_name);
    }
    catch (error) {
        logger.error({ message: 'error while parsing incoming data', error: error });
    }
}

function ParseOutgoing(data) {
    try {
        const e = SplitData(data);
        let csv = '';

        e.forEach(d => {
            if (!d.some(el => el === undefined)) {
                const [da, m, y] = d[5].split('-');

                const date = `20${y}-${m}-${da}`;
                csv += `('${d[1]}', '', '${d[3]}', '${d[4]}', '', '${d[4]}', '', '${date}', '${d[6]}', '${d[7]}', 'OUT'),`;
            }
        });
        csv = csv.substring(0, csv.length - 1);
        //console.log("outgoing : ", csv, " and ", e);
        Save(csv, outgoing_cdr_table_name);
    }
    catch (error) {
        logger.error({ message: 'error while parsing outgoing data', error: error });
    }
}

function StartServer() {
    try {
        ports.forEach(element => {
            const server = net.createServer((socket) => {
                logger.info('Client connected');

                socket.on('data', (data) => {
                    logger.info(`Received data on port : ${element} : ${data.toString()}`);
                    if (element === ports[0]) ParseInternal(data.toString());
                    else if (element === ports[1]) ParseIncoming(data.toString());
                    else if (element === ports[2]) ParseOutgoing(data.toString());
                });

                socket.on('end', () => {
                    logger.info('Client disconnected');
                    writeStream.end();
                });

                socket.on('error', (err) => {
                    logger.error(`Socket error: ${err}`);
                });
            });

            server.listen(element, () => {
                logger.info(`Server listening on port ${element}`);
            });
        });
    }
    catch (error) {
        logger.error({ message: "Some Error happend while starting server", error: error });
    }
}

//CreateDB();
StartServer();

//let data = "IN         2002             2001        27-12-2005  05:43:06      6"; //internal
//ParseInternal(data);
//data = '     48                  C017    2001 27-12-05   07:04:07   6   0    74'; //incoming
//ParseIncoming(data);
//data = '2001 000 C017 7669976652         27-12-05 06:32:23    12    1    1.10  D'; //outgoing
//ParseOutgoing(data);


//const a = `IN         2844             2837        19-10-2024  10:45:12     15`;

//ParseInternal(a);