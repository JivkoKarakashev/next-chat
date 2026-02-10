import { pool } from '../lib/db';
import { DBType, MType } from '../ws/types';
import { generateSecureRandomId as generateId } from '../utils/secure-random-string';

export interface Channel {
  channelId: string,
  channelName: string
}

const getAllChannels = async (): Promise<Channel[]> => {
  const { rows } = await pool.query<Channel>(`
        SELECT id AS "channelId", name AS "channelName"
        FROM channels
        ORDER BY name ASC
    `);
  return rows;
};

// Get or create a channel by name
const getOrCreateChannelByName = async (name: string): Promise<{ channel: Channel | undefined, created: boolean }> => {

  const { rows: existing } = await pool.query<Channel>(`
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
  const { rows: created } = await pool.query<Channel>(`
        INSERT INTO channels (id, name)
        VALUES ($1, $2)
        RETURNING id AS "channelId", name AS "channelName"
        `, [id, name]
  );

  return {
    channel: created[0],
    created: true
  };
};

// Get last messages for a channel (including email)
const getChatHistoryByChannel = async (channelId: string): Promise<{ id: string, userId: string, channelId: string, type: MType, content: string, username: string, createdAt: Date, updatedAt: Date }[]> => {
  console.log('ChannelID:' + channelId);
  const { rows } = await pool.query<{ id: string, userId: string, username: string, channelId: string, type: MType, content: string, createdAt: Date, updatedAt: Date }>(`
        SELECT m.id, m.user_id AS "userId", u.username, m.channel_id AS "channelId", m.type, m.content, m.created_at AS "createdAt", m.updated_at AS "updatedAt"
        FROM messages AS m
        LEFT JOIN users AS u ON u.id = m.user_id
        WHERE m.channel_id = $1 AND m.deleted_at IS NULL
        ORDER BY m.created_at ASC
    `, [channelId]);

  return rows;
};

interface InsertMessageArgs {
  userId: string,
  channelId: string,
  content: string,
  type: MType
};

// Save a message in DB
const insertMessage = async (args: InsertMessageArgs): Promise<DBType | undefined> => {

  const id = generateId();
  const { userId, channelId, type, content } = args;

  const { rows } = await pool.query<DBType>(`
        INSERT INTO messages (id, user_id, channel_id, type, content)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
            id,
            user_id     AS "userId",
            channel_id  AS "channelId",
            content,
            created_at AS "createdAt",
            updated_at AS "updatedAt"
    `, [id, userId, channelId, type, content]);

  return rows[0];
};


export {
  type InsertMessageArgs,
  getAllChannels,
  getOrCreateChannelByName,
  getChatHistoryByChannel,
  insertMessage
}