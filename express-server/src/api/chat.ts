import { pool } from '../lib/db';
import { DBChannelRow, DBMessageRow, DBMessageWithReceipts } from '../ws/ws-server-types';
import { generateSecureRandomId as generateId } from '../utils/secure-random-string';

interface Channel {
  channelId: string,
  channelName: string
}

const getAllChannels = async (): Promise<DBChannelRow[]> => {
  const { rows } = await pool.query<DBChannelRow>(`
        SELECT id AS "channelId", name AS "channelName"
        FROM channels
        ORDER BY name ASC
    `);
  return rows;
};

// Get or create a channel by name
const getOrCreateChannelByName = async (name: string): Promise<{ channel: DBChannelRow | undefined, created: boolean }> => {

  const { rows: existing } = await pool.query<DBChannelRow>(`
        SELECT id AS "channelId" , name AS "channelName"
        FROM channels
        WHERE name = $1
        `, [name]
  );

  if (existing.length > 0) {
    return {
      channel: existing[0],
      created: false
    };
  }

  const id = generateId();
  const { rows: createdRows } = await pool.query<DBChannelRow>(`
        INSERT INTO channels (id, name)
        VALUES ($1, $2)
        RETURNING id AS "channelId", name AS "channelName"
        `, [id, name]
  );

  return {
    channel: createdRows[0],
    created: true
  };
};

// Get last messages for a channel (including email)
const getChatHistoryByChannel = async (channelId: string): Promise<DBMessageWithReceipts[]> => {
  // console.log('ChannelID:' + channelId);
  const { rows } = await pool.query(`
        SELECT
          m.internal_id AS "internalId",
          m.public_id AS "publicId",
          m.channel_id AS "channelId",
          m.user_id AS "userId",
          u.username,
          m.content,
          m.created_at AS "createdAt",
          m.updated_at AS "updatedAt",
          mr.user_id AS "receiptUserId",
          mr.delivered_at AS "deliveredAt",
          mr.seen_at AS "seenAt"
        FROM
          messages AS m
        JOIN 
          users AS u ON u.id = m.user_id
        LEFT JOIN message_receipts AS mr
        ON
          mr.message_id = m.internal_id
        WHERE
          m.channel_id = $1
        ORDER BY
          m.internal_id ASC
    `, [channelId]);

  const map = new Map<string, DBMessageWithReceipts>();

  for (const row of rows) {
    if (!map.has(row.publicId)) {
      map.set(row.publicId, {
        internalId: row.internalId,
        publicId: row.publicId,
        channelId: row.channelId,
        userId: row.userId,
        username: row.username,
        content: row.content,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        receipts: []
      });
    }

    const msg = map.get(row.publicId)!;

    if (row.receiptUserId) {
      msg.receipts.push({
        userId: row.receiptUserId,
        deliveredAt: row.deliveredAt,
        seenAt: row.seenAt
      });
    }
  }

  return [...map.values()];
};

interface InsertMessageArgs {
  publicId?: string,
  type: string,
  userId: string,
  channelId: string,
  content: string
}

// Save a message in DB
const insertMessage = async (args: InsertMessageArgs): Promise<DBMessageRow | undefined> => {

  const publicId = generateId();
  const { type, userId, channelId, content } = args;

  const { rows } = await pool.query<DBMessageRow>(`
        INSERT INTO messages (type, public_id, user_id, channel_id, content)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
            type,
            internal_id AS "internalId",
            public_id AS "publicId",
            user_id AS "userId",
            channel_id AS "channelId",
            content,
            created_at AS "createdAt",
            updated_at AS "updatedAt"
    `, [type, publicId, userId, channelId, content]);

  if (!rows[0]) {
    console.log('An error occurred while inserting a new message in the database!');
    return;
  }
  const { rows: userRows } = await pool.query<{ username: string }>(`
        SELECT username FROM users WHERE id = $1
    `, [userId]
  );

  return {
    ...rows[0],
    username: userRows[0]?.username ?? 'Unknown from DB'
  };
};

const addUserToChannel = async (channelId: string, userId: string): Promise<void> => {
  await pool.query(`
      INSERT INTO channel_users (channel_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT (channel_id, user_id) DO NOTHING
  `, [channelId, userId]);
};

const getUserIdsByChannel = async (channelId: string): Promise<string[]> => {
  const { rows } = await pool.query<{ userId: string }>(`
    SELECT user_id AS "userId" FROM channel_users
    WHERE channel_id = $1
  `, [channelId]);

  return rows.map(r => r.userId);
};

export {
  type Channel,
  type InsertMessageArgs,
  getAllChannels,
  getOrCreateChannelByName,
  getChatHistoryByChannel,
  insertMessage,
  addUserToChannel,
  getUserIdsByChannel
}