import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createSale } from "@/lib/api/sales"
import { getMedicines } from "@/lib/api/medicines"
import type { components, paths } from "@/lib/api/schema";
import { Check, ChevronsUpDown, Minus, Plus, PlusCircle, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
type SaleItem = {
    medicine: Medicine
    quantity: number
}
// This type will need to be updated in your schema.d.ts when the backend changes
type SaleCreateWithPayment = paths["/sales/"]["post"]["requestBody"]["content"]["application/json"]["schema"] & { payment_method?: "cash" | "mobile_money" };

export function NewSaleDialog() {
    const queryClient = useQueryClient()
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const [saleItems, setSaleItems] = React.useState<SaleItem[]>([])
    const [selectedMedicine, setSelectedMedicine] = React.useState<Medicine | null>(
        null,
    )
    const [quantity, setQuantity] = React.useState(1)
    const [isComboboxOpen, setIsComboboxOpen] = React.useState(false)
    const [paymentMethod, setPaymentMethod] = React.useState<"cash" | "mobile_money">("cash")
    const quantityInputRef = React.useRef<HTMLInputElement>(null)

    // Reset state when the dialog is closed
    React.useEffect(() => {
        if (!isDialogOpen) {
            // Delay reset to avoid visual flicker as dialog closes
            const timer = setTimeout(() => {
                setSaleItems([])
                setSelectedMedicine(null)
                setQuantity(1)
            }, 150)
            return () => clearTimeout(timer)
        }
    }, [isDialogOpen])

    const { data: medicines } = useQuery({
        queryKey: ["medicines"],
        queryFn: getMedicines,
        enabled: isDialogOpen, // Only fetch medicines when the dialog is open
    })

    const createSaleMutation = useMutation({
        mutationFn: createSale,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["sales"]})
            queryClient.invalidateQueries({queryKey: ["dashboard"]})  // Invalidate dashboard stats too
            setIsDialogOpen(false)
            // Reset state for next time
            setSaleItems([])
            setSelectedMedicine(null)
            setQuantity(1)
            toast.success("Sale created successfully!")
        },
        onError: (error) => {
            console.error("Failed to create sale:", error)
            toast.error("Failed to create sale", { description: error.message })
        },
    })

    const handleAddItem = () => {
        if (!selectedMedicine || quantity <= 0) return

        // --- STOCK VALIDATION ---
        if (quantity > selectedMedicine.total_quantity) {
            toast.error("Not enough stock", { description: `Only ${selectedMedicine.total_quantity} units of ${selectedMedicine.name} available.` })
            return
        }

        const existingItemIndex = saleItems.findIndex(
            (item) => item.medicine.id === selectedMedicine.id,
        )

        if (existingItemIndex > -1) {
            const updatedItems = [...saleItems]
            const newQuantity = updatedItems[existingItemIndex].quantity + quantity
            // --- STOCK VALIDATION ON UPDATE ---
            if (newQuantity > updatedItems[existingItemIndex].medicine.total_quantity) {
                toast.error("Not enough stock", { description: `Cannot add ${quantity} more units. Only ${updatedItems[existingItemIndex].medicine.total_quantity} total units available.` })
                return
            }
            updatedItems[existingItemIndex].quantity = newQuantity
            setSaleItems(updatedItems)
        } else {
            setSaleItems([
                ...saleItems,
                { medicine: selectedMedicine, quantity: quantity },
            ])
        }

        setSelectedMedicine(null)
        setQuantity(1)
    }

    const handleRemoveItem = (medicineId: number) => {
        setSaleItems(saleItems.filter((item) => item.medicine.id !== medicineId))
    }

    const handleUpdateQuantity = (medicineId: number, newQuantity: number) => {
        const itemIndex = saleItems.findIndex((item) => item.medicine.id === medicineId)
        if (itemIndex === -1) return

        // --- STOCK VALIDATION ON EDIT ---
        if (newQuantity > saleItems[itemIndex].medicine.total_quantity) {
            toast.error("Not enough stock", { description: `Only ${saleItems[itemIndex].medicine.total_quantity} units available.` })
            return
        }

        // Prevent quantity from going below 0
        if (newQuantity < 0) {
            return
        }

        const updatedItems = [...saleItems]
        updatedItems[itemIndex].quantity = newQuantity
        setSaleItems(updatedItems)
    }

    const handleSubmitSale = () => {
        if (saleItems.length === 0) return

        const saleToCreate: SaleCreateWithPayment = {
            items: saleItems.map((item) => ({
                medicine_id: item.medicine.id,
                quantity: item.quantity,
            })),
            payment_method: paymentMethod,
        }
        createSaleMutation.mutate(saleToCreate as any) // Using 'as any' until schema is updated
    }

    const totalAmount = saleItems.reduce(
        (total, item) => total + parseFloat(item.medicine.selling_price) * item.quantity,
        0,
    )

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Sale
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>New Sale</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="flex items-end gap-2">
                        <div className="flex-1">
                            <Popover open={isComboboxOpen} onOpenChange={setIsComboboxOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className="w-full justify-between"
                                    >
                                        {selectedMedicine
                                            ? selectedMedicine.name
                                            : "Select medicine..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search medicine..." />
                                        <CommandList>
                                            <CommandEmpty>No medicine found.</CommandEmpty>
                                            <CommandGroup>
                                                {medicines?.map((medicine) => (
                                                    <CommandItem
                                                        key={medicine.id}
                                                        value={medicine.name}
                                                        onSelect={() => {
                                                            setSelectedMedicine(medicine)
                                                            setIsComboboxOpen(false)
                                                            // Focus the quantity input for a faster workflow
                                                            setTimeout(() => {
                                                                quantityInputRef.current?.focus()
                                                            }, 0)
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                selectedMedicine?.id === medicine.id
                                                                    ? "opacity-100"
                                                                    : "opacity-0",
                                                            )}
                                                        />
                                                        <span className="flex-1">{medicine.name}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            Stock: {medicine.total_quantity}
                                                        </span>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div>
                            <Input
                                type="number"
                                ref={quantityInputRef}
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault()
                                        handleAddItem()
                                    }
                                }}
                                className="w-24"
                                min="1"
                            />
                        </div>
                        <Button onClick={handleAddItem} disabled={!selectedMedicine}>
                            Add
                        </Button>
                    </div>
                    <div className="relative max-h-[250px] overflow-auto rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Medicine</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead className="text-right">Subtotal</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {saleItems.length > 0 ? (
                                    saleItems.map((item) => (
                                        <TableRow key={item.medicine.id}>
                                            <TableCell className="font-medium">{item.medicine.name}</TableCell>
                                            <TableCell className="w-28">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Button
                                                        className="size-7"
                                                        variant="ghost"
                                                        size="icon-sm"
                                                        onClick={() => handleUpdateQuantity(item.medicine.id, item.quantity - 1)}
                                                        disabled={item.quantity === 0}
                                                    >
                                                        <Minus className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <span className="w-10 text-center font-medium">{item.quantity}</span>
                                                    <Button
                                                        className="size-7"
                                                        variant="ghost"
                                                        size="icon-sm"
                                                        onClick={() => handleUpdateQuantity(item.medicine.id, item.quantity + 1)}
                                                        disabled={item.quantity >= item.medicine.total_quantity}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {(
                                                    parseFloat(item.medicine.selling_price) *
                                                    item.quantity
                                                ).toFixed(2)}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    onClick={() => handleRemoveItem(item.medicine.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            No items added yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="space-y-2">
                        <ToggleGroup
                            type="single"
                            defaultValue="cash"
                            variant="outline"
                            className="w-full justify-start"
                            onValueChange={(value: "cash" | "mobile_money") => {
                                if (value) setPaymentMethod(value)
                            }}
                        >
                            <ToggleGroupItem value="cash">Cash</ToggleGroupItem>
                            <ToggleGroupItem value="mobile_money">Mobile Money</ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                    <div className="text-right text-lg font-bold">
                        Total: GHS {totalAmount.toFixed(2)}
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        onClick={handleSubmitSale}
                        disabled={saleItems.length === 0 || createSaleMutation.isPending}
                    >
                        {createSaleMutation.isPending ? "Submitting..." : "Submit Sale"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}