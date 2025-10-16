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
type MedicineUpdate = components["schemas"]["MedicineUpdate"]

const formSchema = z.object({
    name: z.string().min(3, "Medicine name must be at least 3 characters long"),
    brand: z.string().min(1, "Brand is required"),
    form: z.enum(["TABLET", "SYRUP", "CAPSULE", "INJECTION", "OINTMENT", "DROPS", "OTHER"], {
        errorMap: () => ({ message: "Please select a valid form" }),
    }),
    category: z.enum([
        "Pain Relief",
        "Antibiotics",
        "Antiseptics",
        "Vitamins & Supplements",
        "Allergy & Hayfever",
        "Cold & Flu",
        "Digestive Health",
        "Skin Care",
        "Unassigned",
    ], {
        errorMap: () => ({ message: "Please select a valid category" }),
    }),
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
            brand: medicine.brand,
            form: medicine.form,
            category: medicine.category,
        },
    })

    const updateMedicineMutation = useMutation({
        mutationFn: (values: EditMedicineFormValues) => {
            const medicineUpdate: MedicineUpdate = {
                name: values.name,
                brand: values.brand,
                form: values.form,
                category: values.category,
            }
            return updateMedicine({ medicineId: medicine.id, medicine: medicineUpdate })
        },
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
                brand: medicine.brand,
                form: medicine.form,
                category: medicine.category,
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
                        <FormField control={form.control} name="brand" render={({ field }) => <FormItem><FormLabel>Brand</FormLabel><FormControl><Input placeholder="GSK" {...field} /></FormControl><FormMessage /></FormItem>} />
                        <FormField control={form.control} name="form" render={({ field }) => <FormItem><FormLabel>Form</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select medicine form" /></SelectTrigger></FormControl><SelectContent>
                                    <SelectItem value="TABLET">Tablet</SelectItem>
                                    <SelectItem value="SYRUP">Syrup</SelectItem>
                                    <SelectItem value="CAPSULE">Capsule</SelectItem>
                                    <SelectItem value="INJECTION">Injection</SelectItem>
                                    <SelectItem value="OINTMENT">Ointment</SelectItem>
                                    <SelectItem value="DROPS">Drops</SelectItem>
                                    <SelectItem value="OTHER">Other</SelectItem>
                                </SelectContent></Select><FormMessage /></FormItem>} />
                        <FormField control={form.control} name="category" render={({ field }) => <FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl><SelectContent>
                                    <SelectItem value="Pain Relief">Pain Relief</SelectItem>
                                    <SelectItem value="Antibiotics">Antibiotics</SelectItem>
                                    <SelectItem value="Antiseptics">Antiseptics</SelectItem>
                                    <SelectItem value="Vitamins & Supplements">Vitamins & Supplements</SelectItem>
                                    <SelectItem value="Allergy & Hayfever">Allergy & Hayfever</SelectItem>
                                    <SelectItem value="Cold & Flu">Cold & Flu</SelectItem>
                                    <SelectItem value="Digestive Health">Digestive Health</SelectItem>
                                    <SelectItem value="Skin Care">Skin Care</SelectItem>
                                    <SelectItem value="Unassigned">Unassigned</SelectItem>
                                </SelectContent></Select><FormMessage /></FormItem>} />
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