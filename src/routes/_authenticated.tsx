import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { AppSidebar } from "@/components/app-sidebar"
import {
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"

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
        <SidebarProvider>
            <div className="flex min-h-screen">
                <AppSidebar />
                <main className="flex-1 p-4 md:p-6">
                    <SidebarTrigger className="md:hidden" />
                    <Outlet />
                </main>
            </div>
        </SidebarProvider>
    )
}