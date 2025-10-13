import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { getMedicines } from "@/lib/api/medicines"
import type { components } from "@/lib/api/schema"
import { DataTable } from "@/components/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AddMedicineDialog } from "@/components/add-medicine-dialog"
import { MedicineActions } from "@/components/medicine-actions"

type Medicine = components["schemas"]["MedicineInList"]

const columns: ColumnDef<Medicine>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "category",
        header: "Category",
    },
    {
        accessorKey: "selling_price",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Selling Price
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("selling_price"))
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "GHS", // Changed to Ghanaian Cedi
            }).format(amount)
            return <div className="font-medium">{formatted}</div>
        },
    },
    {
        accessorKey: "total_quantity",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Total Quantity
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "earliest_expiry",
        header: "Earliest Expiry",
    },
    {
        id: "actions",
        cell: ({ row }) => {
            return <MedicineActions medicine={row.original} />
        },
    },
]

export const Route = createFileRoute("/_authenticated/medicines")({
    component: MedicinesComponent,
})

function MedicinesComponent() {
    const { data: medicinesData, isLoading: isLoadingMedicines, isError, error } = useQuery({
        queryKey: ["medicines"],
        queryFn: () => getMedicines(),
    })

    if (isError) {
        return <div>Error: {error.message}</div>
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold tracking-tight">
                        Inventory
                    </h2>
                    <p className="text-muted-foreground">
                        Manage all medicines in your inventory.
                    </p>
                </div>
                <AddMedicineDialog />
            </div>

            {isLoadingMedicines ? (
                <div className="space-y-4">
                    <Skeleton className="h-10 w-1/4" />
                    <Skeleton className="h-[400px] w-full" />
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={medicinesData ?? []}
                    filterColumnId="name"
                    filterColumnPlaceholder="Filter by name..."
                />
            )}
        </div>
    )
}