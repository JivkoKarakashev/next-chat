type MType = 'join' | 'chat' | 'system';

interface BaseType {
    type: MType
}

interface WSMessage {
    id: string,
    content: string
}

interface JoinType extends Omit<BaseType, 'type'> {
    type: 'join',
    username: string
}

interface ChatType extends Omit<BaseType, 'username' | 'type'> {
    type: 'chat',
    message: WSMessage
}

interface SystemType extends Omit<ChatType, 'type'> {
    type: 'system'
};

type MessageType = JoinType | ChatType | SystemType;

export {
    type MType,
    type BaseType,
    type WSMessage,
    type JoinType,
    type ChatType,
    type SystemType,
    type MessageType
}