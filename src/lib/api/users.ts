import api from "./client"
import type { components } from "./schema"

type UserPublic = components["schemas"]["UserPublic"]
type UserCreateWithRole = components["schemas"]["UserCreateWithRole"]
type UserUpdate = components["schemas"]["UserUpdate"]
type UserPasswordReset = components["schemas"]["UserPasswordReset"]

// Define a new type for UserUpdate that omits the username, as it's no longer edited from the frontend
type UserUpdateFrontend = Omit<UserUpdate, "username">;

export const getUsers = async (
    skip: number = 0,
    limit: number = 100,
): Promise<UserPublic[]> => {
    const response = await api.get<UserPublic[]>("/api/v1/users/", {
        params: { skip, limit },
    })
    return response.data
}

export const createUser = async (user: UserCreateWithRole): Promise<UserPublic> => {
    const { data } = await api.post<UserPublic>("/api/v1/users/", user)
    return data
}

export const deleteUser = async (userId: number): Promise<void> => {
    await api.delete(`/api/v1/users/${userId}`)
}


export const updateUser = async ({ userId, user }: { userId: number; user: UserUpdateFrontend }): Promise<UserPublic> => {
    const { data } = await api.put<UserPublic>(`/api/v1/users/${userId}`, user)
    return data
}

export const resetUserPassword = async ({ userId, new_password }: { userId: number; new_password: UserPasswordReset }): Promise<UserPublic> => {
    const { data } = await api.patch<UserPublic>(`/api/v1/users/${userId}/reset-password`, new_password)
    return data
}