import {createFileRoute} from "@tanstack/react-router";
import type { components } from "@/lib/api/schema"
import { z } from "zod"
import { useAuth } from "@/hooks/use-auth"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import api from "@/lib/api/client"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type Token = components["schemas"]["Token"]
type UserPublic = components["schemas"]["UserPublic"]

const formSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
})

// Define the route
export const Route = createFileRoute("/login")({
    component: LoginComponent,
})

function LoginComponent() {
    const auth = useAuth()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    })

    const loginMutation = useMutation({
        mutationFn: async (values: z.infer<typeof formSchema>) => {
            // The API expects 'application/x-www-form-urlencoded'
            const formData = new URLSearchParams()
            formData.append("username", values.username)
            formData.append("password", values.password)

            const res = await api.post<Token>("/api/v1/auth/token", formData, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            })
            return res.data
        },
        onSuccess: (data) => {
            // Construct a minimal UserPublic object from the login response
            // Note: The login endpoint does not return full UserPublic details (id, full_name, username).
            // We are using placeholder values for id and full_name, and the username from the form.
            // In a more complete application, you might fetch full user details from a /users/me endpoint.
            const userToLogin: UserPublic = {
                id: 0, // Placeholder ID
                username: form.getValues("username"),
                full_name: form.getValues("username"), // Placeholder full_name
                role: data.user_role,
            }

            auth.login(data.access_token, data.refresh_token, userToLogin)
        },
        onError: (error) => {
            // You can handle login errors here, e.g., show a toast notification
            console.error("Login failed:", error)
            form.setError("root", {
                message: "Invalid username or password.",
            })
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        loginMutation.mutate(values)
    }

    return (
        <div className="flex min-h-svh items-center justify-center bg-gray-100 dark:bg-gray-950">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>
                        Enter your username below to login to your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4"
                        >
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="admin"
                                                {...field}
                                            />
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
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="••••••••"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {form.formState.errors.root && (
                                <p className="text-sm font-medium text-destructive">
                                    {form.formState.errors.root.message}
                                </p>
                            )}
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loginMutation.isPending}
                            >
                                {loginMutation.isPending
                                    ? "Signing In..."
                                    : "Sign In"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}