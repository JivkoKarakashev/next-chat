"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const pg_1 = require("pg");
const env_js_1 = require("../env.js");
if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is missing!');
}
const pool = global.pgPool ??
    new pg_1.Pool({
        connectionString: env_js_1.env.POSTGRES_URL,
        // ssl: { rejectUnauthorized: false },
    });
exports.pool = pool;
pool.query('select 1').then(() => {
    console.log('Postgres connected');
});
if (env_js_1.env.NODE_ENV !== 'production') {
    global.pgPool = pool;
}
