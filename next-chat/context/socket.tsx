'use client';

import { createContext, useEffect, useRef, useState } from "react";

import { createWebSocket } from "@/lib/socket.ts";
import { ChatType, MessageType, SystemType } from "@/types/ws-types.ts";

interface SocketStateInterface {
    connected: boolean,
    messages: Array<SystemType | ChatType>,
    send: (msg: SystemType | ChatType) => void
}

const socketStateInterfaceInit: SocketStateInterface = {
    connected: false,
    messages: [],
    send: () => { }
};

const SocketStateContext = createContext<SocketStateInterface>(socketStateInterfaceInit);

function SocketStateContextProvider({ children }: { children: React.ReactNode }): React.ReactElement {
    const socketRef = useRef<WebSocket | null>(null);
    const [connected, setConnected] = useState<boolean>(false);
    const [messages, setMessages] = useState<(SystemType | ChatType)[]>([]);

    const send = (msg: MessageType) => {
        socketRef.current?.send(JSON.stringify(msg));
    }

    useEffect(() => {
        const ws = createWebSocket();
        socketRef.current = ws;

        ws.onopen = () => setConnected(true);
        ws.onclose = () => setConnected(false);

        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data) as ChatType | SystemType;
            setMessages((prev) => [...prev, msg]);
        }

        return () => ws.close()
    }, []);

    return (
        <SocketStateContext.Provider value={{ connected, messages, send }}>
            {children}
        </SocketStateContext.Provider>
    );
}

export default SocketStateContextProvider;

export {
    SocketStateContext
}