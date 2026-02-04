import AuthStateContextProvider from "@/context/auth.tsx";
import SocketStateContextProvider from "@/context/socket.tsx";

function Providers({ children }: { children: React.ReactNode }): React.ReactElement {
    return (
        <AuthStateContextProvider>
            <SocketStateContextProvider>
                {children}
            </SocketStateContextProvider>
        </AuthStateContextProvider>
    );
}

export default Providers;