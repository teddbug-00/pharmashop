import {createFileRoute, Outlet, redirect} from "@tanstack/react-router";
import {MainNav} from "@/components/main-nav.tsx";
import {UserNav} from "@/components/user-nav.tsx";

export const Route = createFileRoute("/_authenticated")({
    beforeLoad: ({ context, location }) => {
        // The 'auth' context is passed down from the root route
        if (!context.auth?.isAuthenticated) {
            throw  redirect({
                to: "/login",
                search: {
                    redirect: location.href
                },
            })
        }
    },
    component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
    return (
        <div className="flex min-h-screen w-full flex-col">
            <header className="sticky top-0 z-40 w-full border-b bg-background">
                <div className="container flex h-16 items-center justify-between">
                    <MainNav />
                    <UserNav />
                </div>
            </header>
            <main className="container flex-1 p-4 md:p-8">
                <Outlet />
            </main>
        </div>
    )
}