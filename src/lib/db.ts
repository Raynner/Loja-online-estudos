import "server-only";
import mysql from "mysql2/promise"

const globalForDb = globalThis as unknown as {
    mysqlPool?: ReturnType<typeof mysql.createPool>;
};

export const db = 
    globalForDb.mysqlPool ??
    mysql.createPool({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT ?? 3306),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 5,
        queueLimit: 20,
    });

    if (process.env.NODE_ENV !== "production") {
        globalForDb.mysqlPool = db;
    }