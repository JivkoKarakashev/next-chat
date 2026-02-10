'use server';

import { cookies } from "next/headers";
import { DatabaseError } from "pg";

import { FormDataEntries } from "@/types/form-data-entries.ts";
import { createUser, getUserByEmail } from "@/lib/users.ts";
import { RegisterUser } from "@/types/user.ts";
import { hashPassword, verifyPassword } from "@/utils/hash.ts";
import { createSession, deleteSession } from "@/lib/sessions.ts";
import { createSessionCookieOptions } from "@/utils/cookie-options.ts";
import { AuthMode } from "@/types/query-params.ts";
import { generateSecureRandomString as generateUserId } from "@/utils/secure-random-string.ts";

interface DBError {
    error: 'DB_ERROR',
    code?: string,
    constraint: string
}

interface SuccessAuth {
    uId: string,
    sId: string
}

type AuthResult = SuccessAuth | DBError | undefined;

const register = async (formData: FormDataEntries): Promise<AuthResult> => {
    const { username, email, password } = formData;
    const hash = await hashPassword(password);
    const id = generateUserId();
    const created_at = new Date();

    const regUser: RegisterUser = { id, username, email, hash, created_at };
    // console.log(regUser);

    try {
        const user_id = await createUser(regUser);
        // console.log(user_id);
        const session = await createSession(user_id);
        const cookieStore = await cookies();
        const sessionCookieOptions = createSessionCookieOptions(session.expires_at);
        cookieStore.set('session', session.id, sessionCookieOptions);
        return { uId: user_id, sId: session.id };
    } catch (error) {
        if (error instanceof DatabaseError) {
            const { code, constraint } = error;
            if (code === '23505' && constraint) {
                return {
                    error: 'DB_ERROR',
                    code,
                    constraint
                };
            }
        }
        return undefined;
    }
};

const login = async (formData: FormDataEntries): Promise<AuthResult> => {
    const { email, password } = formData;
    // console.log({ email, password });
    const authUser = await getUserByEmail(email);
    const isValidPass = await verifyPassword(password, authUser?.password ?? '');

    if (!authUser || !isValidPass) {
        return {
            error: 'DB_ERROR',
            constraint: 'Incorrect credentials!',
        }
    }

    const session = await createSession(authUser.id);
    const cookieStore = await cookies();
    const sessionCookieOptions = createSessionCookieOptions(session.expires_at);
    cookieStore.set('session', session.id, sessionCookieOptions);
    return { uId: authUser.id, sId: session.id };
};

const logout = async (): Promise<void> => {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session')?.value;
    // console.log(sessionId);
    if (sessionId) {
        await deleteSession(sessionId);
    }
    cookieStore.delete('session');
};

async function auth(authmode: AuthMode, formData: FormDataEntries) {
    // console.log(`Auth mode:${authmode}`);
    switch (authmode) {
        case 'login': {
            return login(formData);
        }
        case 'register': {
            return register(formData);
        }
    }
}

export {
    auth,
    logout
}