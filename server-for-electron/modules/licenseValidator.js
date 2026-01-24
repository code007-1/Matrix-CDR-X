// fingerprint.js
import fs from 'fs';
import si from 'systeminformation';
import pkg from 'node-machine-id';
const { machineIdSync } = pkg;
import crypto from 'crypto';

async function getFingerprint() {
    const cpu = await si.cpu();
    const motherboard = await si.baseboard();
    const id = machineIdSync();

    const raw = `${cpu.brand}-${motherboard.serial}-${id}`;
    return crypto.createHash('sha256').update(raw).digest('hex');
}

export async function validateLicense() {
    try {
        const license = JSON.parse(fs.readFileSync('G:/executable/server/modules/license.json', 'utf8'));
        const publicKey = fs.readFileSync('G:/executable/server/modules/public.pem', 'utf8');
        const fingerprint = await getFingerprint();

        if (license.deviceId !== fingerprint) {
            throw new Error('Device mismatch');
        }

        if (new Date(license.expiryDate) < Date.now()) {
            throw new Error('License expired');
        }

        const { signature, ...dataToVerify } = license;
        const verify = crypto.createVerify('RSA-SHA256');
        verify.update(JSON.stringify(dataToVerify));

        if (!verify.verify(publicKey, signature, 'base64')) {
            throw new Error('Invalid signature');
        }
        //console.log('License is valid. Features:', license);
        return;
    }
    catch (error) {
        console.log("some error occured while validating license : ", error);
        throw new Error('error occured while validating license');
    }
}