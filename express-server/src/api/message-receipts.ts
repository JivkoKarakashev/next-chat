import { pool } from '../lib/db';
import { WSReceiptSnapshot } from '../ws/ws-server-types';

const insertMessageReceipts = async (messageInternalId: number, channelId: string): Promise<void> => {
  await pool.query(`
      INSERT INTO message_receipts (message_id, user_id)
      SELECT $1, user_id
      FROM channel_users
      WHERE 
        channel_id = $2
      ON CONFLICT (message_id, user_id) DO NOTHING
  `, [messageInternalId, channelId]);
};

const markDelivered = async (messageInternalId: number, userId: string): Promise<void> => {
  await pool.query(`
      UPDATE message_receipts
      SET delivered_at = NOW()
      WHERE message_id = $1
      AND user_id = $2
      AND delivered_at IS NULL
    `, [messageInternalId, userId]
  );
};

const markSeenUpToMessage = async (channelId: string, userId: string, lastMessagePublicId: string): Promise<{ messageIds: string[], seenAt: Date } | null> => {
  const { rows } = await pool.query<{ publicId: string, seenAt: Date }>(`
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
    `, [channelId, userId, lastMessagePublicId]
  );

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

const markDeliveredForUsers = async (messageInternalId: number, userIds: string[]): Promise<Date> => {
  const { rows } = await pool.query<{ deliveredAt: Date }>(`
      UPDATE message_receipts
      SET delivered_at = NOW()
      WHERE 
        message_id = $1
        AND user_id = ANY($2::text[])
      RETURNING delivered_at AS "deliveredAt"
  `, [messageInternalId, userIds]);

  return rows[0]?.deliveredAt ?? new Date();
};

const getUnreadCountsByUser = async (userId: string): Promise<Record<string, number>> => {
  const { rows } = await pool.query<{ channelId: string, count: string }>(`
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
  }, {} as Record<string, number>);
};

const getReceiptSnapshot = async (publicId: string): Promise<WSReceiptSnapshot[]> => {
  const { rows } = await pool.query<WSReceiptSnapshot>(`
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

export {
  insertMessageReceipts,
  markDelivered,
  markSeenUpToMessage,
  markDeliveredForUsers,
  getUnreadCountsByUser,
  getReceiptSnapshot
}
