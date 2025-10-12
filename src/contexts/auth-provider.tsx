import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import { AuthContext } from "@/hooks/use-auth"
import type { components } from "@/lib/api/schema"

type User = components["schemas"]["UserPublic"]

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = React.useState<User | null>(() => {
        const storedUser = localStorage.getItem("user")
        try {
            return storedUser ? JSON.parse(storedUser) : null
        } catch (e) {
            console.error("Failed to parse user from localStorage", e)
            return null
        }
    })

    const navigate = useNavigate()

    const login = (token: string, newUser: User) => {
        localStorage.setItem("access_token", token)
        localStorage.setItem("user", JSON.stringify(newUser))
        setUser(newUser)
        navigate({ to: "/" }).then(() => {})
    }

    const logout = () => {
        localStorage.removeItem("access_token")
        localStorage.removeItem("user")
        setUser(null)
        navigate({ to: "/login" }).then(() => {})
    }

    const value = {
        isAuthenticated: !!user,
        user,
        login,
        logout,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}