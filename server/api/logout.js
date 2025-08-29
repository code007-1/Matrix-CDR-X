import express from "express";
import { access_key_verification } from "./login.js";

const router = express.Router();

router.post("/", access_key_verification, (req, res) => {
    //console.log("we are here logging out");
    res.clearCookie('token');

    return res.status(200).send({ message: "Logged Out Successfully" });
});

export default router;