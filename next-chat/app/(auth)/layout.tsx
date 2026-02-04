'use client';

import { useContext } from "react";

import "../globals.css";

import Header from "@/components/header/header.tsx";
import SocketStateContextProvider from "@/context/socket.tsx";
import { AuthStateContext } from "@/context/auth.tsx";

const AuthLayout = ({ children }: Readonly<{ children: React.ReactNode }>): React.ReactElement => {
  const { sId } = useContext(AuthStateContext);

  return (
    <>
      <SocketStateContextProvider key={sId}>
        <Header />
        {children}
      </SocketStateContextProvider>
    </>
  );
};

export default AuthLayout;