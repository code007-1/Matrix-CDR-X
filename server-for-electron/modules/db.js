/*import { db_location } from '../statics.js';
import sqlite3 from 'sqlite3';

sqlite3.verbose();

export const db = new sqlite3.Database(db_location, (err) => {
    if (err) console.error(err.message);
    else console.log('Connected to the SQLite database.');
});*/

import mysql from 'mysql2'

export const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1112',
    database: 'cdr',
    port: '3306',
    multipleStatements: true
});

db.connect(err => {
    if (err) throw err;
    console.log('MySQL Connected...');
});