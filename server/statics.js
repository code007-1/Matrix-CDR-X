export const ports = [5665, 5666, 5667];//internal, incoming, outgoing

export const db_location = "./mydatabase.db";
export const internal_cdr_table_name = "internal";
export const incoming_cdr_table_name = "incoming";
export const outgoing_cdr_table_name = "outgoing";

export const jwt_access_key = "891723987281973";
export const jwt_refresh_key = "89798ghg687ghjg";
export const port = 5000;

import pkg1 from "bcryptjs";
const { hash, compare } = pkg1;

async function generatepassword() {
    const password = await hash('admin', 10);
    console.log(password)
}

generatepassword();

/*
fs.readFile('statics.txt', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log(data);
});*/