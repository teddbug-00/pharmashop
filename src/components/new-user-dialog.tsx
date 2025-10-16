import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Eye, EyeOff, PlusCircle, Sparkles } from "lucide-react"

import { createUser } from "@/lib/api/users"
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

const formSchema = z.object({
    full_name: z.string().min(3, "Full name must be at least 3 characters long"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    role: z.enum(["ADMIN", "MANAGER", "CASHIER"]),
})

function generatePassword(length = 6) {
    const numbers = "0123456789"

    let password = ""
    for (let i = 0; i < length; i++) {
        password += numbers[Math.floor(Math.random() * numbers.length)]
    }
    return password
}

export function NewUserDialog() {
    const queryClient = useQueryClient()
    const [isOpen, setIsOpen] = React.useState(false)
    const [isPasswordVisible, setIsPasswordVisible] = React.useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            full_name: "",
            password: "",
            role: "CASHIER",
        },
    })

    const createUserMutation = useMutation({
        mutationFn: createUser,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["users"] })
            toast.success("User created successfully!")
            setIsOpen(false)
            setIsPasswordVisible(false) // Reset visibility on close
            form.reset()
        },
        onError: (error) => {
            toast.error("Failed to create user", {
                description: error.message,
            })
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        createUserMutation.mutate(values)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New User
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                    <DialogDescription>
                        Enter the details for the new user.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="full_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <div className="relative">
                                        <FormControl>
                                            <Input
                                                type={isPasswordVisible ? "text" : "password"}
                                                {...field}
                                            />
                                        </FormControl>
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                                            {field.value && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    onClick={() => setIsPasswordVisible((prev) => !prev)}
                                                >
                                                    {isPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </Button>
                                            )}
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => {
                                                    const newPassword = generatePassword()
                                                    form.setValue("password", newPassword, { shouldValidate: true })
                                                    navigator.clipboard.writeText(newPassword)
                                                    toast.success("Generated password copied to clipboard!")
                                                }}
                                            >
                                                <Sparkles className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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
                            <Button type="submit" disabled={createUserMutation.isPending}>
                                {createUserMutation.isPending ? "Creating..." : "Create User"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
