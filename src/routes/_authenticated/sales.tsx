import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/sales")({
    component: SalesComponent,
})

function SalesComponent() {
    return (
        <div>
            <h2 className="text-2xl font-bold">Sales</h2>
            <p>Sales records page coming soon...</p>
        </div>
    )
}