"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReceiptSnapshot = exports.getUnreadCountsByUser = exports.markDeliveredForUsers = exports.markSeenUpToMessage = exports.markDelivered = exports.insertMessageReceipts = void 0;
const db_js_1 = require("../lib/db.js");
const insertMessageReceipts = async (messageInternalId, channelId) => {
    await db_js_1.pool.query(`
      INSERT INTO message_receipts (message_id, user_id)
      SELECT $1, user_id
      FROM channel_users
      WHERE 
        channel_id = $2
      ON CONFLICT (message_id, user_id) DO NOTHING
  `, [messageInternalId, channelId]);
};
exports.insertMessageReceipts = insertMessageReceipts;
const markDelivered = async (messageInternalId, userId) => {
    await db_js_1.pool.query(`
      UPDATE message_receipts
      SET delivered_at = NOW()
      WHERE message_id = $1
      AND user_id = $2
      AND delivered_at IS NULL
    `, [messageInternalId, userId]);
};
exports.markDelivered = markDelivered;
const markSeenUpToMessage = async (channelId, userId, lastMessagePublicId) => {
    const { rows } = await db_js_1.pool.query(`
      UPDATE message_receipts AS mr
      SET seen_at = NOW()
      FROM messages AS m
      WHERE mr.message_id = m.internal_id
      AND m.channel_id = $1
      AND mr.user_id = $2
      AND m.internal_id <= (
        SELECT internal_id FROM messages WHERE public_id = $3
      )
      RETURNING m.public_id AS "publicId", mr.seen_at AS "seenAt"
    `, [channelId, userId, lastMessagePublicId]);
    if (rows.length === 0) {
        return null;
    }
    const seenAt = rows[0]?.seenAt;
    if (!seenAt) {
        console.log('SeenAt is undefined!');
        return null;
    }
    return {
        messageIds: rows.map(r => r.publicId),
        seenAt
    };
};
exports.markSeenUpToMessage = markSeenUpToMessage;
const markDeliveredForUsers = async (messageInternalId, userIds) => {
    const { rows } = await db_js_1.pool.query(`
      UPDATE message_receipts
      SET delivered_at = NOW()
      WHERE 
        message_id = $1
        AND user_id = ANY($2::text[])
      RETURNING delivered_at AS "deliveredAt"
  `, [messageInternalId, userIds]);
    return rows[0]?.deliveredAt ?? new Date();
};
exports.markDeliveredForUsers = markDeliveredForUsers;
const getUnreadCountsByUser = async (userId) => {
    const { rows } = await db_js_1.pool.query(`
    SELECT 
      m.channel_id AS "channelId",
      COUNT(*)::text AS "count"
    FROM message_receipts AS mr
    JOIN messages AS m ON m.internal_id = mr.message_id
    WHERE 
      mr.user_id = $1
      AND mr.seen_at IS NULL
      AND m.user_id != $1
    GROUP BY m.channel_id
    `, [userId]);
    return rows.reduce((acc, row) => {
        acc[row.channelId] = Number(row.count);
        return acc;
    }, {});
};
exports.getUnreadCountsByUser = getUnreadCountsByUser;
const getReceiptSnapshot = async (publicId) => {
    const { rows } = await db_js_1.pool.query(`
      SELECT
      mr.user_id AS "userId",
      mr.delivered_at AS "deliveredAt",
      mr.seen_at AS "seenAt"
      FROM message_receipts mr
      JOIN messages m ON mr.message_id = m.internal_id
      WHERE m.public_id = $1
  `, [publicId]);
    return rows;
};
exports.getReceiptSnapshot = getReceiptSnapshot;
