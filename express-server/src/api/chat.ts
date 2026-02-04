import { pool } from '../lib/db';
import { ChatMessage } from '../ws/types';
import { generateSecureRandomId as generateId } from '../utils/secure-random-string';

interface Channel {
    channelId: string,
    channelName: string
}

// Get or create a channel by name
const getOrCreateChannelByName = async (name: string): Promise<Channel | undefined> => {

    const { rows: existing } = await pool.query<Channel>(`
        SELECT id AS "channelId" , name AS "channelName"
        FROM channels
        WHERE name = $1
        `, [name]
    );

    if (existing.length > 0) {
        return existing[0];
    }

    const id = generateId();
    const { rows: created } = await pool.query<Channel>(`
        INSERT INTO channels (id, name)
        VALUES ($1, $2)
        RETURNING id AS "channelId", name AS "channelName"
        `, [id, name]
    );

    return created[0];
};

// Get last messages for a channel (including email)
const getChatHistoryByChannel = async (channelId: string): Promise<ChatMessage[]> => {

    const { rows } = await pool.query<ChatMessage>(`
        SELECT m.id, m.user_id AS "userId", m.channel_id AS "channelId", m.content, u.email, m.created_at AS "createdAt", m.updated_at AS "updatedAt"
        FROM messages m
        LEFT JOIN users u ON u.id = m.user_id
        WHERE m.channel_id = $1 AND m.deleted_at IS NULL
        ORDER BY m.created_at ASC
        LIMIT 25
    `, [channelId]);

    return rows;
};

interface InsertMessageArgs {
    userId: string,
    channelId: string,
    content: string
};

// Save a message in DB
const insertMessage = async (args: InsertMessageArgs): Promise<ChatMessage | undefined> => {

    const id = generateId();
    const { userId, channelId, content } = args;

    const { rows } = await pool.query<ChatMessage>(`
        INSERT INTO messages (id, user_id, channel_id, content)
        VALUES ($1, $2, $3, $4)
        RETURNING
            id,
            user_id     AS "userId",
            channel_id  AS "channelId",
            content,
            created_at AS "createdAt"
    `, [id, userId, channelId, content]);

    return rows[0];
};


export {
    getOrCreateChannelByName,
    getChatHistoryByChannel,
    insertMessage
}