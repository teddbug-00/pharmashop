import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { addBatch } from "@/lib/api/medicines"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import type { components } from "@/lib/api/schema"

type Medicine = components["schemas"]["MedicineInList"]

const formSchema = z.object({
    batch_number: z.string().optional(),
    expiry_date: z.date({
        required_error: "Expiry date is required",
    }),
    cost_price: z.coerce.number().positive("Cost price must be positive"),
    selling_price: z.coerce.number().positive("Selling price must be positive"),
    quantity: z.coerce.number().int().positive("Quantity must be a positive integer"),
})

type AddBatchFormValues = z.infer<typeof formSchema>

interface AddBatchDialogProps {
    medicine: Medicine
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

export function AddBatchDialog({
    medicine,
    isOpen,
    onOpenChange,
}: AddBatchDialogProps) {
    const queryClient = useQueryClient()

    const form = useForm<AddBatchFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            batch_number: "",
            cost_price: 0,
            selling_price: 0,
            quantity: 1,
            expiry_date: new Date(),
        },
    })

    const addBatchMutation = useMutation({
        mutationFn: (values: AddBatchFormValues) => {
            const apiPayload = {
                batch_number: values.batch_number || null,
                expiry_date: format(values.expiry_date, "yyyy-MM-dd"),
                cost_price: values.cost_price,
                selling_price: values.selling_price,
                quantity: values.quantity,
            }
            return addBatch({ medicineId: medicine.id, batch: apiPayload })
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["medicines"] })
            toast.success(`New batch added to "${medicine.name}" successfully!`)
            onOpenChange(false)
            form.reset()
        },
        onError: (error) => {
            toast.error("Failed to add batch", {
                description: error.message,
            })
        },
    })

    function onSubmit(values: AddBatchFormValues) {
        addBatchMutation.mutate(values)
    }

    React.useEffect(() => {
        if (!isOpen) form.reset()
    }, [isOpen, form])

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add New Batch to {medicine.name}</DialogTitle>
                    <DialogDescription>
                        Enter the details for the new batch of stock.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="batch_number" render={({ field }) => <FormItem><FormLabel>Batch Number (Optional)</FormLabel><FormControl><Input placeholder="B12345" {...field} /></FormControl><FormMessage /></FormItem>} />
                        <FormField control={form.control} name="expiry_date" render={({ field }) => <FormItem className="flex flex-col"><FormLabel>Expiry Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}><>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}</><CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover><FormMessage /></FormItem>} />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="cost_price" render={({ field }) => <FormItem><FormLabel>Cost Price</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="selling_price" render={({ field }) => <FormItem><FormLabel>Selling Price</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>} />
                        </div>
                        <FormField control={form.control} name="quantity" render={({ field }) => <FormItem><FormLabel>Quantity</FormLabel><FormControl><Input type="number" step="1" {...field} /></FormControl><FormMessage /></FormItem>} />
                        <DialogFooter>
                            <Button type="submit" disabled={addBatchMutation.isPending}>
                                {addBatchMutation.isPending ? "Adding..." : "Add Batch"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}