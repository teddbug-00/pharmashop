import api from "./client"
import type { components } from "./schema"

type UserPublic = components["schemas"]["UserPublic"]
type UserCreateWithRole = components["schemas"]["UserCreateWithRole"]

export const getUsers = async (
    skip: number = 0,
    limit: number = 100,
): Promise<UserPublic[]> => {
    const response = await api.get<UserPublic[]>("/users/", {
        params: { skip, limit },
    })
    return response.data
}

export const createUser = async (user: UserCreateWithRole): Promise<UserPublic> => {
    const { data } = await api.post<UserPublic>("/users/", user)
    return data
}

export const deleteUser = async (userId: number): Promise<void> => {
    await api.delete(`/users/${userId}`)
}


export const updateUser = async ({ userId, user }: { userId: number; user: UserUpdate }): Promise<UserPublic> => {
    const { data } = await api.put<UserPublic>(`/users/${userId}`, user)
    return data
}