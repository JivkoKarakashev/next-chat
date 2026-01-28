interface RegisterUser {
    email: string,
    hash: string,
    created_at: Date
}

interface AuthUser extends Omit<RegisterUser, 'hash'> {
    id: number,
    password: string
}

export {
    type AuthUser,
    type RegisterUser
}