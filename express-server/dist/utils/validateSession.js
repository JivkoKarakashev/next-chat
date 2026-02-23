"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSession = void 0;
const db_1 = require("../lib/db");
// Get session info by sessionId
const validateSession = async (sessionId) => {
    const { rows } = await db_1.pool.query(`
        SELECT s.user_id AS "userId", u.username
        FROM sessions AS s
        JOIN users AS u ON u.id = s.user_id
        WHERE s.id = $1 AND s.expires_at > now()`, [sessionId]);
    return rows[0];
};
exports.validateSession = validateSession;
