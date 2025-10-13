import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

import { getLowStockReport } from "@/lib/api/dashboard"
import type { components } from "@/lib/api/schema"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
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
        accessorKey: "total_quantity",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Quantity Left
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            return (
                <div className="font-medium text-destructive">
                    {row.getValue("total_quantity")}
                </div>
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

export const Route = createFileRoute("/_authenticated/reports/low-stock")({
    component: LowStockReportComponent,
})

function LowStockReportComponent() {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["lowStockReport"],
        queryFn: () => getLowStockReport(),
    })

    if (isError) {
        return <div>Error: {error.message}</div>
    }

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-xl font-bold tracking-tight">Low Stock Report</h2>
                <p className="text-muted-foreground">
                    Medicines with a total quantity of 10 or less.
                </p>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-10 w-1/4" />
                    <Skeleton className="h-[400px] w-full" />
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={data ?? []}
                    filterColumnId="name"
                    filterColumnPlaceholder="Filter by name..."
                />
            )}
        </div>
    )
}