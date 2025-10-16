import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getMedicines, deleteMultipleMedicines } from "@/lib/api/medicines"
import type { components } from "@/lib/api/schema"
import { DataTable } from "@/components/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Trash2, XCircle, Filter } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AddMedicineDialog } from "@/components/add-medicine-dialog"
import { MedicineActions } from "@/components/medicine-actions"
import { ImportMedicinesDialog } from "@/components/import-medicines-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useDebounce } from "@/hooks/use-debounce"

type Medicine = components["schemas"]["MedicineInList"]
type CategoryEnum = components["schemas"]["CategoryEnum"]
type MedicineForm = components["schemas"]["MedicineForm"]

interface MedicineFilters {
    category?: CategoryEnum;
    form?: MedicineForm;
    brand?: string;
    name?: string;
}

const columns: ColumnDef<Medicine>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
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
        accessorKey: "brand",
        header: "Brand",
    },
    {
        accessorKey: "form",
        header: "Form",
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
    const queryClient = useQueryClient()
    const [rowSelection, setRowSelection] = React.useState({})
    const [filters, setFilters] = React.useState<MedicineFilters>({
        category: undefined,
        form: undefined,
        brand: undefined,
        name: undefined,
    })

    const debouncedBrandFilter = useDebounce(filters.brand, 500);
    const debouncedNameFilter = useDebounce(filters.name, 500);

    const { data: allMedicinesData, isLoading: isLoadingMedicines, isError, error } = useQuery({
        queryKey: ["medicines"],
        queryFn: () => getMedicines(0, 1000), // Fetch a larger set for client-side filtering
    })

    const deleteMedicinesMutation = useMutation({
        mutationFn: (ids: number[]) => deleteMultipleMedicines(ids),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["medicines"] })
            setRowSelection({}) // Clear selection after deletion
            toast.success("Selected medicines deleted successfully!")
        },
        onError: (err) => {
            toast.error("Failed to delete medicines", {
                description: err.message,
            })
        },
    })

    const handleDeleteSelected = () => {
        const selectedMedicineIds = Object.keys(rowSelection).map(Number)
        if (selectedMedicineIds.length > 0) {
            deleteMedicinesMutation.mutate(selectedMedicineIds)
        }
    }

    const handleClearFilters = () => {
        setFilters({ category: undefined, form: undefined, brand: undefined, name: undefined });
    };

    if (isError) {
        return <div>Error: {error.message}</div>
    }

    const selectedRowCount = Object.keys(rowSelection).length
    const hasActiveFilters = filters.category || filters.form || filters.brand || filters.name;

    const categories: CategoryEnum[] = [
        "Pain Relief", "Antibiotics", "Antiseptics", "Vitamins & Supplements",
        "Allergy & Hayfever", "Cold & Flu", "Digestive Health", "Skin Care", "Unassigned"
    ];

    const forms: MedicineForm[] = [
        "TABLET", "SYRUP", "CAPSULE", "INJECTION", "OINTMENT", "DROPS", "OTHER"
    ];

    // Client-side filtering
    const filteredMedicines = React.useMemo(() => {
        if (!allMedicinesData) return [];

        return allMedicinesData.filter(medicine => {
            let matches = true;

            if (filters.category && medicine.category !== filters.category) {
                matches = false;
            }
            if (filters.form && medicine.form !== filters.form) {
                matches = false;
            }
            if (debouncedBrandFilter && !medicine.brand.toLowerCase().includes(debouncedBrandFilter.toLowerCase())) {
                matches = false;
            }
            if (debouncedNameFilter && !medicine.name.toLowerCase().includes(debouncedNameFilter.toLowerCase())) {
                matches = false;
            }
            return matches;
        });
    }, [allMedicinesData, filters.category, filters.form, debouncedBrandFilter, debouncedNameFilter]);

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
                <div className="flex gap-2">
                    {selectedRowCount > 0 && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Selected ({selectedRowCount})
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete
                                        the selected medicines and remove their data from our
                                        servers.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteSelected}>
                                        Continue
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                    <ImportMedicinesDialog />
                    <AddMedicineDialog />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 lg:px-3">
                            <Filter className="mr-2 h-4 w-4" />
                            Filter
                            {hasActiveFilters && (
                                <span className="ml-2 h-4 w-4 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
                                    {Object.values(filters).filter(Boolean).length}
                                </span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-4 space-y-2" align="start">
                        <p className="text-sm font-medium">Filter by:</p>
                        <Select
                            onValueChange={(value) => setFilters(prev => ({ ...prev, category: value === "all" ? undefined : value as CategoryEnum }))}
                            value={filters.category || "all"}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            onValueChange={(value) => setFilters(prev => ({ ...prev, form: value === "all" ? undefined : value as MedicineForm }))}
                            value={filters.form || "all"}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Form" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Forms</SelectItem>
                                {forms.map((form) => (
                                    <SelectItem key={form} value={form}>
                                        {form}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Input
                            placeholder="Brand..."
                            value={filters.brand || ""}
                            onChange={(event) => setFilters(prev => ({ ...prev, brand: event.target.value || undefined }))}
                            className="w-full"
                        />
                        {hasActiveFilters && (
                            <Button variant="ghost" onClick={handleClearFilters} className="h-8 w-full">
                                Clear Filters
                                <XCircle className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                    </PopoverContent>
                </Popover>

                <Input
                    placeholder="Filter by name..."
                    value={filters.name || ""}
                    onChange={(event) => setFilters(prev => ({ ...prev, name: event.target.value || undefined }))}
                    className="max-w-sm"
                />
            </div>

            {isLoadingMedicines ? (
                <div className="space-y-4">
                    <Skeleton className="h-10 w-1/4" />
                    <Skeleton className="h-[400px] w-full" />
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={filteredMedicines ?? []}
                    rowSelection={rowSelection}
                    setRowSelection={setRowSelection}
                />
            )}
        </div>
    )
}