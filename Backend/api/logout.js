import express from "express";
import { access_key_verification } from "./login.js";
import { fileLogger } from "../modules/prod_logger.js";

const router = express.Router();

router.post("/", access_key_verification, (req, res) => {
    try {
        res.clearCookie('token');
        return res.status(200).send({ message: "Logged Out Successfully" });
    }
    catch (error) {
        fileLogger.error("error occured while logging out : ", error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
});

export default router;