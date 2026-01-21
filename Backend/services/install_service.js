import { Service } from 'node-windows';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a new service object
const svc = new Service({
    name: 'CDR-X Server',
    description: 'CDR-X Backend Server',
    script: path.join(__dirname, 'dist', 'bundle.js'), // Use bundled file
    nodeOptions: [
        '--harmony',
        '--max_old_space_size=4096'
    ]
    //, workingDirectory: '...'
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install', function () {
    svc.start();
});

svc.install();
