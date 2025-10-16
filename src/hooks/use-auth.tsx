import * as React from "react"
import type { components } from "@/lib/api/schema"
import api from "@/lib/api/client"
import { refreshAccessToken } from "@/lib/api/auth"
import { jwtDecode } from "jwt-decode"

type User = components["schemas"]["UserPublic"]
type UserRole = components["schemas"]["UserRole"]

interface AuthContextType {
    isAuthenticated: boolean
    user: User | null
    login: (accessToken: string, refreshToken: string, user: User) => void
    logout: () => void
    accessToken: string | null;
    refreshToken: string | null;
}

export const AuthContext = React.createContext<AuthContextType | null>(null)

export function useAuth() {
    const context = React.useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}

interface AuthProviderProps {
    children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [accessToken, setAccessToken] = React.useState<string | null>(null)
    const [refreshToken, setRefreshToken] = React.useState<string | null>(null)
    const [user, setUser] = React.useState<User | null>(null)
    const [isAuthenticated, setIsAuthenticated] = React.useState(false)

    // Load tokens and user from localStorage on initial load
    React.useEffect(() => {
        const storedAccessToken = localStorage.getItem("accessToken")
        const storedRefreshToken = localStorage.getItem("refreshToken")
        const storedUser = localStorage.getItem("user")

        if (storedAccessToken && storedRefreshToken && storedUser) {
            setAccessToken(storedAccessToken)
            setRefreshToken(storedRefreshToken)
            setUser(JSON.parse(storedUser))
            setIsAuthenticated(true)
        }
    }, [])

    const login = React.useCallback((newAccessToken: string, newRefreshToken: string, newUser: User) => {
        localStorage.setItem("accessToken", newAccessToken)
        localStorage.setItem("refreshToken", newRefreshToken)
        localStorage.setItem("user", JSON.stringify(newUser))
        setAccessToken(newAccessToken)
        setRefreshToken(newRefreshToken)
        setUser(newUser)
        setIsAuthenticated(true)
    }, [])

    const logout = React.useCallback(() => {
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        localStorage.removeItem("user")
        setAccessToken(null)
        setRefreshToken(null)
        setUser(null)
        setIsAuthenticated(false)
    }, [])

    // Axios Interceptor for automatic token refresh
    React.useEffect(() => {
        const interceptor = api.interceptors.request.use(
            async (config) => {
                if (!accessToken) {
                    return config
                }

                const decodedToken: { exp: number } = jwtDecode(accessToken)
                const currentTime = Date.now() / 1000

                // If token is expired and a refresh token exists
                if (decodedToken.exp < currentTime && refreshToken) {
                    try {
                        const response = await refreshAccessToken(refreshToken)
                        const newAccessToken = response.access_token
                        const newRefreshToken = response.refresh_token
                        const newUserRole = response.user_role

                        // Construct a minimal UserPublic object for the updated user
                        const newUser: User = {
                            id: user?.id || 0, // Keep existing ID or use placeholder
                            username: user?.username || "", // Keep existing username or use placeholder
                            full_name: user?.full_name || "", // Keep existing full_name or use placeholder
                            role: newUserRole,
                        };

                        login(newAccessToken, newRefreshToken, newUser)
                        config.headers.Authorization = `Bearer ${newAccessToken}`
                    } catch (error) {
                        console.error("Failed to refresh token:", error)
                        logout()
                        return Promise.reject(error)
                    }
                } else if (decodedToken.exp < currentTime && !refreshToken) {
                    // Access token expired, but no refresh token available
                    logout();
                    return Promise.reject(new Error("Access token expired and no refresh token available."));
                }

                config.headers.Authorization = `Bearer ${accessToken}`
                return config
            },
            (error) => {
                return Promise.reject(error)
            },
        )

        return () => {
            api.interceptors.request.eject(interceptor)
        }
    }, [accessToken, refreshToken, user, login, logout])

    const contextValue = React.useMemo(
        () => ({
            isAuthenticated,
            user,
            login,
            logout,
            accessToken,
            refreshToken,
        }),
        [isAuthenticated, user, login, logout, accessToken, refreshToken],
    )

    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}