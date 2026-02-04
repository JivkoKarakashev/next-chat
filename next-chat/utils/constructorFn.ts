import { BaseType, ChatMessage, ChatType, JoinType, MType, SystemType, } from "@/types/ws-types.ts";

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

function WSJoinMessage(channelName: string): JoinType {
  let _channelName: string = channelName;
  const base = WSBaseType.call(null, 'join');
  return {
    ...base,
    get channelName() {
      return _channelName;
    },
    set channelName(channelName) {
      if (channelName) {
        _channelName = channelName;
        this.channelName = channelName;
      }
    }
  } as JoinType;
}

function WSChatMessage(message: ChatMessage): ChatType {
  let _message: ChatMessage = message;
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

function WSSystemMessage(message: string): SystemType {
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