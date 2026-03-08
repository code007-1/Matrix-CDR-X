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
        new winston.transports.File({ filename: 'save_cdr_logs.log' }),
    ],
});

const activePorts = new Set();

async function Save(rows, name) {

    try {
        let columns = '(source, soruceipport, destination, destinationipport, connectednumber, connectedipport, date, time, answerduration, calltype, device_ip)';
        //let values = `(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        if (name === "incoming") {
            columns = '(source, soruceipport, trunk, destination, destinationipport, connectednumber, connectedipport, date, time, answerduration, holdduration, speechduration, calltype, callcategory, device_ip)';
            //values = `(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        }
        else if (name === "outgoing") {
            columns = '(source, soruceipport, trunk, destination, destinationipport, connectednumber, connectedipport, date, time, answerduration, calltype, device_ip)';
            //values = `(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        }

        await DB.insertBatch(name, columns, rows);
        //logger.info(`\nrows has been inserted`);
    }
    catch (error) {
        logger.error({ message: '\nerror occured while savind data to db', error: error });
        //return response.status(500).send(error);
    }
}

function SplitData(data) {
    try {
        let d = data.split('\n');
        // Remove empty last line if present
        if (d[d.length - 1].trim() === '') {
            d.pop();
        }
        return d;
    }
    catch (error) {
        logger.error({ message: '\nerror occured while splitting data', error: error, data: data });
        return [];
    }
}

// Dynamic extraction logic that parses substring until next space occurrence
function getFieldDynamic(line, shift, startColumnStr, originalLength) {
    const startIdx = parseInt(startColumnStr, 10) - 1 + shift;
    if (startIdx < 0 || startIdx >= line.length) return null;

    let val = '';
    let foundChar = false;
    for (let i = startIdx; i < line.length; i++) {
        if (line[i] !== ' ') {
            foundChar = true;
            val += line[i];
        } else {
            if (foundChar) break;
            if (i - startIdx >= originalLength) break;
        }
    }
    return val.replace(/'/g, "''") || null;
}

// Retrieve dynamic offset based on anchor expected starting column
function getDateShift(line, expectedColumn) {
    const dateMatch = line.match(/\d{2}-\d{2}-\d{2,4}/);
    if (dateMatch) {
        const actualDateIndex = dateMatch.index;
        const expectedDateIndex = expectedColumn - 1;
        return actualDateIndex - expectedDateIndex;
    }
    return 0;
}

function ParseInternal(data, deviceIp) {
    try {
        const lines = SplitData(data);
        let rows = [];

        lines.forEach(line => {
            if (line.trim() === '') return;

            // Extract shift dynamically from Date (DD-MM-YYYY) anchoring around Col 41 (from user input)
            const shift = getDateShift(line, 41);

            const source = getFieldDynamic(line, shift, "06", 16);
            const destination = getFieldDynamic(line, shift, "29", 6);
            const dateRaw = getFieldDynamic(line, shift, "41", 10);
            const time = getFieldDynamic(line, shift, "53", 8);
            const answerDur = getFieldDynamic(line, shift, "66", 5);

            if (!dateRaw || dateRaw.indexOf('-') === -1) {
                logger.error({ message: '\nmalformed date', data: line, deviceIp: deviceIp });
                return; // skip malformed lines
            }

            let [da, m, y] = dateRaw.split('-');
            if (y && y.length === 2) y = "20" + y; // Ensure 4 digit year
            const date = `${y}-${m}-${da}`;

            rows.push([
                source,                           // source
                null,                             // soruceipport
                destination,                      // destination
                null,                             // destinationipport
                destination,                      // connectednumber
                null,                             // connectedipport
                date,                             // date
                time,                             // time
                answerDur ? parseInt(answerDur, 10) : 0, // answerduration
                'INT',                            // calltype
                deviceIp                          // device_ip
            ]);
        });

        if (rows.length > 0) {
            Save(rows, internal_cdr_table_name);
        }
    }
    catch (error) {
        logger.error({ message: '\nerror while parsing internal data', error: error, data: data, deviceIp: deviceIp });
    }
}

function ParseIncoming(data, deviceIp) {
    try {
        const lines = SplitData(data);
        let rows = [];

        lines.forEach(line => {
            if (line.trim() === '') return;

            // Anchor Shift logic!
            // Find the EXACT position of the Date (DD-MM-YYYY or DD-MM-YY), supposed to be at Col 36 (index 35). 
            // This anchors all extracts so we handle missing spaces or deliberately shifted inputs gracefully.
            const shift = getDateShift(line, 36);

            const source = getFieldDynamic(line, shift, "06", 16);
            const trunk = getFieldDynamic(line, shift, "23", 5);
            const destination = getFieldDynamic(line, shift, "29", 6);
            const dateRaw = getFieldDynamic(line, shift, "36", 10); // DD-MM-YYYY
            const time = getFieldDynamic(line, shift, "47", 10);    // HH:MM:SS
            const answerDur = getFieldDynamic(line, shift, "56", 5);
            const holdDur = getFieldDynamic(line, shift, "60", 5);
            const speechDur = getFieldDynamic(line, shift, "64", 5);
            const callcategory = getFieldDynamic(line, shift, "70", 5); // Extract 'U', 'DU', 'Q' etc from Remarks

            if (!dateRaw || dateRaw.indexOf('-') === -1) {
                logger.error({ message: '\nmalformed date', data: line, deviceIp: deviceIp });
                return; // skip malformed lines
            }

            let [da, m, y] = dateRaw.split('-');
            if (y && y.length === 2) y = "20" + y;
            const date = `${y}-${m}-${da}`;

            rows.push([
                source,                           // source
                null,                             // soruceipport
                trunk,                            // trunk
                destination,                      // destination
                null,                             // destinationipport
                destination,                      // connectednumber
                null,                             // connectedipport
                date,                             // date
                time,                             // time
                answerDur ? parseInt(answerDur, 10) : 0, // answerduration
                holdDur ? parseInt(holdDur, 10) : 0,     // holdduration
                speechDur ? parseInt(speechDur, 10) : 0, // speechduration
                'INC',                            // calltype
                callcategory,                     // callcategory
                deviceIp                          // device_ip
            ]);
        });

        if (rows.length > 0) {
            Save(rows, incoming_cdr_table_name);
        }
    }
    catch (error) {
        logger.error({ message: '\nerror while parsing incoming data', error: error, data: data, deviceIp: deviceIp });
    }
}

function ParseOutgoing(data, deviceIp) {
    try {
        const lines = SplitData(data);
        let rows = [];

        lines.forEach(line => {
            if (line.trim() === '') return;

            // Anchor Shift logic based on Date!
            // Format string: "3258   3137 000 P004 919711369191       19-01-26 20:28:12    39    0    0.00  U"
            // Date is typically expected around index 41.
            const shift = getDateShift(line, 42); // expectedColumn=42 (index 41)

            // Indices based on: "3258   3137 000 P004 919711369191       19-01-26 20:28:12    39    0    0.00  U"
            // Ignore: 0-6
            const source = getFieldDynamic(line, shift, "8", 4);       // "3137" 
            const trunk = getFieldDynamic(line, shift, "17", 4);       // "P004"
            const destination = getFieldDynamic(line, shift, "22", 16); // "919711369191"
            const dateRaw = getFieldDynamic(line, shift, "42", 8);     // "19-01-26"
            const time = getFieldDynamic(line, shift, "51", 8);        // "20:28:12"
            const answerDur = getFieldDynamic(line, shift, "60", 5);   // "39"
            const calltype2 = getFieldDynamic(line, shift, "79", 2);   // "U"

            if (!dateRaw || dateRaw.indexOf('-') === -1) {
                logger.error({ message: '\nmalformed date', data: line, deviceIp: deviceIp });
                return; // skip malformed lines
            }

            let [da, m, y] = dateRaw.split('-');
            if (y && y.length === 2) y = "20" + y;
            const date = `${y}-${m}-${da}`;

            rows.push([
                source,                           // source
                null,                             // soruceipport
                trunk,                            // trunk
                destination,                      // destination
                null,                             // destinationipport
                destination,                      // connectednumber
                null,                             // connectedipport
                date,                             // date
                time,                             // time
                answerDur ? parseInt(answerDur, 10) : 0, // answerduration
                'OUT',                            // calltype
                calltype2,                        // calltype2
                deviceIp                          // device_ip
            ]);
        });

        if (rows.length > 0) {
            Save(rows, outgoing_cdr_table_name);
        }
    }
    catch (error) {
        logger.error({ message: '\nerror while parsing outgoing data', error: error, data: data, deviceIp: deviceIp });
    }
}

// Function to start server for a specific port and type
function StartSocketServer(port, type) {
    try {
        const server = net.createServer((socket) => {
            const clientIp = socket.remoteAddress.split(':').pop();
            logger.info(`\nClient connected => ${clientIp} on port ${port} (${type})`);

            socket.on('data', (data) => {
                //logger.info(`Received data on port => ${port} from ${socket.remoteAddress} : ${data.toString()}`);
                if (type === 'internal') ParseInternal(data.toString(), clientIp);
                else if (type === 'incoming') ParseIncoming(data.toString(), clientIp);
                else if (type === 'outgoing') ParseOutgoing(data.toString(), clientIp);
            });

            socket.on('end', () => {
                logger.info(`\nClient disconnected from port ${port}`);
            });

            socket.on('error', (err) => {
                logger.error(`\nSocket error on port ${port}: ${err}`);
            });
        });

        server.listen(port, () => {
            console.log(`Server listening on port ${port} for ${type} calls`);
        });

        return server;
    } catch (error) {
        logger.error({ message: `\nError starting server on port ${port}`, error: error });
    }
}

export async function StartServer() {
    try {
        const devices = await DB.getDevices();

        if (!devices || devices.length === 0) {
            logger.warn("\nNo devices found in database. Starting default ports from statics if needed, or doing nothing.");
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
        logger.error({ message: "\nSome Error happened while starting servers from DB", error: error });
    }
}

// // Ensure DB is ready? Pool connects on query.
// // StartServers
// const internal = `
// IN         6739             3647        16-01-2026  10:20:34      6
// IN         6516             6636        16-01-2026  10:20:38     11
// IN         3390             3689        16-01-2026  10:22:00     19
// IN         6739             3647        16-01-2026  10:24:15      6
// IN         3150             3130        16-01-2026  10:25:21     10
// IN         3320             3424        16-01-2026  10:24:59     35
// IN         3574             3217        16-01-2026  10:24:37     51
// IN         3101             3145        16-01-2026  10:25:28     29
// IN         3150             3131        16-01-2026  10:25:53     16
// IN         3122             3126        16-01-2026  10:28:39     18
// IN         3574             3212        16-01-2026  10:30:15     23
// IN         3150             3130        16-01-2026  10:32:25     19
// IN         3132             3126        16-01-2026  10:32:53     38
// IN         3369             3495        16-01-2026  10:33:21     26
// IN         3150             3130        16-01-2026  10:34:31     10`
// const format = 'ignore  source ignore trunk destination date time answerduration ignore ignore ignore';
// const outgoing = `
// 3255   3333 000 P004 4172               19-01-26 20:24:01    21    0    0.00  I
// 3256   6455 000 P008 1605               19-01-26 20:27:35     7    0    0.00  I
// 3257   3356 000 P005 4842               19-01-26 20:27:19    29    0    0.00  I
// 3258   3137 000 P004 919711369191       19-01-26 20:28:12    39    0    0.00  U
// 3259   6423 000 P005 4847               19-01-26 20:29:52    20    0    0.00  I
// 3260   3715 000 P005 4834               19-01-26 20:31:30    36    0    0.00  I
// 3261   P004 000 P007 7904               19-01-26 20:31:39    86    1    1.10 GI
// 3262   3715 000 P005 4827               19-01-26 20:35:01    41    0    0.00  I
// 3263   P002 000 P005 4438               19-01-26 20:35:45    48    1    1.10 GI
// 3264   P001 000 P005 4355               19-01-26 20:36:41    48    1    1.10 GI
// 3265   6423 000 P005 4847               19-01-26 20:38:37    32    0    0.00  I
// 3266   P002 000 P005 4824               19-01-26 20:39:29     1    1    1.10 GI
// 3267   P003 000 P005 4780               19-01-26 20:39:28    20    1    1.10 GI
// 3268   P005 000 P008 1608               19-01-26 20:39:52    12    1    1.10 GI
// 3269   P001 000 P005 4824               19-01-26 20:39:55    26    1    1.10 GI
// 3270   3550 000 P005 4283               19-01-26 20:40:37    52    0    0.00  I
// 3271   3356 000 P005 4624               19-01-26 20:42:22    12    0    0.00  I
// 3272   3614 000 P004 4132               19-01-26 20:44:24     6    0    `;

// const incoming = `7663 9999163549       P003         15-01-26   11:15:52   1   0     0 U
//  7664 9999163549       P002         15-01-26   11:16:01   1   0     0 U
//  7665 9811848957       P001         15-01-26   11:16:05   1   0     0 U
//  7666 9999163549       P003         15-01-26   11:16:32   1   0     0 U
//  7667 4851             P005    3666 15-01-26   11:16:42  10   0     7 Q
//  7668 4117             P004    3111 15-01-26   11:16:42   6   0    17 Q
//  7669 4597             P005    3372 15-01-26   11:16:41   3   0    31 Q
//  7670 4129             P004    3614 15-01-26   11:16:57   7   0    12 Q
//  7671 7982716777       P003    P005 15-01-26   11:17:13   2   0     0 G
//  7672 3849             P005    3474 15-01-26   11:17:02   8   0    21 Q
//  7673 6106             P004    3580 15-01-26   11:15:56  13   0    88 Q
//  7674 4829             P005    6539 15-01-26   11:16:41   6   0    65 Q
//  7675 8220521607       P002    P005 15-01-26   11:16:46   7   0    65 G
//  7676 3876             P005    3235 15-01-26   11:17:06  13   0    52 Q
//  7677 919810640260     P001    *736 15-01-26   11:16:46  94   0     0 DU
//  7678 3987             P005    3372 15-01-26   11:18:21   3   0    14 Q
//  7679 4261             P005    6635 15-01-26   11:18:44   5   0    10 Q
//  7680 9725064034       P001    P005 15-01-26   11:18:29  48   0     0 U
// 7793 6395218143       P002         15-01-26   11:36:59   1   0     0 U
// `;

// //StartServer();
// //ParseOutgoing(outgoing);
// //ParseInternal(internal);
// //ParseIncoming(incoming);