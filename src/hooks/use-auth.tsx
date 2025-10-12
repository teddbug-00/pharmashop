import type {components} from "@/lib/api/schema";
import * as React from "react";
import {useNavigate} from "@tanstack/react-router";

type User = components['schemas']['UserPublic']

interface AuthContextType {
    isAuthenticated: boolean
    user: User | null
    login: (token: string, user: User) => void
    logout: () => void
}

const AuthContext = React.createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode}) {
    const [user, setUser] = React.useState<User | null>(() => {
        const storedUser = localStorage.getItem("user")
        try {
            return storedUser ? JSON.parse(storedUser) : null
        } catch (e) {
            console.log(e)
            return null
        }
    })

    const navigate = useNavigate()

    const login = (token: string, newUser: User) => {
        localStorage.setItem("access_token", token)
        localStorage.setItem("user", JSON.stringify(newUser))
        setUser(newUser)
        navigate({to: "/"}).then(() => {})
    }

    const logout = () => {
        localStorage.removeItem("access_token")
        localStorage.removeItem("user")
        setUser(null)
        navigate({to: "/login"}).then(() => {})
    }

    const value = {
        isAuthenticated: !!user,
        user,
        login,
        logout,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = React.useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }

    return context
}