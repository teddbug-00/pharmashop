import * as React from "react"
import {
    createRootRouteWithContext,
    Outlet,
    useRouter,
} from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/router-devtools"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useAuth } from "@/hooks/use-auth"
import { AuthProvider } from "@/hooks/use-auth"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

const queryClient = new QueryClient()

interface RouterContext {
    auth?: ReturnType<typeof useAuth>
}

export const Route = createRootRouteWithContext<RouterContext>()({
    component: RootComponent,
})

function RootComponent() {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
        >
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <AuthDependentContent />
                </AuthProvider>
            </QueryClientProvider>
        </ThemeProvider>
    )
}

function AuthDependentContent() {
    const auth = useAuth()
    const router = useRouter()

    // Effect to update the router's context with auth state
    React.useEffect(() => {
        router.update({
            context: {
                ...router.options.context,
                auth,
            },
        })
    }, [auth, router])

    // Effect to handle redirection after successful login
    React.useEffect(() => {
        if (!auth.loading && auth.isAuthenticated && router.state.location.pathname === '/login') {
            const searchParams = new URLSearchParams(router.state.location.search);
            const redirect = searchParams.get('redirect');
            console.log("AuthDependentContent: Authenticated and on login page. Redirecting to", redirect || '/');
            router.navigate({ to: redirect || '/', replace: true });
        }
    }, [auth.isAuthenticated, auth.loading, router, router.state.location.pathname, router.state.location.search]);


    if (auth.loading) {
        return <div>Loading application...</div>
    }

    return (
        <>
            <Outlet />
            <Toaster />
            <TanStackRouterDevtools initialIsOpen={false} />
            <ReactQueryDevtools initialIsOpen={false} />
        </>
    )
}