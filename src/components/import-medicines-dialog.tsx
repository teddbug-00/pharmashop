import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Upload } from "lucide-react"

import { importMedicinesCSV } from "@/lib/api/medicines"
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

const formSchema = z.object({
    file: z.any()
        .refine((file) => file instanceof File && file.size > 0, "Please select a non-empty CSV file."),
})

export function ImportMedicinesDialog() {
    const [isOpen, setIsOpen] = React.useState(false)
    const queryClient = useQueryClient()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    })

    const importMutation = useMutation({
        mutationFn: async (file: File) => {
            console.log("mutationFn: Calling importMedicinesCSV with file:", file);
            return importMedicinesCSV(file);
        },
        onSuccess: async (data) => {
            console.log("mutationFn: importMedicinesCSV successful, data:", data);
            await queryClient.invalidateQueries({ queryKey: ["medicines"] })
            toast.success("Medicines imported successfully!")
            setIsOpen(false)
            form.reset()
        },
        onError: (error) => {
            console.error("mutationFn: importMedicinesCSV failed, error:", error);
            toast.error("Failed to import medicines", {
                description: error.message,
            })
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log("onSubmit: Form submitted with values:", values);
        importMutation.mutate(values.file)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Import CSV
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Import Medicines from CSV</DialogTitle>
                    <DialogDescription>
                        Upload a CSV file containing medicine data to import into the inventory.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
                        <FormField
                            control={form.control}
                            name="file"
                            render={({ field: { onBlur, name, ref } }) => (
                                <FormItem>
                                    <FormLabel>CSV File</FormLabel>
                                    <FormControl>
                                        <input
                                            type="file"
                                            accept=".csv"
                                            onBlur={onBlur}
                                            name={name}
                                            onChange={(event) => {
                                                const selectedFile = event.target.files?.[0];
                                                console.log("Selected file in input onChange:", selectedFile); // Debugging line
                                                form.setValue("file", selectedFile || undefined, { shouldValidate: true });
                                            }}
                                            ref={ref}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={importMutation.isPending}>
                                {importMutation.isPending ? "Importing..." : "Import"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
