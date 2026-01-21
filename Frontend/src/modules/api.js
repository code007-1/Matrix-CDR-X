import { server_address } from "../statics";
import axios from "axios";


export const api = axios.create({
    baseURL: server_address,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 25000
});

api.defaults.withCredentials = true;
api.defaults.withXSRFToken = true;