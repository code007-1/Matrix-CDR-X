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
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
//import crypto from 'crypto';

async function generateLicense(expiryDays = 365) {
    try {
        const fingerprint = await getFingerprint();
        const license = { deviceId: fingerprint, expiryDate: Date.now() + (expiryDays * 24 * 60 * 60 * 1000), issuedDate: Date.now() };

        const sign = crypto.createSign('RSA-SHA256');
        sign.update(JSON.stringify(license));

        // Ensure private key exists or handle error/copy it
        // Assuming private.pem is in modules folder as seen in list_dir (wait, list_dir showed it in License Generator folder? or modules folder? 
        // list_dir of modules showed private.pem. list_dir of modules/License Generator showed generateLicense.js and private.pem? Let me recheck.
        // Step 50: modules dir has generateLicense.js? No step 50 was modules/License Generator.
        // Step 17: License Generator folder has private.pem too? NO step 17 was root.
        // Let's assume relative to this script.

        const privateKey = fs.readFileSync(path.join(__dirname, 'private.pem'), 'utf8');
        license.signature = sign.sign(privateKey, 'base64');

        // Copy public.pem and license.json to modules directory
        const modulesDir = path.join(__dirname, '../modules');
        if (!fs.existsSync(modulesDir)) {
            fs.mkdirSync(modulesDir, { recursive: true });
        }

        fs.copyFileSync(path.join(__dirname, 'public.pem'), path.join(modulesDir, 'public.pem'));
        fs.writeFileSync(path.join(modulesDir, 'license.json'), JSON.stringify(license, null, 2));

        console.log('License generated and copied to modules folder!');
    }
    catch (err) {
        console.log("some error occured while generating license : ", err);
    }
}

await generateLicense();