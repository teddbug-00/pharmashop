import api from "./client"
import type { components } from "./schema"

type Token = components["schemas"]["Token"]
type RefreshTokenRequest = components["schemas"]["RefreshToken"]

export const refreshAccessToken = async (refreshToken: string): Promise<Token> => {
    const response = await api.post<Token>("/api/v1/auth/token/refresh", {
        refresh_token: refreshToken,
    })
    return response.data
}
