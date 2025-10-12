import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { getMedicines } from "@/lib/api/medicines"
import { getExpiringSoonCount, getLowStockCount } from "@/lib/api/dashboard"
import type { components } from "@/lib/api/schema"
import { DataTable } from "@/components/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import {
    AlertTriangle,
    ArrowUpDown,
    Clock,
    MoreHorizontal,
    Package,
    PlusCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

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
            const medicine = row.original
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(String(medicine.id))}
                        >
                            Copy medicine ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View details</DropdownMenuItem>
                        <DropdownMenuItem>Edit medicine</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                            Delete medicine
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]

export const Route = createFileRoute("/_authenticated/medicines")({
    component: MedicinesComponent,
})

function MedicinesComponent() {
    const { data: medicinesData, isLoading: isLoadingMedicines, isError, error } = useQuery({
        queryKey: ["medicines"],
        queryFn: getMedicines,
    })

    const { data: lowStockCount, isLoading: isLoadingLowStock } = useQuery({
        queryKey: ["lowStockCount"],
        queryFn: () => getLowStockCount(10), // Threshold of 10
    })

    const { data: expiringSoonCount, isLoading: isLoadingExpiring } = useQuery({
        queryKey: ["expiringSoonCount"],
        queryFn: () => getExpiringSoonCount(30), // Expiring in next 30 days
    })

    if (isError) {
        return <div>Error: {error.message}</div>
    }

    return (
        <div className="space-y-4">
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
                    <Button size="sm">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Medicine
                    </Button>
                </div>
            </div>

            <div className="mx-auto grid w-full max-w-6xl gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Products
                        </CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoadingMedicines ? (
                            <Skeleton className="h-8 w-1/2" />
                        ) : (
                            <div className="text-xl font-bold">
                                {medicinesData?.length ?? 0}
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Low Stock
                        </CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoadingLowStock ? (
                            <Skeleton className="h-8 w-1/2" />
                        ) : (
                            <div className="text-xl font-bold">{lowStockCount ?? 0}</div>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Expiring Soon
                        </CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoadingExpiring ? (
                            <Skeleton className="h-8 w-1/2" />
                        ) : (
                            <div className="text-xl font-bold">{expiringSoonCount ?? 0}</div>
                        )}
                    </CardContent>
                </Card>
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