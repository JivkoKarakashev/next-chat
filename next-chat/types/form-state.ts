import { FormDataEntries } from "./form-data-entries.ts";

interface FieldState {
  valid: boolean,
  value: string,
  error: string
}

interface FormState extends Omit<FormDataEntries, 'email' | 'password'> {
  valid: boolean,
  stage: 'initial' | 'updated',
  email: FieldState,
  password: FieldState
}

interface EmailError {
  required: string,
  invalid: string,
  invalidCredentials: string
}

type PassError = EmailError;

const emailError: EmailError = {
  required: 'Email is required!',
  invalid: 'A valid email is required!',
  invalidCredentials: 'Invalid credentials!'
}

const fieldStateInit: FieldState = {
  valid: false,
  value: '',
  error: ''
}

const formStateInit: FormState = {
  email: { ...fieldStateInit },
  password: { ...fieldStateInit },
  stage: 'initial',
  valid: false
}

const passError: PassError = {
  required: 'Password is required!',
  invalid: 'Password must be at least 6 characters long!',
  invalidCredentials: 'Invalid credentials!'
}

export {
  type FieldState,
  type FormState,
  formStateInit,
  emailError,
  passError
}