import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createSale } from "@/lib/api/sales"
import { getMedicines, getMedicineQuote } from "@/lib/api/medicines"
import type { components } from "@/lib/api/schema";
import { Check, ChevronsUpDown, Minus, Plus, PlusCircle, Trash2 } from "lucide-react"
import { generateReceiptHtml } from "@/lib/receipt";

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogContent,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

type Medicine = components["schemas"]["MedicineInList"]
type SaleCreate = components["schemas"]["SaleCreate"]
type PaymentMethod = components["schemas"]["PaymentMethod"]
type SaleReceipt = components["schemas"]["SaleReceipt"]

// The state for an item in the sale cart now includes its calculated subtotal
type SaleItem = {
    medicine: Medicine
    quantity: number
    subtotal: number
}

// --- Receipt Printing Function ---
const handlePrintReceipt = (receipt: SaleReceipt) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
        toast.error("Could not open print window. Please disable your pop-up blocker.");
        return;
    }
    const receiptHtml = generateReceiptHtml(receipt);
    printWindow.document.write(receiptHtml);
    printWindow.document.close();
    // The script in the generated HTML handles the printing and closing
}

export function NewSaleDialog() {
    const queryClient = useQueryClient()
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const [saleItems, setSaleItems] = React.useState<SaleItem[]>([])
    const [selectedMedicine, setSelectedMedicine] = React.useState<Medicine | null>(null)
    const [quantity, setQuantity] = React.useState(1)
    const [isComboboxOpen, setIsComboboxOpen] = React.useState(false)
    const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>("CASH")
    const quantityInputRef = React.useRef<HTMLInputElement>(null)

    React.useEffect(() => {
        if (!isDialogOpen) {
            const timer = setTimeout(() => {
                setSaleItems([])
                setSelectedMedicine(null)
                setQuantity(1)
                setPaymentMethod("CASH")
            }, 150)
            return () => clearTimeout(timer)
        }
    }, [isDialogOpen])

    const { data: medicines } = useQuery({
        queryKey: ["medicines"],
        queryFn: () => getMedicines(),
        enabled: isDialogOpen,
    })

    const createSaleMutation = useMutation<SaleReceipt, Error, SaleCreate>({
        mutationFn: createSale,
        onSuccess: async (data) => {
            await queryClient.invalidateQueries({queryKey: ["sales"]})
            await queryClient.invalidateQueries({queryKey: ["dashboard"]})
            setIsDialogOpen(false)
            toast.success("Sale created successfully!", {
                action: {
                    label: "Print Receipt",
                    onClick: () => handlePrintReceipt(data),
                },
            })
        },
        onError: (error) => {
            toast.error("Failed to create sale", { description: error.message })
        },
    })

    const handleAddItem = async () => {
        if (!selectedMedicine || quantity <= 0) return

        const existingItemIndex = saleItems.findIndex(
            (item) => item.medicine.id === selectedMedicine.id,
        );

        const targetQuantity = (existingItemIndex > -1 ? saleItems[existingItemIndex].quantity : 0) + quantity;

        if (targetQuantity > selectedMedicine.total_quantity) {
            toast.error("Not enough stock", { description: `Only ${selectedMedicine.total_quantity} units of ${selectedMedicine.name} available.` })
            return
        }

        try {
            const quote = await getMedicineQuote(selectedMedicine.id, targetQuantity);
            const subtotal = parseFloat(quote.effective_total_price);

            if (existingItemIndex > -1) {
                const updatedItems = [...saleItems]
                updatedItems[existingItemIndex].quantity = targetQuantity;
                updatedItems[existingItemIndex].subtotal = subtotal;
                setSaleItems(updatedItems)
            } else {
                setSaleItems([
                    ...saleItems,
                    { medicine: selectedMedicine, quantity: targetQuantity, subtotal },
                ])
            }

            setSelectedMedicine(null)
            setQuantity(1)
        } catch (error: any) {
            toast.error("Could not get price quote", { description: error.message })
        }
    }

    const handleRemoveItem = (medicineId: number) => {
        setSaleItems(saleItems.filter((item) => item.medicine.id !== medicineId))
    }

    const handleUpdateQuantity = async (medicineId: number, newQuantity: number) => {
        const itemIndex = saleItems.findIndex((item) => item.medicine.id === medicineId)
        if (itemIndex === -1) return

        if (newQuantity > 0) {
            if (newQuantity > saleItems[itemIndex].medicine.total_quantity) {
                toast.error("Not enough stock", { description: `Only ${saleItems[itemIndex].medicine.total_quantity} units available.` })
                return
            }
            try {
                const quote = await getMedicineQuote(medicineId, newQuantity);
                const subtotal = parseFloat(quote.effective_total_price);
                const updatedItems = [...saleItems]
                updatedItems[itemIndex].quantity = newQuantity;
                updatedItems[itemIndex].subtotal = subtotal;
                setSaleItems(updatedItems)
            } catch (error: any) {
                toast.error("Could not update price quote", { description: error.message })
            }
        } else {
            // Remove the item if quantity is 0 or less
            setSaleItems(saleItems.filter(item => item.medicine.id !== medicineId));
        }
    }

    const handleSubmitSale = () => {
        if (saleItems.length === 0) return

        const saleToCreate: SaleCreate = {
            items: saleItems.map((item) => ({
                medicine_id: item.medicine.id,
                quantity: item.quantity,
            })),
            payment_method: paymentMethod,
        }
        createSaleMutation.mutate(saleToCreate)
    }

    const totalAmount = saleItems.reduce((total, item) => total + item.subtotal, 0)

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild><Button size="sm"><PlusCircle className="mr-2 h-4 w-4" />New Sale</Button></DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader><DialogTitle>New Sale</DialogTitle></DialogHeader>
                <div className="space-y-4">
                    <div className="flex items-end gap-2">
                        <div className="flex-1">
                            <Popover open={isComboboxOpen} onOpenChange={setIsComboboxOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" role="combobox" className="w-full justify-between">
                                        {selectedMedicine ? selectedMedicine.name : "Select medicine..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search medicine..." />
                                        <CommandList>
                                            <CommandEmpty>No medicine found.</CommandEmpty>
                                            <CommandGroup>
                                                {medicines?.map((medicine: Medicine) => (
                                                    <CommandItem
                                                        key={medicine.id}
                                                        value={medicine.name}
                                                        onSelect={() => {
                                                            setSelectedMedicine(medicine)
                                                            setIsComboboxOpen(false)
                                                            setTimeout(() => { quantityInputRef.current?.focus() }, 0)
                                                        }}
                                                    >
                                                        <Check className={cn("mr-2 h-4 w-4", selectedMedicine?.id === medicine.id ? "opacity-100" : "opacity-0")} />
                                                        <span className="flex-1">{medicine.name}</span>
                                                        <span className="text-xs text-muted-foreground">Stock: {medicine.total_quantity}</span>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div>
                            <Input type="number" ref={quantityInputRef} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddItem(); } }} className="w-24" min="1" />
                        </div>
                        <Button onClick={handleAddItem} disabled={!selectedMedicine || createSaleMutation.isPending}>
                            Add
                        </Button>
                    </div>
                    <div className="relative max-h-[250px] overflow-auto rounded-md border">
                        <Table>
                            <TableHeader><TableRow><TableHead>Medicine</TableHead><TableHead>Quantity</TableHead><TableHead className="text-right">Subtotal</TableHead><TableHead className="w-[50px]"></TableHead></TableRow></TableHeader>
                            <TableBody>
                                {saleItems.length > 0 ? (
                                    saleItems.map((item) => (
                                        <TableRow key={item.medicine.id}>
                                            <TableCell className="font-medium">{item.medicine.name}</TableCell>
                                            <TableCell className="w-28">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Button className="size-7" variant="ghost" size="icon-sm" onClick={() => handleUpdateQuantity(item.medicine.id, item.quantity - 1)} disabled={createSaleMutation.isPending}><Minus className="h-3.5 w-3.5" /></Button>
                                                    <span className="w-10 text-center font-medium">{item.quantity}</span>
                                                    <Button className="size-7" variant="ghost" size="icon-sm" onClick={() => handleUpdateQuantity(item.medicine.id, item.quantity + 1)} disabled={item.quantity >= item.medicine.total_quantity || createSaleMutation.isPending}><Plus className="h-4 w-4" /></Button>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">{item.subtotal.toFixed(2)}</TableCell>
                                            <TableCell><Button variant="ghost" size="icon-sm" onClick={() => handleRemoveItem(item.medicine.id)} disabled={createSaleMutation.isPending}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={4} className="h-24 text-center">No items added yet.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="space-y-2">
                        <ToggleGroup type="single" defaultValue="CASH" variant="outline" className="w-full justify-start" onValueChange={(value: PaymentMethod) => { if (value) setPaymentMethod(value) }}>
                            <ToggleGroupItem value="CASH">Cash</ToggleGroupItem>
                            <ToggleGroupItem value="MOMO">Mobile Money</ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                    <div className="text-right text-lg font-bold">Total: GHS {totalAmount.toFixed(2)}</div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmitSale} disabled={saleItems.length === 0 || createSaleMutation.isPending}>
                        {createSaleMutation.isPending ? "Submitting..." : "Submit Sale"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
