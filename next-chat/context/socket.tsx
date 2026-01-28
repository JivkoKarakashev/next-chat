'use client';

import { socket } from "@/socket.ts";

import { Dispatch, SetStateAction, createContext, useState } from "react";

interface SocketStateInterface {
    isConnected: boolean,
    setIsConnected: Dispatch<SetStateAction<boolean>>,
    messages: Array<string>,
    setMessages: Dispatch<SetStateAction<string[]>>
}

const socketStateInterfaceInit: SocketStateInterface = {
    isConnected: false,
    setIsConnected: () => { },
    messages: [],
    setMessages: () => { }
};

const SocketStateContext = createContext<SocketStateInterface>(socketStateInterfaceInit);

function SocketStateContextProvider({ children }: { children: React.ReactNode }): React.ReactElement {
    const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
    const [messages, setMessages] = useState<string[]>([]);

    return (
        <SocketStateContext.Provider value={{ isConnected, setIsConnected, messages, setMessages }}>
            {children}
        </SocketStateContext.Provider>
    );
}

export default SocketStateContextProvider;

export {
    SocketStateContext
}