import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { CalendarIcon, PlusCircle } from "lucide-react"
import { format } from "date-fns"

import { addMedicine } from "@/lib/api/medicines"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

const formSchema = z.object({
    name: z.string().min(3, "Medicine name must be at least 3 characters long"),
    category: z.enum([
        "painkiller",
        "antibiotic",
        "supplement",
        "antibacterial",
        "antiseptic",
        "other",
    ]),
    selling_price: z.coerce.number().positive("Selling price must be positive"),
    batch: z.object({
        batch_number: z.string().optional(),
        expiry_date: z.date(),
        cost_price: z.coerce.number().positive("Cost price must be positive"),
        quantity: z.coerce.number().int().positive("Quantity must be a positive integer"),
    }),
})

export function AddMedicineDialog() {
    const [isOpen, setIsOpen] = React.useState(false)
    const queryClient = useQueryClient()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            category: "other",
            selling_price: 0,
            batch: {
                cost_price: 0,
                quantity: 1,
            },
        },
    })

    const addMedicineMutation = useMutation({
        mutationFn: (values: z.infer<typeof formSchema>) => addMedicine(values),
        onSuccess: async (data) => {
            await queryClient.invalidateQueries({ queryKey: ["medicines"] })
            toast.success(`Medicine "${data.name}" added successfully!`)
            setIsOpen(false)
            form.reset()
        },
        onError: (error) => {
            toast.error("Failed to add medicine", {
                description: error.message,
            })
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        addMedicineMutation.mutate(values)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Medicine
                </Button>
            </DialogTrigger>
            <DialogContent className="grid h-full max-h-[90vh] grid-rows-[auto_minmax(0,1fr)_auto] p-0 sm:max-w-md">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="contents" // Use 'contents' to make the form a non-visual wrapper
                    >
                        <DialogHeader className="p-6 pb-4">
                            <DialogTitle>Add New Medicine</DialogTitle>
                            <DialogDescription>
                                Add a new product to your inventory, including its first batch.
                            </DialogDescription>
                        </DialogHeader>

                        <ScrollArea>
                            <div className="space-y-4 px-6 py-2">
                                <FormField control={form.control} name="name" render={({ field }) => <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="Paracetamol 500mg" {...field} /></FormControl><FormMessage /></FormItem>} />
                                <FormField control={form.control} name="category" render={({ field }) => <FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl><SelectContent><SelectItem value="painkiller">Painkiller</SelectItem><SelectItem value="antibiotic">Antibiotic</SelectItem><SelectItem value="supplement">Supplement</SelectItem><SelectItem value="antibacterial">Antibacterial</SelectItem><SelectItem value="antiseptic">Antiseptic</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem>} />
                                <FormField control={form.control} name="selling_price" render={({ field }) => <FormItem><FormLabel>Selling Price (GHS)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>} />

                                <div className="space-y-4 rounded-md border p-4">
                                    <h4 className="font-medium">First Batch Details</h4>
                                    <FormField control={form.control} name="batch.batch_number" render={({ field }) => <FormItem><FormLabel>Batch Number (Optional)</FormLabel><FormControl><Input placeholder="B12345" {...field} /></FormControl><FormMessage /></FormItem>} />
                                    <FormField control={form.control} name="batch.expiry_date" render={({ field }) => <FormItem className="flex flex-col"><FormLabel>Expiry Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}><>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}</><CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={form.control} name="batch.cost_price" render={({ field }) => <FormItem><FormLabel>Cost Price</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>} />
                                        <FormField control={form.control} name="batch.quantity" render={({ field }) => <FormItem><FormLabel>Quantity</FormLabel><FormControl><Input type="number" step="1" {...field} /></FormControl><FormMessage /></FormItem>} />
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>

                        <DialogFooter className="border-t p-6 pt-4">
                            <Button
                                type="submit"
                                disabled={addMedicineMutation.isPending}
                                className="w-full"
                            >
                                {addMedicineMutation.isPending
                                    ? "Adding..."
                                    : "Add Medicine"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}