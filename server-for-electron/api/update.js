import express from "express";
import { db } from "../modules/db.js";
import pkg1 from "bcryptjs";
import { access_key_verification } from "./login.js";
const { hash, compare } = pkg1;

const router = express.Router();

router.post("/", access_key_verification, (req, res) => {
    const cred = req.headers.authorization.replace("Bearer ", "").split(":");

    db.execute(`Select * from users where id='admin'`, async (err, result, fields) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send({ message: "Internal server error" });
        }

        const match = await compare(cred[0], result[0]['password']);

        if (match) {
            const update = await hash(cred[1], 10);
            const sql = `UPDATE users SET password='${update}' where id = 'admin'`;

            db.query(sql, (err) => {
                if (err) {
                    console.error(err.message);
                    return res.status(500).send({ message: "Internal server error" });
                }
                else {
                    console.log('Password saved');
                    return res.status(200).send({ message: "Password changed successfully" });
                }
            });
        }
        else { return res.status(401).send({ message: "Current password is wrong" }); }
    });
});

export default router;