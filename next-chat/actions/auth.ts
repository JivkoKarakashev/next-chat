'use server';

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { DatabaseError } from "pg";

import { FormDataEntries } from "@/types/form-data-entries.ts";
import { FormState } from "@/types/form-state.ts";
import { formValidator } from "@/utils/form-validator.ts";
import { createUser, getUserByEmail } from "@/lib/users.ts";
import { RegisterUser } from "@/types/user.ts";
import { hashPassword, verifyPassword } from "@/utils/hash.ts";
import { createSession, deleteSession } from "@/lib/sessions.ts";
import { createSessionCookieOptions } from "@/utils/cookie-options.ts";
import { AuthMode, queryParamsDefault } from "@/types/home-page-params.ts";

const register = async (authmode: AuthMode, _prevState: FormState, formData: FormData): Promise<FormState> => {
    const { email, password } = Object.fromEntries(formData) as unknown as FormDataEntries;
    // console.log(email, password);
    let formState = formValidator(authmode, email.trim(), password.trim());
    if (formState.valid === false) {
        return formState;
    }

    const hash = await hashPassword(formState.password.value);

    const regUser: RegisterUser = {
        email: formState.email.value,
        hash,
        created_at: new Date()
    };

    try {
        const user_id = await createUser(regUser);
        const { id, expires_at } = await createSession(user_id);
        const cookieStore = await cookies();
        const sessionCookieOptions = createSessionCookieOptions(expires_at);
        cookieStore.set('session', id, sessionCookieOptions);
        redirect('/chat');
    } catch (error) {
        if (error instanceof DatabaseError) {
            const { code, constraint } = error;
            // console.log(`Code: ${code}`);
            if (code === '23505') {
                return formState = {
                    ...formState,
                    valid: false,
                    email: {
                        ...formState.email,
                        valid: false,
                        error: constraint === 'users_email_key'
                            ? 'An account with the same email already exists!'
                            : 'Duplicate email address!'
                    }
                };
            }
        }
        throw error;
    }
};

const login = async (authmode: AuthMode, _prevState: FormState, formData: FormData): Promise<FormState> => {
    const { email, password } = Object.fromEntries(formData) as unknown as FormDataEntries;
    const authUser = await getUserByEmail(email);
    const isValidPass = await verifyPassword(password.trim(), authUser?.password ?? '');
    const passArg = isValidPass ? authUser?.password ?? '' : '';
    const formState = formValidator(authmode, authUser?.email ?? '', passArg);

    if (!formState.valid || !authUser || !isValidPass) {
        return formState;
    }

    const { id, expires_at } = await createSession(authUser.id);
    const cookieStore = await cookies();
    const sessionCookieOptions = createSessionCookieOptions(expires_at);
    cookieStore.set('session', id, sessionCookieOptions);
    redirect('/chat');
};

const logout = async (): Promise<void> => {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session')?.value;
    // console.log(sessionId);
    if (sessionId) {
        await deleteSession(sessionId);
    }
    cookieStore.delete('session');
    redirect(`/${queryParamsDefault}`);
};

async function auth(authmode: AuthMode, prevState: FormState, formData: FormData) {
    // console.log(`Auth mode:${authmode}`);
    switch (authmode) {
        case 'login': {
            return login(authmode, prevState, formData);
        }
        case 'register': {
            return register(authmode, prevState, formData);
        }
        default: return prevState;
    }
}

export {
    auth,
    logout
}