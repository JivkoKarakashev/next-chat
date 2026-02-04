import { AuthMode } from "@/types/query-params.ts";
import { FormState, emailError, formStateInit, passError } from "@/types/form-state.ts";

const formValidator = (authmode: AuthMode, email: string, password: string): FormState => {
  const regExp = new RegExp('^[a-z0-9]+([._-]?[a-z0-9]+)+@[a-z0-9]+([._-]?[a-z0-9]+)+\\.[a-z]{2,3}$');

  const isEmailValid = regExp.test(email);
  const isPassValid = !!password && password.length >= 6;
  let formState: FormState = {
    ...formStateInit,
    stage: 'updated',
    email: {
      ...formStateInit.email,
      value: email
    },
    password: {
      ...formStateInit.password,
      value: password
    }
  };

  if (!isEmailValid || !isPassValid) {
    if (!isEmailValid && isPassValid) {
      formState = {
        ...formState,
        password: {
          ...formState.password,
          valid: true
        }
      }
      if (!email) {
        formState = {
          ...formState,
          email: {
            ...formState.email,
            error: authmode === 'register' ? emailError.required : emailError.invalidCredentials
          }
        }
      } else {
        formState = {
          ...formState,
          email: {
            ...formState.email,
            error: authmode === 'register' ? emailError.invalid : emailError.invalidCredentials
          }
        }
      }
    } else if (isEmailValid && !isPassValid) {
      formState = {
        ...formState,
        email: {
          ...formState.email,
          valid: true
        }
      }
      if (!password) {
        formState = {
          ...formState,
          password: {
            ...formState.password,
            error: authmode === 'register' ? passError.required : passError.invalidCredentials
          }
        };
      } else {
        formState = {
          ...formState,
          password: {
            ...formState.password,
            error: authmode === 'register' ? passError.invalid : passError.invalidCredentials
          }
        };
      }
    } else {
      if (!email && !password) {
        // console.log('here');
        formState = {
          ...formState,
          email: {
            ...formState.email,
            error: authmode === 'register' ? emailError.required : emailError.invalidCredentials
          },
          password: {
            ...formState.password,
            error: authmode === 'register' ? passError.required : passError.invalidCredentials
          }
        };
      } else if (email && !password) {
        formState = {
          ...formState,
          email: {
            ...formState.email,
            error: authmode === 'register' ? emailError.invalid : emailError.invalidCredentials
          },
          password: {
            ...formState.password,
            error: authmode === 'register' ? passError.required : passError.invalidCredentials
          }
        }
      } else if (!email && password) {
        formState = {
          ...formState,
          email: {
            ...formState.email,
            error: authmode === 'register' ? emailError.required : emailError.invalidCredentials
          },
          password: {
            ...formState.password,
            error: authmode === 'register' ? passError.invalid : passError.invalidCredentials
          }
        }
      } else {
        formState = {
          ...formState,
          email: {
            ...formState.email,
            error: authmode === 'register' ? emailError.invalid : emailError.invalidCredentials
          },
          password: {
            ...formState.password,
            error: authmode === 'register' ? passError.invalid : passError.invalidCredentials
          }
        }
      }
    }
  }

  return formState = {
    ...formState,
    valid: isEmailValid && isPassValid,
    email: {
      ...formState.email,
      valid: isEmailValid
    },
    password: {
      ...formState.password,
      valid: isPassValid
    }
  };
};

export {
  formValidator
}