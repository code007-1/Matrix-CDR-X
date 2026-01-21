import express from "express";
import { DB } from "../modules/db.js";
import pkg1 from "bcryptjs";
import { access_key_verification } from "./login.js";
import { consoleLogger } from "../modules/prod_logger.js";

const { hash, compare } = pkg1;
const router = express.Router();

router.post("/", access_key_verification, async (req, res) => {
    const cred = req.headers.authorization.replace("Bearer ", "").split(":");

    try {
        const result = await DB.getUser('admin');

        const match = await compare(cred[0], result[0]['password']);

        if (match) {
            const update = await hash(cred[1], 10);
            await DB.updatePassword('admin', update);

            consoleLogger.info('Password updated successfully');
            return res.status(200).send({ message: "Password changed successfully" });
        }
        else { return res.status(401).send({ message: "Current password is wrong" }); }
    } catch (err) {
        consoleLogger.error("error occured while updating password : ", err);
        return res.status(500).send({ message: "Internal server error" });
    }
});

export default router;