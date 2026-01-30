import { BaseType, ChatType, JoinType, MType, SystemType, WSMessage } from "../types/ws-types";

const WSBaseType = (type: MType): BaseType => {
    let _type: MType = type;
    return {
        get type() {
            return _type;
        },
        set type(type: MType) {
            _type = type;
            this.type = type;
        }
    }
};

function WSJoinMessage(username: string): JoinType {
    let _username: string = username;
    const base = WSBaseType.call(null, 'join');
    return {
        ...base,
        get username() {
            return _username;
        },
        set username(username) {
            if (username) {
                this.username = username;
                _username = username;
            }
        }
    } as JoinType;
}

function WSChatMessage(message: WSMessage): ChatType {
    let _message: WSMessage = message;
    const base = WSBaseType.call(null, 'chat');

    return {
        ...base,
        get message() {
            return _message;
        },
        set message(message) {
            if (message) {
                this.message = message;
                _message = message;
            }
        }
    } as ChatType;
}

function WSSystemMessage(message: WSMessage): SystemType {
    let _message = message;
    const base = WSBaseType.call(null, 'system');

    return {
        ...base,
        get message() {
            return _message;
        },
        set message(message) {
            if (message) {
                this.message = message;
                _message = message;
            }
        }
    } as SystemType;
}

export {
    WSJoinMessage,
    WSChatMessage,
    WSSystemMessage
}