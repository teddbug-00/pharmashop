import * as React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Copy, MoreHorizontal } from "lucide-react"

import { deleteUser, resetUserPassword } from "@/lib/api/users"
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
import { Input } from "@/components/ui/input"

type User = components["schemas"]["UserPublic"]

interface UserActionsProps {
    user: User
}

function generatePassword(length = 6) {
    const numbers = "0123456789"

    let password = ""
    for (let i = 0; i < length; i++) {
        password += numbers[Math.floor(Math.random() * numbers.length)]
    }
    return password
}

export function UserActions({ user }: UserActionsProps) {
    const queryClient = useQueryClient()
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
    const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = React.useState(false)
    const [isPasswordDisplayDialogOpen, setIsPasswordDisplayDialogOpen] = React.useState(false)
    const [newGeneratedPassword, setNewGeneratedPassword] = React.useState("")

    const deleteUserMutation = useMutation({
        mutationFn: deleteUser,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["users"] })
            toast.success(`User "${user.full_name}" has been deleted.`)
            setIsDeleteDialogOpen(false)
        },
        onError: (error) => {
            toast.error("Failed to delete user", {
                description: error.message,
            })
        },
    })

    const resetPasswordMutation = useMutation({
        mutationFn: resetUserPassword,
        onSuccess: async (data) => {
            await queryClient.invalidateQueries({ queryKey: ["users"] })
            // The newGeneratedPassword state is already set by handleResetPassword
            // No need to generate again here.
            setIsResetPasswordDialogOpen(false) // Close confirmation dialog
            setIsPasswordDisplayDialogOpen(true) // Open display dialog
        },
        onError: (error) => {
            toast.error("Failed to reset password", {
                description: error.message,
            })
        },
    })

    const handleResetPassword = () => {
        const generatedPassword = generatePassword();
        setNewGeneratedPassword(generatedPassword); // Store the generated password
        resetPasswordMutation.mutate({ userId: user.id, new_password: { new_password: generatedPassword } });
    };

    const copyPasswordToClipboard = () => {
        if (newGeneratedPassword) {
            navigator.clipboard.writeText(newGeneratedPassword)
            toast.success("New password copied to clipboard!")
        }
    }

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
                        <DropdownMenuItem onSelect={() => setIsResetPasswordDialogOpen(true)}>
                            Reset Password
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
                            <span className="font-medium text-foreground">{user.full_name}</span>.
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

            <AlertDialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reset Password</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to reset the password for{" "}
                            <span className="font-medium text-foreground">{user.full_name}</span>?
                            A new password will be generated.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleResetPassword}
                            disabled={resetPasswordMutation.isPending}
                        >
                            {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={isPasswordDisplayDialogOpen} onOpenChange={setIsPasswordDisplayDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>New Password for {user.full_name}</AlertDialogTitle>
                        <AlertDialogDescription>
                            Please provide this password to the user. For security, it will not be shown again.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex items-center space-x-2">
                        <Input type="text" value={newGeneratedPassword} readOnly className="font-mono" />
                        <Button onClick={copyPasswordToClipboard} size="icon" title="Copy to clipboard">
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setIsPasswordDisplayDialogOpen(false)}>Done</AlertDialogAction>
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