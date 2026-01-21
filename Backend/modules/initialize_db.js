import { DB } from "./db.js";
export function CreateDB() {
    DB.initialize();
}

CreateDB();