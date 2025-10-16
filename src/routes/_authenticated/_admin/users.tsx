import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { getUsers } from "@/lib/api/users"
import type { components } from "@/lib/api/schema"
import { DataTable } from "@/components/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { NewUserDialog } from "@/components/new-user-dialog"
import { UserActions } from "@/components/user-actions"
import * as React from "react"

type User = components["schemas"]["UserPublic"]

export const Route = createFileRoute("/_authenticated/_admin/users")({
    component: UsersComponent,
})

function UsersComponent() {
    // row selection state required by DataTable
    const [rowSelection, setRowSelection] = React.useState({})

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["users"],
        queryFn: () => getUsers(),
    })

    // log only when data changes
    React.useEffect(() => {
        if (data) {
            console.log("users data from API:", data)
        }
    }, [data])

    if (isError) {
        console.error("Error fetching users:", error)
        return <div>Error: {(error as Error)?.message ?? "Unknown error"}</div>
    }

    // normalize/unwrap data safely
    const safeData = Array.isArray(data) ? data : []

    const columns: ColumnDef<User>[] = [
        {
            accessorKey: "id",
            header: "ID",
            enableHiding: true,
        },
        {
            accessorKey: "username",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Username
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
        },
        {
            accessorKey: "full_name",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Full Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
        },
        {
            accessorKey: "role",
            header: "Role",
            cell: ({ row }) => {
                const role = (row.getValue("role") as string) ?? ""
                return (
                    <Badge variant={role.toLowerCase() === "admin" ? "default" : "secondary"}>
                        {role}
                    </Badge>
                )
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const user = row.original
                if (!user || user.id === undefined) {
                    console.warn("User object or user.id is undefined for row:", row)
                    return null
                }
                return <UserActions user={user} />
            },
        },
    ]

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold tracking-tight">User Management</h2>
                    <p className="text-muted-foreground">View and manage system users.</p>
                </div>
                <NewUserDialog />
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-10 w-1/4" />
                    <Skeleton className="h-[400px] w-full" />
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={safeData}
                    filterColumnId="username"
                    filterColumnPlaceholder="Filter by username..."
                    rowSelection={rowSelection}
                    setRowSelection={setRowSelection}
                />
            )}
        </div>
    )
}
