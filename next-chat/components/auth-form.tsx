'use client';

import { useActionState, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import authIcon from '@/public/images/auth-icon.jpg';
import styles from './auth-form.module.scss';

import { auth } from '@/actions/auth.ts';
import { formStateInit } from '@/types/form-state.ts';
import { AuthMode } from '@/types/home-page-params.ts';

const AuthForm = ({ authmode }: { authmode: AuthMode }): React.ReactElement => {
  // console.log(`Auth mode:${authmode}`);
  const [formState, formAction] = useActionState(auth.bind(null, authmode), { ...formStateInit });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <form id="auth-form" className={styles['auth-form']} action={formAction}>
      <div>
        <Image
          src={authIcon}
          alt="A lock icon"
          loading='eager'
          fetchPriority='high'
        />
      </div>
      <p>
        <label htmlFor="email">Email</label>
        <input type="email" name="email" id="email" value={email} onChange={e => setEmail(e.currentTarget.value)} />
        {!formState.valid && formState.stage === 'updated' && (
          <span className={styles['form-error']}>{formState.email.error}</span>
        )}
      </p>
      <p>
        <label htmlFor="password">Password</label>
        <input type="password" name="password" id="password" value={password} onChange={e => setPassword(e.currentTarget.value)} />
        {!formState.valid && formState.stage === 'updated' && (
          <span className={styles['form-error']}>{formState.password.error}</span>
        )}
      </p>
      <p>
        <button type="submit">
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
