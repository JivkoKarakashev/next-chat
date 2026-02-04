type AuthMode = 'register' | 'login';
type AuthParams = '?authmode=register' | '?authmode=login';

const queryParamsDefault: AuthParams = '?authmode=login';

export {
  type AuthMode,
  queryParamsDefault
}