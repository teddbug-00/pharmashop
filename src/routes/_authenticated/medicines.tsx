import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/medicines")({
    component: MedicinesComponent,
})

function MedicinesComponent() {
    return (
        <div>
            <h2 className="text-2xl font-bold">Medicines</h2>
            <p>Medicine management page coming soon...</p>
        </div>
    )
}