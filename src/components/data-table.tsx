import * as React from "react"
import {
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
    type RowSelectionState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface DataTableProps<TData extends { id: number | string }, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    filterColumnId?: string
    filterColumnPlaceholder?: string
    rowSelection: RowSelectionState
    setRowSelection: React.Dispatch<React.SetStateAction<RowSelectionState>>
}

export function DataTable<TData extends { id: number | string }, TValue>({
    columns,
    data,
    filterColumnId,
    filterColumnPlaceholder,
    rowSelection,
    setRowSelection,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onRowSelectionChange: setRowSelection,
        enableRowSelection: true,
        getRowId: (row) => {
            if (row.id === undefined) {
                console.warn("Row ID is undefined in getRowId:", row);
                return Math.random().toString(); // Provide a fallback unique ID
            }
            return String(row.id);
        },
        state: {
            sorting,
            columnFilters,
            rowSelection,
        },
    })

    return (
        <div>
            {filterColumnId && filterColumnPlaceholder && (
                <div className="flex items-center py-4">
                    <Input
                        placeholder={filterColumnPlaceholder}
                        value={(table.getColumn(filterColumnId)?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn(filterColumnId)?.setFilterValue(event.target.value)
                        }
                        className="max-w-sm"
                    />
                </div>
            )}
            <div className="rounded-md border">
                <Table style={{ tableLayout: "auto" }}>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext(),
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id !== undefined ? String(row.id) : Math.random().toString()}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => {
                                        console.log("Inspecting cell:", cell);
                                        console.log("Cell ID:", cell?.id);
                                        const cellKey = cell?.id !== undefined ? String(cell.id) : Math.random().toString();
                                        return (
                                            <TableCell key={cellKey}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Next
                </Button>
            </div>
        </div>
    )
}
