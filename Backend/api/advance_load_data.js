import express from "express";
import { DB } from "../modules/db.js";
import { access_key_verification } from "./login.js";
import { consoleLogger } from "../modules/prod_logger.js";

const router = express.Router();

router.get("/", access_key_verification, async (request, response) => {
    const type = request.query.type;// internal, incoming, outgoing
    const limit = 5000;//request.query.limit;
    const startdate = request.query.startdate;
    const enddate = request.query.enddate;
    const source = request.query.source;

    try {
        const promises = [];
        if (type["Internal"] == 'true')
            promises.push(DB.searchCdr('internal', startdate, enddate, source, limit));
        if (type["Incoming"] == 'true')
            promises.push(DB.searchCdr('incoming', startdate, enddate, source, limit));
        if (type["Outgoing"] == 'true')
            promises.push(DB.searchCdr('outgoing', startdate, enddate, source, limit));

        const results = await Promise.allSettled(promises);
        const data = results.map(result => result.value).flat();

        return response.status(200).send(data);
    }
    catch (error) {
        consoleLogger.error("error occured while loading data : ", error);
        return response.status(500).send(error);
    }
});

export default router;

/*db.query(`create table if not exists data7 (date VARCHAR(100));`, (err, rows) => {
    if (err) { throw err; }
    console.log("rows are : ", rows);
});

db.query("SHOW VARIABLES LIKE 'time_zone';", (err, rows) => {
    if (err) { throw err; }
    console.log("rows are : ", rows);
});

db.query("SET time_zone = '+05:30';", (err, rows) => {
    if (err) { throw err; }
    console.log("rows are : ", rows);
});

db.query("Insert into data7 (date) values ('2025-11-13')", (err, rows) => {
    if (err) { throw err; }
    console.log("rows are : ", rows);
});

db.query("select * from internal", (err, rows) => {
    if (err) { throw err; }
    console.log("rows are : ", rows);
});*/