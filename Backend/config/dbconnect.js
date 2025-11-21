import mysql from "mysql2";
import fs from "fs";
import path from "path";


const db = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    ca: fs.readFileSync(path.resolve("certificates/ca.pem")),
    rejectUnauthorized: false,
  },
});

export default db;