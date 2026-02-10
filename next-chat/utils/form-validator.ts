import { AuthMode } from "@/types/query-params.ts";
import { LoginFormState, RegisterFormState, emailError, loginFormStateInit, passError, registerFormStateInit, userError } from "@/types/form-state.ts";

const invalidUsername = (authmode: AuthMode, fState: RegisterFormState): RegisterFormState => {
  const formState: RegisterFormState = {
    ...fState,
    username: {
      ...fState.username,
      valid: false,
      error: authmode === 'register' && !fState.username.value ? userError.required
        : authmode === 'register' && fState.username.value.length < 3 ? userError.invalid
          : ''
    }
  };
  return formState;
};

const invalidEmail = (authmode: AuthMode, fState: RegisterFormState | LoginFormState): RegisterFormState | LoginFormState => {
  const formState: RegisterFormState | LoginFormState = {
    ...fState,
    email: {
      ...fState.email,
      valid: false,
      error: authmode === 'register' && !fState.email.value ? emailError.required
        : authmode === 'register' && fState.email.value ? emailError.invalid
          : authmode === 'login' && !fState.email.value ? emailError.required
            : emailError.invalidCredentials
    }
  };
  return formState;
};

const invalidPassword = (authmode: AuthMode, fState: RegisterFormState | LoginFormState): RegisterFormState | LoginFormState => {
  const formState: RegisterFormState | LoginFormState = {
    ...fState,
    password: {
      ...fState.password,
      valid: false,
      error: authmode === 'register' && !fState.password.value ? passError.required
        : authmode === 'register' && fState.password.value.length < 6 ? passError.invalid
          : authmode === 'login' && !fState.password.value ? passError.required
            : passError.invalidCredentials
    }
  };
  return formState;
};

const loginFormValidator = (authmode: AuthMode, email: string, password: string): LoginFormState => {
  const regExp = new RegExp('^[a-z0-9]+([._-]?[a-z0-9]+)+@[a-z0-9]+([._-]?[a-z0-9]+)+\\.[a-z]{2,3}$');
  const isEmailValid = regExp.test(email);
  const isPassValid = !!password && password.length >= 6;

  let loginFormState: LoginFormState = {
    ...loginFormStateInit,
    stage: 'updated',
    email: {
      ...loginFormStateInit.email,
      value: email
    },
    password: {
      ...loginFormStateInit.password,
      value: password
    }
  };

  if (!isEmailValid) {
    loginFormState = invalidEmail(authmode, loginFormState);
  }
  if (!isPassValid) {
    loginFormState = invalidPassword(authmode, loginFormState);
  }

  return loginFormState = {
    ...loginFormState,
    valid: isEmailValid && isPassValid,
    email: {
      ...loginFormState.email,
      valid: isEmailValid
    },
    password: {
      ...loginFormState.password,
      valid: isPassValid
    }
  };
};

const registerFormValidator = (authmode: AuthMode, username: string, email: string, password: string): RegisterFormState => {
  const regExp = new RegExp('^[a-z0-9]+([._-]?[a-z0-9]+)+@[a-z0-9]+([._-]?[a-z0-9]+)+\\.[a-z]{2,3}$');

  const isUserValid = !!username && username.length >= 3;
  const isEmailValid = regExp.test(email);
  const isPassValid = !!password && password.length >= 6;

  let registerFormState: RegisterFormState = {
    ...registerFormStateInit,
    stage: 'updated',
    username: {
      ...registerFormStateInit.username,
      value: username
    },
    email: {
      ...registerFormStateInit.email,
      value: email
    },
    password: {
      ...registerFormStateInit.password,
      value: password
    }
  };

  if (!isUserValid) {
    registerFormState = invalidUsername(authmode, registerFormState);
  }
  if (!isEmailValid) {
    registerFormState = invalidEmail(authmode, registerFormState) as RegisterFormState;
  }
  if (!isPassValid) {
    registerFormState = invalidPassword(authmode, registerFormState) as RegisterFormState;
  }

  return registerFormState = {
    ...registerFormState,
    valid: isUserValid && isEmailValid && isPassValid,
    username: {
      ...registerFormState.username,
      valid: isUserValid
    },
    email: {
      ...registerFormState.email,
      valid: isEmailValid
    },
    password: {
      ...registerFormState.password,
      valid: isPassValid
    }
  };
};

function formValidator(authmode: AuthMode, username: string, email: string, password: string): RegisterFormState | LoginFormState {
  switch (authmode) {
    case 'register': {
      return registerFormValidator(authmode, username, email, password);
    }
    case 'login': {
      return loginFormValidator(authmode, email, password);
    }
  }
}

export {
  formValidator
}