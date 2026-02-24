import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

const createSessionCookieOptions = (expires: Date): Partial<ResponseCookie> => {
  const isProdEnv = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProdEnv,
    sameSite: 'none',
    path: '/',
    expires
  };
};

export {
  createSessionCookieOptions
}