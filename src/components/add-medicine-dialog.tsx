import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { PlusCircle } from "lucide-react"

import { addMedicine } from "@/lib/api/medicines"
import type { components } from "@/lib/api/schema"
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
import { ScrollArea } from "@/components/ui/scroll-area"


type MedicineCreate = components["schemas"]["MedicineCreate"]

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

export function AddMedicineDialog() {
    const [isOpen, setIsOpen] = React.useState(false)
    const queryClient = useQueryClient()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            brand: "",
            form: "TABLET", // Default form
            category: "Unassigned", // Default category
        },
    })

    const addMedicineMutation = useMutation({
        mutationFn: async (values: z.infer<typeof formSchema>) => {
            const medicineCreate: MedicineCreate = {
                name: values.name,
                brand: values.brand,
                form: values.form,
                category: values.category,
            }
            const newMedicine = await addMedicine(medicineCreate)
            return newMedicine
        },
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
                        className="contents"
                    >
                        <DialogHeader className="p-6 pb-4">
                            <DialogTitle>Add New Medicine</DialogTitle>
                            <DialogDescription>
                                Add a new product to your inventory.
                            </DialogDescription>
                        </DialogHeader>

                        <ScrollArea>
                            <div className="space-y-4 px-6 py-2">
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