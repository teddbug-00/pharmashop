import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/users")({
    component: UsersComponent,
})

function UsersComponent() {
    return (
        <div>
            <h2 className="text-2xl font-bold">Users</h2>
            <p>User management page coming soon...</p>
        </div>
    )
}