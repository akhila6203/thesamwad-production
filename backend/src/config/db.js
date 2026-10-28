require("dotenv").config();

const mysql = require("mysql2");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,   // <-- EE LINE KOTTHAGA ADD CHEYYALI
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "lms_project",
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 10000,
  enableKeepAlive: true,
});
// const pool = mysql.createPool({
//   host: process.env.DB_HOST || "localhost",
//   user: process.env.DB_USER || "root",
//   password: process.env.DB_PASSWORD || "",
//   database: process.env.DB_NAME || "lms_project",
//   waitForConnections: true,
//   connectionLimit: 10,
//   connectTimeout: 10000,
//   enableKeepAlive: true,
// });

pool.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err.code || "ERROR", err.message);
    console.error(
      "Check that MySQL is running and backend/.env DB_HOST, DB_USER, DB_PASSWORD, DB_NAME are correct."
    );
    return;
  }

  console.log("MySQL Connected");
  connection.release();
});

module.exports = pool;
