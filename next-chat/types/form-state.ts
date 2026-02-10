import { FormDataEntries } from "./form-data-entries.ts";

interface FieldState {
  valid: boolean,
  value: string,
  error: string
}

interface RegisterFormState extends Omit<FormDataEntries, 'username' | 'email' | 'password'> {
  valid: boolean,
  stage: 'initial' | 'updated',
  username: FieldState,
  email: FieldState,
  password: FieldState
}

type LoginFormState = Omit<RegisterFormState, 'username'>;

interface FieldError {
  required: string,
  invalid: string,
  invalidCredentials: string
}

type UserError = FieldError;
type EmailError = FieldError;
type PassError = FieldError;

const emailError: EmailError = {
  required: 'Email is required!',
  invalid: 'A valid email is required!',
  invalidCredentials: 'Invalid credentials!'
}

const userError: UserError = {
  required: 'Username is required!',
  invalid: 'Username must be at least 3 characters long!',
  invalidCredentials: 'Invalid credentials!'
}

const passError: PassError = {
  required: 'Password is required!',
  invalid: 'Password must be at least 6 characters long!',
  invalidCredentials: 'Invalid credentials!'
}

const fieldStateInit: FieldState = {
  valid: false,
  value: '',
  error: ''
}

const registerFormStateInit: RegisterFormState = {
  username: { ...fieldStateInit },
  email: { ...fieldStateInit },
  password: { ...fieldStateInit },
  stage: 'initial',
  valid: false
}

const loginFormStateInit: LoginFormState = {
  email: { ...fieldStateInit },
  password: { ...fieldStateInit },
  stage: 'initial',
  valid: false
}

export {
  type FieldState,
  type RegisterFormState,
  type LoginFormState,
  registerFormStateInit,
  loginFormStateInit,
  userError,
  emailError,
  passError
}