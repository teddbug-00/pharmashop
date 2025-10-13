import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { updateMedicine } from "@/lib/api/medicines"
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import type { components } from "@/lib/api/schema"

type Medicine = components["schemas"]["MedicineInList"]

const formSchema = z.object({
    name: z.string().min(3, "Username must be at least 3 characters long"),
    category: z.enum([
        "painkiller",
        "antibiotic",
        "supplement",
        "antibacterial",
        "antiseptic",
        "other",
    ]),
    selling_price: z.coerce.number().positive("Selling price must be positive"),
})

type EditMedicineFormValues = z.infer<typeof formSchema>

interface EditMedicineDialogProps {
    medicine: Medicine
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

export function EditMedicineDialog({
    medicine,
    isOpen,
    onOpenChange,
}: EditMedicineDialogProps) {
    const queryClient = useQueryClient()

    const form = useForm<EditMedicineFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: medicine.name,
            category: medicine.category,
            selling_price: parseFloat(medicine.selling_price),
        },
    })

    const updateMedicineMutation = useMutation({
        mutationFn: (values: EditMedicineFormValues) =>
            updateMedicine({ medicineId: medicine.id, medicine: values }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["medicines"] })
            toast.success("Medicine updated successfully!")
            onOpenChange(false)
        },
        onError: (error) => {
            toast.error("Failed to update medicine", {
                description: error.message,
            })
        },
    })

    function onSubmit(values: EditMedicineFormValues) {
        updateMedicineMutation.mutate(values)
    }

    React.useEffect(() => {
        if (isOpen) {
            form.reset({
                name: medicine.name,
                category: medicine.category,
                selling_price: parseFloat(medicine.selling_price),
            })
        }
    }, [isOpen, medicine, form])

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Medicine</DialogTitle>
                    <DialogDescription>Update the details for {medicine.name}.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="Paracetamol 500mg" {...field} /></FormControl><FormMessage /></FormItem>} />
                        <FormField control={form.control} name="category" render={({ field }) => <FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl><SelectContent><SelectItem value="painkiller">Painkiller</SelectItem><SelectItem value="antibiotic">Antibiotic</SelectItem><SelectItem value="supplement">Supplement</SelectItem><SelectItem value="antibacterial">Antibacterial</SelectItem><SelectItem value="antiseptic">Antiseptic</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem>} />
                        <FormField control={form.control} name="selling_price" render={({ field }) => <FormItem><FormLabel>Selling Price (GHS)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>} />
                        <DialogFooter>
                            <Button type="submit" disabled={updateMedicineMutation.isPending}>
                                {updateMedicineMutation.isPending ? "Saving..." : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}