import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { getSale, getSales } from "@/lib/api/sales"
import type { components } from "@/lib/api/schema"
import { DataTable } from "@/components/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import * as React from "react"
import { toast } from "sonner"
import { generateReceiptHtml } from "@/lib/receipt"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { NewSaleDialog } from "@/components/new-sale-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Sale = components["schemas"]["SaleInList"]
type SaleReceipt = components["schemas"]["SaleReceipt"]

const handlePrintReceipt = (receipt: SaleReceipt) => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) {
        toast.error("Could not open print window. Please disable your pop-up blocker.")
        return
    }
    const receiptHtml = generateReceiptHtml(receipt)
    printWindow.document.write(receiptHtml)
    printWindow.document.close()
}

export const Route = createFileRoute("/_authenticated/sales")({
    component: SalesComponent,
})

function SalesComponent() {
    const [selectedSale, setSelectedSale] = React.useState<SaleReceipt | null>(null)
    const [isReceiptDialogOpen, setIsReceiptDialogOpen] = React.useState(false)

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["sales"],
        queryFn: () => getSales(0, 100, "access"),
    })

    const handleViewDetails = async (saleId: number) => {
        try {
            const saleDetails = await getSale(saleId)
            setSelectedSale(saleDetails)
            setIsReceiptDialogOpen(true)
        } catch (err) {
            toast.error("Failed to fetch sale details.")
        }
    }

    const handlePrint = async (saleId: number) => {
        try {
            const saleDetails = await getSale(saleId)
            handlePrintReceipt(saleDetails)
        } catch (err) {
            toast.error("Failed to fetch sale details for printing.")
        }
    }

    const columns: ColumnDef<Sale>[] = [
        {
            accessorKey: "invoice_number",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Invoice ID
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
        },
        {
            accessorKey: "sale_date",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div>{new Date(row.getValue("sale_date")).toLocaleDateString()}</div>,
        },
        {
            accessorKey: "total_amount",
            header: ({ column }) => (
                <div className="text-right w-full">
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Total Amount (GH₵)
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            ),
            cell: ({ row }) => {
                const amount = parseFloat(row.getValue("total_amount"))
                return <div className="text-right font-medium">{amount.toFixed(2)}</div>
            },
        },
        {
            accessorKey: "sold_by_full_name",
            header: "Cashier",
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const sale = row.original
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
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleViewDetails(sale.id)}>View Receipt Details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePrint(sale.id)}>Print Receipt</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]

    if (isError) {
        return <div>Error: {error.message}</div>
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold tracking-tight">Sales</h2>
                    <p className="text-muted-foreground">View and manage all sales transactions.</p>
                </div>
                <NewSaleDialog />
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
                    filterColumnId="invoice_number"
                    filterColumnPlaceholder="Filter by invoice ID..."
                />
            )}

            <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Receipt Details</DialogTitle>
                        <DialogDescription>Invoice: {selectedSale?.invoice_number}</DialogDescription>
                    </DialogHeader>
                    {selectedSale && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <p><strong>Sale Date:</strong> {new Date(selectedSale.sale_date).toLocaleString()}</p>
                                    <p><strong>Sold By:</strong> {selectedSale.sold_by_full_name}</p>
                                </div>
                                <div className="text-right">
                                    <p><strong>Payment Method:</strong> {selectedSale.payment_method}</p>
                                </div>
                            </div>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Item</TableHead>
                                            <TableHead className="text-center">Qty</TableHead>
                                            <TableHead className="text-right">Unit Price</TableHead>
                                            <TableHead className="text-right">Subtotal</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedSale.items.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{item.medicine_name}</TableCell>
                                                <TableCell className="text-center">{item.quantity}</TableCell>
                                                <TableCell className="text-right">{parseFloat(item.unit_price).toFixed(2)}</TableCell>
                                                <TableCell className="text-right">{parseFloat(item.subtotal).toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="text-right text-lg font-bold">
                                Total: GH₵ {parseFloat(selectedSale.total_amount).toFixed(2)}
                            </div>
                        </div>
                    )}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setIsReceiptDialogOpen(false)}>Close</Button>
                        <Button onClick={() => selectedSale && handlePrintReceipt(selectedSale)}>Print</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
