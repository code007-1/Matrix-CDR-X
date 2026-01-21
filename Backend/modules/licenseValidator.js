// fingerprint.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import si from 'systeminformation';
import pkg from 'node-machine-id';
const { machineIdSync } = pkg;
import crypto from 'crypto';
import { consoleLogger } from './prod_logger.js';

async function getFingerprint() {
    const cpu = await si.cpu();
    const motherboard = await si.baseboard();
    const id = machineIdSync();

    const raw = `${cpu.brand}-${motherboard.serial}-${id}`;
    return crypto.createHash('sha256').update(raw).digest('hex');
}

export async function validateLicense() {
    if (process.env.DOCKER_ENV === 'true' || process.env.SKIP_LICENSE_CHECK === 'true') {
        console.log("Skipping license check (Docker/Env override)");
        return;
    }

    try {
        // Use process.cwd() to ensure paths work correctly in webpack builds
        // Files should be in the modules directory relative to project root
        const licensePath = path.join(process.cwd(), 'modules', 'license.json');
        const publicKeyPath = path.join(process.cwd(), 'modules', 'public.pem');

        const license = JSON.parse(fs.readFileSync(licensePath, 'utf8'));
        const publicKey = fs.readFileSync(publicKeyPath, 'utf8');
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
        consoleLogger.error("some error occured while validating license : ", error);
        throw new Error('error occured while validating license');
    }
}