let user = {
    userId: undefined,
    role: undefined,
}

export const getUser = () => {
    return user
}

export const setUser = (newUser: any) => {
    user = newUser
}
