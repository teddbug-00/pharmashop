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
            // Create a sample user object, as you suggested.
            // We'll assume the role is 'admin' for now to test admin features.
            // When your backend is updated, this object will be replaced
            // with the real user data from the API response.
            const userToLogin = {
                id: 1, // The schema requires an ID, so we'll add a placeholder
                username: form.getValues("username"),
                role: "admin" as const, // Hardcode to 'admin' for testing
            }

            auth.login(data.access_token, userToLogin)
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