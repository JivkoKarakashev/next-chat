'use client';

import AuthStateContextProvider from "@/context/auth.tsx";
import SocketStateContextProvider from "@/context/socket.tsx";
import { AuthState } from "@/types/auth-state.ts";

function Providers({ children, authStateInit }: { children: React.ReactNode, authStateInit: AuthState }): React.ReactElement {
    return (
        <SocketStateContextProvider>
            <AuthStateContextProvider authStateInit={authStateInit}>
                {children}
            </AuthStateContextProvider>
        </SocketStateContextProvider>
    );
}

export default Providers;