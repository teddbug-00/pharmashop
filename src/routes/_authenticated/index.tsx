import { createFileRoute, Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    ArrowUpRight,
    DollarSign,
    Users,
    Tag, // New icon for Sales by Category
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
// import { getDashboardStats } from "@/lib/api/dashboard" // No longer fetching directly here
import * as React from "react";

export const Route = createFileRoute("/_authenticated/")({
    component: DashboardPage,
})

function DashboardPage() {
    // Retrieve statsData and isLoadingStats from the context provided by AuthenticatedLayout
    const { statsData, isLoadingStats } = Route.useRouteContext();

    const salesData = statsData?.recent_sales;
    const isLoadingSales = isLoadingStats;
    const topProducts = statsData?.top_selling_products;
    const salesByCategory = statsData?.sales_by_category;

    return (
        <div className="flex flex-1 flex-col gap-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4">
                {/* Today's Revenue */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Today's Revenue
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoadingStats ? (
                            <Skeleton className="h-8 w-3/4" />
                        ) : (
                            <div className="text-2xl font-bold">
                                GHS {statsData?.sales_today?.total_revenue ?? "0.00"}
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Total sales recorded today
                        </p>
                    </CardContent>
                </Card>

                {/* Last 7 Days Revenue */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Last 7 Days Revenue
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoadingStats ? (
                            <Skeleton className="h-8 w-3/4" />
                        ) : (
                            <div className="text-2xl font-bold">
                                GHS {statsData?.sales_last_7_days?.total_revenue ?? "0.00"}
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Total sales over last 7 days
                        </p>
                    </CardContent>
                </Card>

                {/* Last 30 Days Revenue */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Last 30 Days Revenue
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoadingStats ? (
                            <Skeleton className="h-8 w-3/4" />
                        ) : (
                            <div className="text-2xl font-bold">
                                GHS {statsData?.sales_last_30_days?.total_revenue ?? "0.00"}
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Total sales over last 30 days
                        </p>
                    </CardContent>
                </Card>

                {/* Removed Total Medicines Card */}
                {/* Removed Low Stock, Expiring Soon, Expired Batches, Out of Stock Cards */}
            </div>
            <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
                <Card className="xl:col-span-2">
                    <CardHeader className="flex flex-row items-center">
                        <div className="grid gap-2">
                            <CardTitle>Recent Sales</CardTitle>
                            <CardDescription>
                                Your 5 most recent sales transactions.
                            </CardDescription>
                        </div>
                        <Button asChild size="sm" className="ml-auto gap-1">
                            <Link to="/sales">
                                View All
                                <ArrowUpRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {isLoadingSales ? (
                            <div className="space-y-4">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Sale ID</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {salesData?.map((sale) => (
                                        <TableRow key={sale.id}>
                                            <TableCell>
                                                <div className="font-medium">SALE-{sale.id}</div>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(sale.sale_date).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                GHS {parseFloat(sale.total_amount).toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Top Selling Products</CardTitle>
                        <CardDescription>
                            Your best-performing products this month.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        {topProducts?.map((product) => (
                            <div key={product.medicine_id} className="flex items-center gap-4">
                                <Avatar className="hidden h-9 w-9 sm:flex">
                                    <AvatarImage src="/placeholder.svg" alt="Avatar" />
                                    <AvatarFallback>
                                        {product.name.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid gap-1 flex-1">
                                    <p className="text-sm font-medium leading-none">
                                        {product.name}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        {/* Progress bar logic might need adjustment based on available data */}
                                        <Progress value={product.total_quantity_sold} className="h-2" />
                                        <span className="text-xs text-muted-foreground">{product.total_quantity_sold} sold</span>
                                    </div>
                                </div>
                                <div className="ml-auto font-medium">+{product.total_quantity_sold} sold</div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
                {/* Sales by Category Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="grid gap-2">
                            <CardTitle>Sales by Category</CardTitle>
                            <CardDescription>
                                Revenue breakdown by medicine category.
                            </CardDescription>
                        </div>
                        <Tag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoadingStats ? (
                            <div className="space-y-4">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Category</TableHead>
                                        <TableHead className="text-right">Revenue</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {salesByCategory?.map((category) => (
                                        <TableRow key={category.category_name}>
                                            <TableCell>
                                                <div className="font-medium">{category.category_name}</div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                GHS {parseFloat(category.total_revenue).toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}