import express from 'express';
import { DB } from '../modules/db.js';
import { fileLogger } from '../modules/prod_logger.js';
import { access_key_verification } from './login.js';
import { StartServer } from '../services/save.js';

const router = express.Router();

// Get all devices
router.get('/', access_key_verification, async (req, res) => {
    try {
        const devices = await DB.getDevices();
        if (devices.length === 0)
            return res.status(200).json([]);

        // Rename keys to match frontend expectation (camelCase)
        const formattedDevices = devices.map(d => ({
            id: d.id,
            name: d.name,
            ip: d.ip,
            incomingPort: d.incoming_port,
            outgoingPort: d.outgoing_port,
            intercallsPort: d.intercalls_port
        }));
        res.json(formattedDevices);
    } catch (error) {
        fileLogger.error("Error fetching devices:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Bulk save devices (Insert or Update)
router.post('/bulk', access_key_verification, async (req, res) => {
    const { devices } = req.body;
    if (!Array.isArray(devices)) {
        return res.status(400).json({ error: "Invalid data format. Expected an array of devices." });
    }

    try {
        await DB.saveDevicesBulk(devices);
        StartServer();
        res.status(200).send({ message: "Devices saved successfully" });
    } catch (error) {
        fileLogger.error("Error saving devices:", error);
        res.status(500).send({ error: "Failed to save devices" });
    }
});

export default router;
