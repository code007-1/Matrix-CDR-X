// fingerprint.js
import si from 'systeminformation';
import pkg from 'node-machine-id';
const { machineIdSync } = pkg;
import crypto from 'crypto';

async function getFingerprint() {
    const cpu = await si.cpu();
    const motherboard = await si.baseboard();
    const id = machineIdSync();

    const raw = `${cpu.brand}-${motherboard.serial}-${id}`;
    //console.log("Fingerprint raw data: ", id);
    return crypto.createHash('sha256').update(raw).digest('hex');
}

/*getFingerprint().then(fingerprint => {
    console.log("Machine Fingerprint: ", fingerprint);
}).catch(err => {
    console.error("Error generating fingerprint: ", err);
});*/

// generateLicense.js
import fs from 'fs';
//import crypto from 'crypto';

async function generateLicense(expiryDays = 365) {
    try {
        const fingerprint = await getFingerprint();
        const license = { deviceId: fingerprint, expiryDate: Date.now() + (expiryDays * 24 * 60 * 60 * 1000), issuedDate: Date.now() };

        const sign = crypto.createSign('RSA-SHA256');
        sign.update(JSON.stringify(license));
        const privateKey = fs.readFileSync('./private.pem', 'utf8');
        license.signature = sign.sign(privateKey, 'base64');

        fs.writeFileSync('./license.json', JSON.stringify(license, null, 2));
        console.log('License generated!');
    }
    catch (err) {
        console.log("some error occured while generating license : ", err);
    }
}

await generateLicense();