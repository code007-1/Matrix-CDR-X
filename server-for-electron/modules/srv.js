import { Service } from "node-windows";

const svc = new Service({
    name: "PBXMonitoringService",
    description: "By Saurav",
    script: "./save.js"
})

svc.on("install", function () {
    svc.start();
})``