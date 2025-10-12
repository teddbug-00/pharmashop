import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { AlertTriangle, DollarSign, Pill } from "lucide-react"
import { getDashboardStats } from "@/lib/api/dashboard"
import { Skeleton } from "@/components/ui/skeleton"

export const Route = createFileRoute("/_authenticated/")({
    component: DashboardIndex,
})


function DashboardIndex() {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["dashboard", "stats"],
        queryFn: getDashboardStats,
    })

    if (isError) {
        return <div>Error fetching dashboard stats: {error.message}</div>
    }

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">An overview of your pharmacy's performance.</p>
            </div>
            <div className="mx-auto grid w-full max-w-6xl gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Today's Revenue
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-3/4" />
                        ) : (
                            <div className="text-xl font-bold">
                                ${data?.total_sales_today ?? "0.00"}
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Total sales recorded today
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Medicines
                        </CardTitle>
                        <Pill className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-1/2" />
                        ) : (
                            <div className="text-xl font-bold">
                                {data?.total_medicines ?? 0}
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Unique medicine types in inventory
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Low Stock Items
                        </CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-1/2" />
                        ) : (
                            <div className="text-xl font-bold">
                                {data?.low_stock_items_count ?? 0}
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Items at or below stock threshold
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}