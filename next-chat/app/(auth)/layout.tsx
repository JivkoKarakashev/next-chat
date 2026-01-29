import type { Metadata } from "next";
import { cookies } from "next/headers";

import "../globals.css";

import Providers from "@/components/providers.tsx";
import { logout } from "@/actions/auth.ts";
import { validateSession } from "@/lib/sessions.ts";
import { AuthState } from "@/types/auth-state.ts";

export const metadata: Metadata = {
  title: "Next Chat",
  description: "Chat app",
};

const AuthRootLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session')?.value;
  // console.log(sessionId);

  let authStateInit: AuthState = {
    isAuth: false,
    sId: undefined,
    uId: undefined
  }

  if (sessionId) {
    const session = await validateSession(sessionId);
    if (session) {
      const { user_id, id } = session;
      authStateInit = {
        isAuth: true,
        sId: id,
        uId: user_id
      }
    }
    if (!session) {
      cookieStore.delete('session');
    }
  }

  return (
    <html lang="en" theme-data="dark">
      <body>
        <header id="auth-header" className="auth-header">
          <p>Welcome back!</p>
          <form action={logout}>
            <button type='submit' className="logout-btn">Logout</button>
          </form>
        </header>
        <Providers authStateInit={authStateInit}>
          {children}
        </Providers>
      </body>
    </html>
  );
};

export default AuthRootLayout;