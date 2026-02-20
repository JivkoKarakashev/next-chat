'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { createSocketTransport, SocketTransport } from "@/socket/socket.transport.ts";
import { WSJoinRequest, WSChatRequest } from "@/types/ws-client-types.ts";
import { WSServerEvent } from "@/types/ws-server-types.ts";
import { Channel } from "@/types/channel.ts";
import { AuthStateContext } from "./auth.tsx";

import { dispatchMessage } from "@/socket/socket.dispatcher.ts";
import { UIMessage } from "@/types/ws-server-types.ts";
import { registerAllHandlers } from "@/socket/socket.register-handlers.ts";

interface SocketStateInterface {
  connected: boolean,
  onlineUsers: string[],
  usersActiveChannel: Record<string, string | null>,
  channels: Channel[],
  unreadByChannel: Record<string, number>,
  activeChannelId: string | null,
  memoizedMessagesByChannel: UIMessage[],
  joinChannel: (channelName: string) => void,
  sendChat: (content: string) => void,
  reset: () => void
}

const SocketStateContext = createContext<SocketStateInterface>({
  connected: false,
  onlineUsers: [],
  usersActiveChannel: {},
  channels: [],
  unreadByChannel: { '': 0 },
  activeChannelId: null,
  memoizedMessagesByChannel: [],
  joinChannel: () => { },
  sendChat: () => { },
  reset: () => { }
});

function SocketStateContextProvider({ children }: { children: React.ReactNode }): React.ReactElement {

  const transportRef = useRef<SocketTransport | null>(null);
  const { isAuth } = useContext(AuthStateContext);

  // CONNECTION STATE
  const [connected, setConnected] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // ONLINE USERS STATE
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  // ACTIVE CHANNEL PER USER STATE
  const [usersActiveChannel, setUsersActiveChannel] = useState<Record<string, string | null>>({});

  // CHANNEL STATE
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);

  // MESSAGE STATE (per channel)
  const [messagesByChannel, setMessagesByChannel] = useState<Record<string, UIMessage[]>>({});

  // UNREAD COUNTER
  const [unreadByChannel, setUnreadByChannel] = useState<Record<string, number>>({});

  const memoizedMessagesByChannel = useMemo(() => {
    if (!activeChannelId) {
      return [];
    }
    return messagesByChannel[activeChannelId] ?? [];
  }, [messagesByChannel, activeChannelId]);

  // RESET
  const reset = useCallback(() => {
    // console.log('RESET SOCKET INVOKED!');
    setConnected(false);
    setIsReady(false);
    setChannels([]);
    setActiveChannelId(null);
    setMessagesByChannel({});
  }, []);

  // JOIN CHANNEL
  const joinChannel = useCallback((channelName: string) => {
    if (!connected || !isReady) {
      return;
    }

    const joinMsg: WSJoinRequest = {
      type: 'join',
      channelName
    };
    transportRef.current?.send(joinMsg);
  }, [connected, isReady]);

  // SEND CHAT
  const sendChat = useCallback((content: string) => {
    if (!activeChannelId) {
      return;
    }

    const chatMsg: WSChatRequest = {
      type: 'chat',
      channelId: activeChannelId,
      content
    };
    transportRef.current?.send(chatMsg);
  }, [activeChannelId]);

  // SOCKET LIFECYCLE
  useEffect(() => {
    if (!isAuth) {
      transportRef.current?.disconnect();
      return;
    }

    const transport = createSocketTransport();
    transportRef.current = transport;

    registerAllHandlers();

    transport.onOpen(() => {
      setConnected(true);
    });

    transport.onClose(() => {
      reset();
    });

    transport.onMessage((msg: WSServerEvent) => {
      dispatchMessage(msg, {
        setIsReady,
        setChannels,
        setActiveChannelId,
        setMessagesByChannel,
        setUnreadByChannel,
        setOnlineUsers,
        setUsersActiveChannel
      });
    });

    transport.connect();

    return () => {
      transport.disconnect();
    };
  }, [isAuth, reset]);

  // CONTEXT VALUE
  const value = useMemo<SocketStateInterface>(() => ({
    connected,
    onlineUsers,
    usersActiveChannel,
    channels,
    unreadByChannel,
    activeChannelId,
    memoizedMessagesByChannel,
    joinChannel,
    sendChat,
    reset
  }), [connected, onlineUsers, usersActiveChannel, channels, unreadByChannel, activeChannelId, memoizedMessagesByChannel, joinChannel, sendChat, reset]);

  return (
    <SocketStateContext.Provider value={value}>
      {children}
    </SocketStateContext.Provider>
  );
}

export default SocketStateContextProvider;
export {
  SocketStateContext
}