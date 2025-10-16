import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"

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
    console.log("AuthenticatedLayout component is rendering!"); // <--- ADD THIS LINE
    return (
        <div className="flex min-h-screen w-full flex-col">
            <header className="sticky top-0 z-40 w-full border-b bg-background">
                <div className="flex h-14 items-center justify-between px-4 md:px-8">
                    <MainNav />
                    <UserNav />
                </div>
            </header>
            <div className="flex-1">
                <main className="p-4 md:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}