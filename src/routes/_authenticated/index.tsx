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
    AlertTriangle,
    ArrowUpRight,
    Clock,
    DollarSign,
    Users,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { getDashboardStats } from "@/lib/api/dashboard"
import { getSales } from "@/lib/api/sales"

export const Route = createFileRoute("/_authenticated/")({
    component: DashboardPage,
})

function DashboardPage() {
    // --- LIVE DATA FETCHING ---
    const { data: statsData, isLoading: isLoadingStats } = useQuery({
        queryKey: ["dashboardStats"],
        queryFn: () => getDashboardStats(),
    })

    const { data: salesData, isLoading: isLoadingSales } = useQuery({
        queryKey: ["recentSales"],
        // Fetch the 5 most recent sales
        queryFn: () => getSales(0, 5),
    })

    // --- SAMPLE DATA (for widgets without a current API endpoint) ---
    const topProducts = [
        { name: "Paracetamol 500mg", sold: 120, stock: 80 },
        { name: "Amoxicillin 250mg", sold: 98, stock: 22 },
        { name: "Vitamin C 1000mg", sold: 85, stock: 150 },
    ]

    return (
        <div className="flex flex-1 flex-col gap-4">
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
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
                                GHS {statsData?.total_sales_today ?? "0.00"}
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
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoadingStats ? (
                            <Skeleton className="h-8 w-1/2" />
                        ) : (
                            <div className="text-2xl font-bold">
                                {statsData?.total_medicines ?? 0}
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Unique products in inventory
                        </p>
                    </CardContent>
                </Card>
                <Link to="/reports/low-stock">
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {isLoadingStats ? (
                                <Skeleton className="h-8 w-1/2" />
                            ) : (
                                <div className="text-2xl font-bold">
                                    {statsData?.low_stock_items_count ?? 0}
                                </div>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Items below stock threshold
                            </p>
                        </CardContent>
                    </Card>
                </Link>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Expiring Soon
                        </CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoadingStats ? (
                            <Skeleton className="h-8 w-1/2" />
                        ) : (
                            <div className="text-2xl font-bold">
                                {statsData?.low_stock_items_count ?? 0}
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Items expiring in next 30 days
                        </p>
                    </CardContent>
                </Card>
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
                                                GHS {sale.total_amount.toFixed(2)}
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
                        {topProducts.map((product) => (
                            <div key={product.name} className="flex items-center gap-4">
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
                                        <Progress value={(product.stock / (product.stock + product.sold)) * 100} className="h-2" />
                                        <span className="text-xs text-muted-foreground">{product.stock} left</span>
                                    </div>
                                </div>
                                <div className="ml-auto font-medium">+{product.sold} sold</div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}