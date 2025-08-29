import { db } from "./db";
export function CreateDB() {
    // Create a table
    /*db.serialize(()  => {

        db.run(`CREATE TABLE IF NOT EXISTS internal (
    sno INTEGER PRIMARY KEY AUTOINCREMENT,
    source VARCHAR(100),
    soruceipport VARCHAR(100),
    destination VARCHAR(100),
    destinationipport VARCHAR(100),
    connectednumber VARCHAR(100),
    connectedipport VARCHAR(100),
    date VARCHAR(100),  
    time VARCHAR(100),
    answerduration VARCHAR(100),
    calltype VARCHAR(100))`, (err) => {
            if (err) console.error(err.message);
            else console.log('Table created.');
        });


        db.run(`CREATE TABLE IF NOT EXISTS incoming (
        sno INTEGER PRIMARY KEY AUTOINCREMENT,
        source VARCHAR(100),
        soruceipport VARCHAR(100),
        trunk VARCHAR(100),
        destination VARCHAR(100),
        destinationipport VARCHAR(100),
        connectednumber VARCHAR(100),
        connectedipport VARCHAR(100),
        date VARCHAR(100),  
        time VARCHAR(100),
        answerduration VARCHAR(100),
        holdduration VARCHAR(100),
        speechduration VARCHAR(100),
        calltype VARCHAR(100))`, (err) => {
            if (err) console.error(err.message);
            else console.log('Table created.');
        });

        db.run(`CREATE TABLE IF NOT EXISTS outgoing (
        sno INTEGER PRIMARY KEY AUTOINCREMENT,
        source VARCHAR(100),
        soruceipport VARCHAR(100),
        trunk VARCHAR(100),
        destination VARCHAR(100),
        destinationipport VARCHAR(100),
        connectednumber VARCHAR(100),
        connectedipport VARCHAR(100),
        date VARCHAR(100),  
        time VARCHAR(100),
        answerduration VARCHAR(100),
        calltype VARCHAR(100))`, (err) => {
            if (err) console.error(err.message);
            else console.log('Table created.');
        });
    });*/

    db.query(`CREATE TABLE IF NOT EXISTS internal (
        sno INT PRIMARY KEY AUTO_INCREMENT,
        source VARCHAR(100),
        soruceipport VARCHAR(100),
        destination VARCHAR(100),
        destinationipport VARCHAR(100),
        connectednumber VARCHAR(100),
        connectedipport VARCHAR(100),
        date VARCHAR(100),  
        time VARCHAR(100),
        answerduration VARCHAR(100),
        calltype VARCHAR(100), 
        INDEX idx (source, date))`, (err) => {
        if (err) console.error(err.message);
        else console.log('Internal Table created.');
    });


    db.query(`CREATE TABLE IF NOT EXISTS incoming (
            sno INT PRIMARY KEY AUTO_INCREMENT,
            source VARCHAR(100),
            soruceipport VARCHAR(100),
            trunk VARCHAR(100),
            destination VARCHAR(100),
            destinationipport VARCHAR(100),
            connectednumber VARCHAR(100),
            connectedipport VARCHAR(100),
            date VARCHAR(100),  
            time VARCHAR(100),
            answerduration VARCHAR(100),
            holdduration VARCHAR(100),
            speechduration VARCHAR(100),
            calltype VARCHAR(100),
            INDEX idx (source, date))`, (err) => {
        if (err) console.error(err.message);
        else console.log('Incoming Table created.');
    });

    db.query(`CREATE TABLE IF NOT EXISTS outgoing (
            sno INT PRIMARY KEY AUTO_INCREMENT,
            source VARCHAR(100),
            soruceipport VARCHAR(100),
            trunk VARCHAR(100),
            destination VARCHAR(100),
            destinationipport VARCHAR(100),
            connectednumber VARCHAR(100),
            connectedipport VARCHAR(100),
            date VARCHAR(100),  
            time VARCHAR(100),
            answerduration VARCHAR(100),
            calltype VARCHAR(100),
            INDEX idx (source, date))`, (err) => {
        if (err) console.error(err.message);
        else console.log('Outgoing Table created.');
    });

    db.query(`CREATE TABLE IF NOT EXISTS users
        (id VARCHAR(100) PRIMARY KEY ,
        password VARCHAR(100))`, (err) => {
        if (err) console.error(err.message);
        else console.log('Users Table Created.');
    });

    let sql = `INSERT INTO users (id, password) VALUES ('admin', '$2a$10$XVzr8KeSM6xAFbLcFYdaiebI93o3YGYAFs2p9MpJaCvxwiqMi.R6q')`;

    db.query(sql, (err) => {
        if (err) console.error(err.message);
        else console.log('Done');
    });

    /*db.execute("Select * from users", (err, result, fields) => {
        if (err) console.error(err.message);
        else console.log(result);
    });*/
}

CreateDB()