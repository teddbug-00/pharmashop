import * as React from "react"
import type { components } from "@/lib/api/schema"

type User = components["schemas"]["UserPublic"]

interface AuthContextType {
    isAuthenticated: boolean
    user: User | null
    login: (token: string, user: User) => void
    logout: () => void
}

export const AuthContext = React.createContext<AuthContextType | null>(null)

export function useAuth() {
    const context = React.useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}