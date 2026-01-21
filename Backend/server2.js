import { validateLicense } from './modules/licenseValidator.js';
import express from 'express';
import cors from 'cors';
import load_data from "./api/load_data.js";
import login from "./api/login.js";
import logout from "./api/logout.js";
import update from "./api/update.js"
import advance_load_data from "./api/advance_load_data.js"
import { port } from './statics.js';
import { consoleLogger } from './modules/prod_logger.js';
import { DB } from "./modules/db.js";
import { StartServer } from './services/save.js';

const app = express();

app.use(cors({
    origin: ['http://localhost:5173', "http://localhost:80"], // Replace with your React app's origin
    //origin: "*",  
    credentials: true,
    //allowedHeaders: true,
    exposedHeaders: "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    //methods: true
}));

app.use(express.json());

app.use((req, res, next) => {
    consoleLogger.info(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

validateLicense().then(() => {
    consoleLogger.info("license verified succesfully");

    app.use("/login", login);
    app.use("/logout", logout);
    app.use("/load_data", load_data);
    app.use("/update", update);
    app.use("/advance_load_data", advance_load_data);
    import("./api/devices.js").then(module => {
        app.use("/devices", module.default);
    });

    // Loads Variables that would be used later
    async function Load_Variables() {
    }

    // initialization functions
    async function Initialize() {
        await Load_Variables().then((e) => {
            consoleLogger.info("Variables loaded successfully");
            DB.initialize();
        });
    };

    // Initialize whatever needs to be intialized before running express server
    Initialize().then(() => {
        consoleLogger.info("Database initialized successfully");
        StartServer();
        app.listen(port, () => {
            consoleLogger.info(`Express API Server is running on port 5000`);
        });
    });
}
).catch((error) => {
    consoleLogger.error("License verification failed, App can't be used");

    app.listen(port, () => {
        consoleLogger.info(`Express API Server is running on port 5000`);
    });

    app.all("*", (req, res) => {
        return res.status(405).send({ message: "License verification failed, App can't be used" });
    });
});