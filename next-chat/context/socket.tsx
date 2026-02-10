'use client';

import { createContext, useContext, useEffect, useRef, useState } from "react";

import { createWebSocket } from "@/lib/socket.ts";
import { JoinType, MessageType } from "@/types/ws-types.ts";
import { AuthStateContext } from "./auth.tsx";
import { Channel } from "@/types/channel.ts";

interface SocketStateInterface {
  connected: boolean,
  isReady: boolean,
  channels: Channel[],
  activeChannel: string | null,
  messages: Array<MessageType>,
  joinChannel: (channelName: string) => void,
  send: (msg: MessageType) => void,
  reset: () => void
}

const SocketStateContext = createContext<SocketStateInterface>({
  connected: false,
  isReady: false,
  channels: [],
  activeChannel: null,
  messages: [],
  joinChannel: () => { },
  send: () => { },
  reset: () => { }
});

function SocketStateContextProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const socketRef = useRef<WebSocket | null>(null);
  const joinedRef = useRef<boolean>(false);
  const { isAuth, uId } = useContext(AuthStateContext);
  const [connected, setConnected] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [messages, setMessages] = useState<MessageType[]>([]);

  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<string | null>(null);

  const reset = () => {
    joinedRef.current = false;
    setConnected(false);
    setIsReady(false);
    setMessages([]);
  };

  const joinChannel = (channelName: string) => {
    if (!uId || !connected || !isReady) {
      return;
    }

    if (channelName === activeChannel && joinedRef.current) {
      return;
    }

    // reset channel state
    setMessages([]);
    setActiveChannel(channelName);

    const joinMsg: JoinType = {
      userId: uId,
      type: 'join',
      channelName,
      event: null,
    };

    console.log('JOIN CHANNEL', joinMsg);
    send(joinMsg);
    joinedRef.current = true;
  };

  const send = (msg: MessageType) => {
    socketRef.current?.send(JSON.stringify(msg));
  };

  useEffect(() => {
    console.log('isAuth:', isAuth);
  }, [isAuth]);

  useEffect(() => {
    if (!isAuth) {
      socketRef.current?.close();
      socketRef.current = null;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      reset();
      return;
    }

    const ws = createWebSocket();
    socketRef.current = ws;

    ws.onopen = () => {
      console.log('WS TCP Connection OPEN', ws);
      setConnected(true);
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data) as MessageType;
      console.log('WS MESSAGE', msg);

      // 1️⃣ auth handshake
      if (msg.type === 'system' && msg.content === 'authenticated') {
        setIsReady(true);
        return;
      }

      // 2️⃣ initial channels snapshot
      if (msg.type === 'channels_snapshot') {
        setChannels(msg.channels);
        return;
      }

      // 3️⃣ channel created realtime
      if (msg.type === 'channel_created') {
        setChannels(prev => {
          // prevent duplicates
          if (prev.some(ch => ch.channelId === msg.channel.channelId)) {
            return prev;
          }
          return [...prev, msg.channel];
        });
        return;
      }

      // 4️⃣ history
      if (msg.type === 'history') {
        // flatten the history array into individual messages
        setMessages(msg.content.flat());
        return;
      }

      // 5️⃣ everything else
      // normal single message (chat, presence, etc.)
      setMessages(prev => [...prev, msg]);
    };

    ws.onclose = () => {
      console.log('WS CLOSED');
      reset();
    };

    ws.onerror = () => {
      socketRef.current?.close();
      socketRef.current = null;
    };

    return () => ws.close();
  }, [isAuth]);

  return (
    <SocketStateContext.Provider value={{ connected, isReady, channels, activeChannel, messages, joinChannel, send, reset }}>
      {children}
    </SocketStateContext.Provider>
  );
}

export default SocketStateContextProvider;
export {
  SocketStateContext
}