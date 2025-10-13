import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

import { getExpiringSoonReport } from "@/lib/api/dashboard"
import type { components } from "@/lib/api/schema"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

type ExpiringBatch = components["schemas"]["ExpiringBatchItem"]

const columns: ColumnDef<ExpiringBatch>[] = [
    {
        accessorKey: "medicine_name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Medicine Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "batch_number",
        header: "Batch Number",
        cell: ({ row }) => {
            return row.getValue("batch_number") || "N/A"
        },
    },
    {
        accessorKey: "quantity_remaining",
        header: "Quantity Left",
    },
    {
        accessorKey: "expiry_date",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Expiry Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const date = new Date(row.getValue("expiry_date"))
            const formatted = date.toLocaleDateString()
            return <div className="font-medium text-destructive">{formatted}</div>
        },
    },
]

export const Route = createFileRoute("/_authenticated/reports/expiring-soon")({
    component: ExpiringSoonReportComponent,
})

function ExpiringSoonReportComponent() {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["expiringSoonReport"],
        queryFn: () => getExpiringSoonReport(),
    })

    if (isError) {
        return <div>Error: {error.message}</div>
    }

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-xl font-bold tracking-tight">
                    Expiring Soon Report
                </h2>
                <p className="text-muted-foreground">
                    Batches expiring in the next 30 days.
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
                    filterColumnId="medicine_name"
                    filterColumnPlaceholder="Filter by medicine name..."
                />
            )}
        </div>
    )
}