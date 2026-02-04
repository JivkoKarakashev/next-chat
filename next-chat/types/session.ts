interface Session {
  id: string,
  created_at: Date,
  expires_at: Date,
  user_id: string
}

// const SESSION_TTL = 1000 * 15 * 60; // 15 min
const SESSION_TTL = 1000 * 30 * 60; // 1 min

export {
  type Session,
  SESSION_TTL
}