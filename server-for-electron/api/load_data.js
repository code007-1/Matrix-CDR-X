import express from "express";
import { db } from "../modules/db.js";
import { access_key_verification } from "./login.js";

const load_data = express.Router();

load_data.get("/", access_key_verification, async (request, response) => {
    const type = request.query.type;// internal, incoming, outgoing
    const limit = request.query.limit;
    const offset = request.query.offset;
    //db.all(`SELECT * FROM ${type}`, [], (err, rows) => {

    try {
        if (offset != '-1') {
            db.query(`SELECT * FROM ${type} LIMIT ${limit} OFFSET ${offset}`, (err, rows) => {
                if (err) { throw err; }
                return response.status(200).send(rows);
            });
        }
        else {
            db.query(`SELECT * FROM ${type} ORDER BY sno DESC LIMIT ${5000}`, (err, rows) => {
                if (err) { throw err; }
                return response.status(200).send(rows);
            });
        }
    }
    catch (error) {
        console.log("error occured while loading data : ", error);
        return response.status(500).send({ message: "Internal server error" });
    }
});

export default load_data;