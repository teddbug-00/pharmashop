import api from "./client"
import type { components } from "./schema"

type UserPublic = components["schemas"]["UserPublic"]

export const getUsers = async (
    skip: number = 0,
    limit: number = 100,
): Promise<UserPublic[]> => {
    const response = await api.get<UserPublic[]>("/users/", {
        params: { skip, limit },
    })
    return response.data
}