'use client';

import { useContext, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import authIcon from '@/public/images/auth-icon.jpg';
import styles from './auth-form.module.css';

import { auth } from '@/actions/auth.ts';
import { LoginFormState, RegisterFormState, loginFormStateInit, registerFormStateInit } from '@/types/form-state.ts';
import { AuthMode } from '@/types/query-params.ts';
import { AuthStateContext } from '@/context/auth.tsx';
import { formValidator } from '@/utils/form-validator.ts';

const AuthForm = ({ authmode }: { authmode: AuthMode }): React.ReactElement => {
  console.log(`Auth mode:${authmode}`);
  const { isAuthSetter, uIdSetter, sIdSetter } = useContext(AuthStateContext);
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [registerFormState, setRegisterFormState] = useState<RegisterFormState>(registerFormStateInit);
  const [loginFormState, setLoginFormState] = useState<LoginFormState>(loginFormStateInit);
  const router = useRouter();

  const formSubmitHandler = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    const fState = formValidator(authmode, username.trim(), email.trim(), password.trim());
    console.log(fState);
    if (authmode === 'register') {
      setRegisterFormState(fState as RegisterFormState);
      // console.log(fState);
    } else {
      setLoginFormState(fState as LoginFormState);
      // console.log(fState);
    }

    if (fState.valid) {
      const authResult = await auth.call(null, authmode, { username, email, password });
      // console.log(authResult);
      const uId = 'uId';
      const error = 'error';

      if (authResult && error in authResult) {
        const error = authResult;
        console.log(`Code: ${error.code}`);
        if (authmode === 'register') {
          setRegisterFormState(prev => {
            return {
              ...prev,
              valid: false,
              email: {
                ...prev.email,
                valid: false,
                error: error.code === '23505'
                  ? 'An account with the same email already exists!'
                  : error.constraint
              }
            }
          });
        } else {
          setLoginFormState(prev => {
            return {
              ...prev,
              valid: false,
              email: {
                ...prev.email,
                valid: false,
                error: error.error === 'DB_ERROR'
                  ? 'Incorrect credentials!'
                  : error.constraint
              }
            }
          });
        }
      } else if (authResult && uId in authResult) {
        isAuthSetter(true);
        uIdSetter(authResult.uId);
        sIdSetter(authResult.sId);
        router.replace('/chat');
      }
    }
  };

  return (
    <form id="auth-form" className={styles['auth-form']}>
      <div>
        <Image
          src={authIcon}
          alt="A lock icon"
          loading='eager'
          fetchPriority='high'
        />
      </div>
      {authmode === 'register' && (
        <>
          <p>
            <label htmlFor="username">Username</label>
            <input type="text" name="username" id="username" value={username} onChange={e => setUsername(e.currentTarget.value)} />
            {!registerFormState.valid && registerFormState.stage === 'updated' && (
              <span className={styles['form-error']}>{registerFormState.email.error}</span>
            )}
          </p>
          <p>
            <label htmlFor="email">Email</label>
            <input type="email" name="email" id="email" value={email} onChange={e => setEmail(e.currentTarget.value)} />
            {!registerFormState.valid && registerFormState.stage === 'updated' && (
              <span className={styles['form-error']}>{registerFormState.email.error}</span>
            )}
          </p>
          <p>
            <label htmlFor="password">Password</label>
            <input type="password" name="password" id="password" value={password} onChange={e => setPassword(e.currentTarget.value)} />
            {!registerFormState.valid && registerFormState.stage === 'updated' && (
              <span className={styles['form-error']}>{registerFormState.password.error}</span>
            )}
          </p>
        </>
      )}
      {authmode === 'login' && (
        <>
          <p>
            <label htmlFor="email">Email</label>
            <input type="email" name="email" id="email" value={email} onChange={e => setEmail(e.currentTarget.value)} />
            {!loginFormState.valid && loginFormState.stage === 'updated' && (
              <span className={styles['form-error']}>{loginFormState.email.error}</span>
            )}
          </p>
          <p>
            <label htmlFor="password">Password</label>
            <input type="password" name="password" id="password" value={password} onChange={e => setPassword(e.currentTarget.value)} />
            {!loginFormState.valid && loginFormState.stage === 'updated' && (
              <span className={styles['form-error']}>{loginFormState.password.error}</span>
            )}
          </p>
        </>
      )}
      <p>
        <button type="button" onClick={formSubmitHandler}>
          {authmode === 'register' ? 'Create Account' : 'Login'}
        </button>
      </p>
      <p>
        {authmode === 'register' && (<Link href="/?authmode=login">Login with existing account.</Link>)}
        {authmode === 'login' && (<Link href="/?authmode=register">Create an account.</Link>)}
      </p>
    </form>
  );
};

export default AuthForm;
