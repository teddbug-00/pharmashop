import * as React from "react"
import {
    createRootRouteWithContext,
    Outlet,
    useRouter,
} from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/router-devtools"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { AuthProvider, useAuth } from "@/hooks/use-auth"

const queryClient = new QueryClient()

// Define the shape of the context we expect from the router
interface RouterContext {
    auth?: ReturnType<typeof useAuth>
}

export const Route = createRootRouteWithContext<RouterContext>()({
    component: RootComponent,
})

function RootComponent() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <RouterUpdater />
            </AuthProvider>
        </QueryClientProvider>
    )
}

// This will update the router context whenever auth state changes
function RouterUpdater() {
    const auth = useAuth()
    const router = useRouter()

    // Use an effect to update the router's context
    React.useEffect(() => {
        router.update({
            context: {
                ...router.options.context,
                auth,
            },
        })
    }, [auth, router])

    return (
        <>
            <Outlet />
            <TanStackRouterDevtools initialIsOpen={false} />
            <ReactQueryDevtools initialIsOpen={false} />
        </>
    )
}