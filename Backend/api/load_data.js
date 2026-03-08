import express from "express";
import { DB } from "../modules/db.js";
import { access_key_verification } from "./login.js";
import { consoleLogger } from "../modules/prod_logger.js";

const load_data = express.Router();

load_data.get("/", access_key_verification, async (request, response) => {
    const type = request.query.type; // internal, incoming, outgoing
    const page = parseInt(request.query.page) || 1;
    const pageSize = parseInt(request.query.pageSize) || 10;
    const deviceIp = request.query.device_ip; // Optional IP filter

    const limit = pageSize;
    const offset = (page - 1) * pageSize;

    try {
        const [rows, count] = await Promise.all([
            DB.getCdrLogs(type, limit, offset, deviceIp),
            DB.getCdrCount(type, deviceIp)
        ]);

        for (let i = 0; i < rows.length; i++) {
            rows[i].date = new Date(rows[i].date).toLocaleDateString("en-GB").split("/").join("-");
        }

        return response.status(200).send({
            data: rows,
            total: count,
            page: page,
            pageSize: pageSize,
            totalPages: Math.ceil(count / pageSize)
        });
    }
    catch (error) {
        consoleLogger.error("error occured while loading data : ", error);
        return response.status(500).send({ message: "Internal server error" });
    }
});

export default load_data;