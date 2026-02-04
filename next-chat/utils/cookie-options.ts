const createSessionCookieOptions = (expires: Date) => {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires
  };
};

export {
  createSessionCookieOptions
}