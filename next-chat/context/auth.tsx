'use client';

import { Dispatch, SetStateAction, createContext, useState } from "react";

import { AuthState } from "@/types/auth-state.ts";

interface AuthStateInterface {
    isAuth: boolean,
    setIsAuth: Dispatch<SetStateAction<boolean>>,
    uId: number | undefined,
    setUId: Dispatch<SetStateAction<number | undefined>>,
    sId: string | undefined,
    setSId: Dispatch<SetStateAction<string | undefined>>
}

const authStateInterfaceInit: AuthStateInterface = {
    isAuth: false,
    setIsAuth: () => { },
    uId: undefined,
    setUId: () => { },
    sId: undefined,
    setSId: () => { }
};

const AuthStateContext = createContext<AuthStateInterface>(authStateInterfaceInit);

function AuthStateContextProvider({ children, authStateInit }: { children: React.ReactNode, authStateInit: AuthState }): React.ReactElement {
    // console.log(authStateInit);
    const [isAuth, setIsAuth] = useState<boolean>(authStateInit.isAuth);
    const [uId, setUId] = useState<number | undefined>(authStateInit.uId);
    const [sId, setSId] = useState<string | undefined>(authStateInit.sId);

    return (
        <AuthStateContext.Provider value={{ isAuth, uId, sId, setIsAuth, setUId, setSId }}>
            {children}
        </AuthStateContext.Provider>
    );
}

export default AuthStateContextProvider;

export {
    AuthStateContext
}