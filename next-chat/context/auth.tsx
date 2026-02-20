'use client';

import { createContext, useContext, useEffect, useState } from "react";

import { AuthState } from "@/types/auth-state.ts";
import { SocketStateContext } from "./socket.tsx";

interface AuthStateInterface {
  isAuth: boolean,
  isAuthSetter: (isAuth: boolean) => void,
  uId: string | undefined,
  uIdSetter: (uId: string | undefined) => void,
  sId: string | undefined,
  sIdSetter: (sId: string | undefined) => void
}

const authStateInterfaceInit: AuthStateInterface = {
  isAuth: false,
  isAuthSetter: () => { },
  uId: undefined,
  uIdSetter: () => { },
  sId: undefined,
  sIdSetter: () => { }
};

const AuthStateContext = createContext<AuthStateInterface>(authStateInterfaceInit);

function AuthStateContextProvider({ children, authStateInit }: { children: React.ReactNode, authStateInit: AuthState }): React.ReactElement {
  // console.log(authStateInit);
  const [isAuth, setIsAuth] = useState<boolean>(authStateInit.isAuth);
  const [uId, setUId] = useState<string | undefined>(authStateInit.uId);
  const [sId, setSId] = useState<string | undefined>(authStateInit.sId);

  const isAuthSetter = (isAuth: boolean) => setIsAuth(isAuth);
  const uIdSetter = (uId: string | undefined) => setUId(uId);
  const sIdSetter = (sId: string | undefined) => setSId(sId);

  const { reset } = useContext(SocketStateContext);

  useEffect(() => reset(), [reset, isAuth]);

  return (
    <AuthStateContext.Provider value={{ isAuth, uId, sId, isAuthSetter, uIdSetter, sIdSetter }}>
      {children}
    </AuthStateContext.Provider>
  );
}

export default AuthStateContextProvider;

export {
  AuthStateContext
}