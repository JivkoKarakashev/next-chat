'use client';

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createWebSocket } from "@/lib/socket";
import { ChatMessage, ChatType, JoinType, MessageType } from "@/types/ws-types";
import { AuthStateContext } from "./auth";

interface SocketStateInterface {
  connected: boolean,
  isReady: boolean,
  messages: ChatMessage[],
  send: (msg: JoinType | ChatType) => void,
  msgsResetter: () => void
}

const SocketStateContext = createContext<SocketStateInterface>({
  connected: false,
  isReady: false,
  messages: [],
  send: () => { },
  msgsResetter: () => { }
});

function SocketStateContextProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const socketRef = useRef<WebSocket | null>(null);
  const { isAuth } = useContext(AuthStateContext);
  const [connected, setConnected] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const send = (msg: JoinType | ChatType) => {
    socketRef.current?.send(JSON.stringify(msg));
  };

  const msgsResetter = () => setMessages([]);

  useEffect(() => {
    console.log("🧠 isAuth:", isAuth);
  }, [isAuth]);

  useEffect(() => {
    if (!isAuth) {
      socketRef.current?.close();
      socketRef.current = null;
      return;
    }

    const ws = createWebSocket();
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("🟢 WS TCP Connection OPEN", ws);
      setConnected(true);
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data) as MessageType;
      console.log("📩 WS MESSAGE", msg);
      if (msg.type === 'system' && msg.message === 'authenticated') {
        setIsReady(true);
      }

      switch (msg.type) {
        case 'history':
          setMessages(msg.messages ?? []);
          break;

        case 'chat':
          setMessages(prev => [...prev, msg.message]);
          break;

        case 'system':
          console.log('SYSTEM:', msg.message);
          break;

        case 'presence':
          console.log('PRESENCE:', msg);
          break;
      }
    };

    ws.onclose = () => {
      console.log("🔴 WS CLOSED");
      setConnected(false);
      setIsReady(false);
    };

    ws.onerror = () => {
      socketRef.current?.close();
      socketRef.current = null;
    };

    return () => ws.close();
  }, [isAuth, socketRef, setIsReady, setMessages]);

  return (
    <SocketStateContext.Provider value={{ connected, isReady, messages, send, msgsResetter }}>
      {children}
    </SocketStateContext.Provider>
  );
}

export default SocketStateContextProvider;
export {
  SocketStateContext
}