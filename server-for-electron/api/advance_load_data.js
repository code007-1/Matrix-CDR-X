import express from "express";
import { db } from "../modules/db.js";
import { access_key_verification } from "./login.js";

const router = express.Router();

router.get("/", access_key_verification, async (request, response) => {
    const type = request.query.type;// internal, incoming, outgoing
    const limit = 5000;//request.query.limit;
    const startdate = request.query.startdate;
    const enddate = request.query.enddate;
    const source = request.query.source;

    try {
        let queries = ``;
        if (type["Internal"] == 'true')
            queries += `SELECT * FROM internal where date >= '${startdate}' and date <= '${enddate}' and (source LIKE '%${source}%' or destination LIKE '%${source}%') LIMIT ${limit};`
        if (type["Incoming"] == 'true')
            queries += `\nSELECT * FROM incoming where date >= '${startdate}' and date <= '${enddate}' and (source LIKE '%${source}%' or destination LIKE '%${source}%') LIMIT ${limit};`
        if (type["Outgoing"] == 'true')
            queries += `\nSELECT * FROM outgoing where date >= '${startdate}' and date <= '${enddate}' and (source LIKE '%${source}%' or destination LIKE '%${source}%') LIMIT ${limit};`
        //console.log(queries);
        db.query(queries, (err, rows) => {
            if (err) { throw err; }
            return response.status(200).send(rows.flat());
        });
    }
    catch (error) {
        console.log("error occured while loading data : ", error);
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