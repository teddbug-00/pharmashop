import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { updateUser } from "@/lib/api/users"
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

type User = components["schemas"]["UserPublic"]

const formSchema = z.object({
    role: z.enum(["ADMIN", "MANAGER", "CASHIER"]).optional(),
})

interface EditUserDialogProps {
    user: User
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

export function EditUserDialog({ user, isOpen, onOpenChange }: EditUserDialogProps) {
    const queryClient = useQueryClient()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            role: user.role,
        },
    })

    const updateUserMutation = useMutation({
        mutationFn: (values: z.infer<typeof formSchema>) => updateUser({ userId: user.id, user: values }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["users"] })
            toast.success("User updated successfully!")
            onOpenChange(false)
        },
        onError: (error) => {
            toast.error("Failed to update user", {
                description: error.message,
            })
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        updateUserMutation.mutate(values)
    }

    // Reset form when the dialog is opened with a new user's data
    React.useEffect(() => {
        if (isOpen) {
            form.reset({
                role: user.role,
            })
        }
    }, [isOpen, user, form])

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogDescription>
                        Update the details for {user.full_name}.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="CASHIER">Cashier</SelectItem>
                                            <SelectItem value="MANAGER">Manager</SelectItem>
                                            <SelectItem value="ADMIN">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={updateUserMutation.isPending}>
                                {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
