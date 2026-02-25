'use client';

import { useContext } from "react";

import { logout } from "@/actions/auth.ts";
import { AuthStateContext } from "@/context/auth.tsx";
import { SocketStateContext } from "@/context/socket.tsx";

const LogoutButton = (): React.ReactElement => {
  const { isAuthSetter, uIdSetter, sIdSetter } = useContext(AuthStateContext);
  const { disconnect } = useContext(SocketStateContext);

  const logoutHandler = async (): Promise<void> => {
    try {
      disconnect();
      await logout();
      uIdSetter(undefined);
      sIdSetter(undefined);
      isAuthSetter(false);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <button onClick={logoutHandler} className="logout-btn">
      Logout
    </button>
  );
};

export default LogoutButton;