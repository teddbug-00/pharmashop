import * as React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { MoreHorizontal } from "lucide-react"

import { deleteUser } from "@/lib/api/users"
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
import { EditUserDialog } from "@/components/edit-user-dialog"

type User = components["schemas"]["UserPublic"]

interface UserActionsProps {
    user: User
}

export function UserActions({ user }: UserActionsProps) {
    const queryClient = useQueryClient()
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)

    const deleteUserMutation = useMutation({
        mutationFn: deleteUser,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["users"] })
            toast.success(`User "${user.username}" has been deleted.`)
            setIsDeleteDialogOpen(false)
        },
        onError: (error) => {
            toast.error("Failed to delete user", {
                description: error.message,
            })
        },
    })

    return (
        <>
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
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
                        <DropdownMenuItem onSelect={() => setIsEditDialogOpen(true)}>
                            Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-destructive"
                            onSelect={(e) => {
                                e.preventDefault()
                                setIsDeleteDialogOpen(true)
                            }}
                        >
                            Delete User
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user account for{" "}
                            <span className="font-medium text-foreground">{user.username}</span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteUserMutation.mutate(user.id)}
                            disabled={deleteUserMutation.isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteUserMutation.isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <EditUserDialog
                user={user}
                isOpen={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
            />
        </>
    )
}