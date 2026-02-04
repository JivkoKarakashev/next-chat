import type { Metadata } from "next";
import { cookies } from "next/headers";

import "./globals.css";

import { validateSession } from "@/lib/sessions.ts";
import AuthStateContextProvider from "@/context/auth.tsx";
import { AuthState } from "@/types/auth-state";

export const metadata: Metadata = {
  title: "Next Chat",
  description: "Chat app",
};

const AuthRootLayout = async ({ children }: Readonly<{ children: React.ReactNode }>): Promise<React.ReactElement> => {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session')?.value;
  // console.log(sIdInit);
  let authStateInit: AuthState = {
    isAuth: sessionId ? true : false,
    uId: undefined,
    sId: undefined
  };

  if (sessionId) {
    const session = await validateSession(sessionId);
    if (!session) {
      cookieStore.delete('session');
    }
    authStateInit = { ...authStateInit, isAuth: !!session, uId: session?.user_id, sId: session?.id };
  }

  return (
    <html lang="en">
      <body>
        <AuthStateContextProvider authStateInit={authStateInit}>
          {children}
        </AuthStateContextProvider>
      </body>
    </html>
  );
};

export default AuthRootLayout;