'use client';

import { useContext } from "react";

import { AuthStateContext } from "@/context/auth.tsx";
import LogoutButton from "./logout-btn.tsx";

const Header = (): React.ReactElement => {

  const { isAuth } = useContext(AuthStateContext);
  return (
    <>
      {isAuth && (
        <header id="auth-header" className="auth-header">
          <p>Welcome back!</p>
          <LogoutButton />
        </header>
      )}
    </>
  );
};

export default Header;