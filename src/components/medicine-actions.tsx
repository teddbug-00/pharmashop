import * as React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { MoreHorizontal } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import type { components } from "@/lib/api/schema"
import { deleteMedicine } from "@/lib/api/medicines"
import { EditMedicineDialog } from "./edit-medicine-dialog"
import { AddBatchDialog } from "./add-batch-dialog"

type Medicine = components["schemas"]["MedicineInList"]

export function MedicineActions({ medicine }: { medicine: Medicine }) {
    const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
    const [isAddBatchDialogOpen, setIsAddBatchDialogOpen] = React.useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
    const queryClient = useQueryClient()

    const deleteMutation = useMutation({
        mutationFn: () => deleteMedicine(medicine.id),
        onSuccess: () => {
            toast.success(`Medicine "${medicine.name}" deleted successfully.`)
            queryClient.invalidateQueries({ queryKey: ["medicines"] })
        },
        onError: (error) => {
            toast.error("Failed to delete medicine", {
                description: error.message,
            })
        },
    })

    return (
        <>
            {/* Dialogs that are opened by the dropdown */}
            <EditMedicineDialog medicine={medicine} isOpen={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />
            <AddBatchDialog medicine={medicine} isOpen={isAddBatchDialogOpen} onOpenChange={setIsAddBatchDialogOpen} />
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the medicine "{medicine.name}" and all of its batches.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
                            {deleteMutation.isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* The dropdown menu itself */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setIsAddBatchDialogOpen(true)}>Add New Batch</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>Edit Medicine</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive">Delete Medicine</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}