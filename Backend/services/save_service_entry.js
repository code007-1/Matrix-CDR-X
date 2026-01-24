import { validateLicense } from '../modules/licenseValidator.js';
import { consoleLogger } from '../modules/prod_logger.js';
import { DB } from "../modules/db.js";
import { StartServer } from './save.js';

// Validate License before starting
validateLicense().then(() => {
    consoleLogger.info("License verified successfully for Save Service");

    // DB Initialization
    async function Initialize() {
        // Load Variables if needed (from server2.js it seems empty but kept for consistency)
        consoleLogger.info("Initializing Save Service...");
        await DB.initialize();
    };

    Initialize().then(() => {
        consoleLogger.info("Database initialized successfully");
        // Start the Socket Server
        StartServer();
    }).catch(err => {
        consoleLogger.error("Failed to initialize database", err);
    });

}).catch((error) => {
    consoleLogger.error("License verification failed, Save Service cannot start", error);
    process.exit(1);
});
