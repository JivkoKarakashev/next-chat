"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = void 0;
const db_js_1 = require("../lib/db.js");
const getAllUsers = async () => {
    const { rows } = await db_js_1.pool.query(`
      SELECT id, username
      FROM users
      ORDER BY username ASC
    `);
    return rows;
};
exports.getAllUsers = getAllUsers;
