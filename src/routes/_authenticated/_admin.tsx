import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/_admin")({
    beforeLoad: ({ context }) => {
        // Safely access the user from the potentially undefined auth context
        const user = context.auth?.user

        // If the user doesn't exist or is not an ADMIN, redirect
        if (user?.role !== "ADMIN") { // Changed "admin" to "ADMIN"
            throw redirect({
                to: "/",
            })
        }
    },
    // This component just renders the child route (e.g., the Users page)
    component: () => <Outlet />,
})