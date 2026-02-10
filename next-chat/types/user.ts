interface RegisterUser {
  id: string,
  username: string,
  email: string,
  hash: string,
  created_at: Date
}

interface AuthUser extends Omit<RegisterUser, 'hash'> {
  password: string
}

export {
  type AuthUser,
  type RegisterUser
}