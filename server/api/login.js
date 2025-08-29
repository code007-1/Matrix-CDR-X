import express from "express";
import { jwt_access_key, jwt_refresh_key } from "../statics.js";
import pkg1 from "bcryptjs";
const { hash, compare } = pkg1;
import fs from 'fs';
import pkg from 'jsonwebtoken';
import { db } from "../modules/db.js";
const { sign, verify } = pkg;

const router = express.Router();

async function database_verification(req, res, next) {
    //console.log("comparing password");
    try {
        const cred = req.headers.authorization.replace("Bearer ", "").split(":");
        if (cred[0] != 'admin') {
            return res.status(401).send({ message: "Wrong User Name" });
        }

        // Validate User Here
        db.execute(`Select * from users where id='admin'`, async (err, result, fields) => {
            if (err) {
                console.error(err.message);
                return res.status(500).send({ message: "Internal Server Error" });
            }

            const match = await compare(cred[1], result[0]["password"]);

            if (match) {
                req.query.userid = cred[0];
                req.query.password = cred[1];
                next();
            }
            else return res.status(401).send({ message: "Wrong Password" });
        });
    }
    catch (error) {
        return res.status(500).send({ message: "Internal Server Error" });
    }
}

export function access_key_verification(req, res, next) {
    try {
        const cred = req.headers.cookie.replace('token=', '');

        const access = verify(cred, jwt_refresh_key);

        // Validate User Here
        if (access) {
            next();
        }
        else {
            return res.status(403).send(null);
        }
    }
    catch (e) {
        console.log("access fail");
        return res.status(403).send("Access denied");
    }
}

router.post("/", database_verification, (req, res) => {
    let data = {
        time: Date(),
        userId: req.query["userid"],
        userIP: req.ip,
    }

    const refresh = sign(data, jwt_refresh_key, { expiresIn: "1d" });
    const access = sign(data, jwt_access_key, { expiresIn: "5m" });

    res.cookie('token', refresh, {
        httpOnly: true, // Prevent client-side accesss
        secure: true, // Only send over HTTPS
        sameSite: 'none', // For cross-site requests
        maxAge: 1000 * 60 * 60 * 24
    });
    return res.status(200).send({ message: "Logged in Successfully", token: access });
})

export default router;