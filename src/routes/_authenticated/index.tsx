import * as React from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { Bar, BarChart, Line, LineChart, XAxis, YAxis } from "recharts"

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
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getDashboardStats } from "@/lib/api/dashboard"
import { getSales } from "@/lib/api/sales"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

export const Route = createFileRoute("/_authenticated/")({
    component: DashboardPage,
})

// --- SAMPLE DATA & CONFIG FOR NEW CHARTS ---
const salesOverviewData = [
    { date: "2024-07-01", revenue: 2220 },
    { date: "2024-07-02", revenue: 970 },
    { date: "2024-07-03", revenue: 1670 },
    { date: "2024-07-04", revenue: 2420 },
    { date: "2024-07-05", revenue: 3730 },
    { date: "2024-07-06", revenue: 3010 },
    { date: "2024-07-07", revenue: 2450 },
]

const monthlyPerformanceData = [
    { month: "January", revenue: 18600, profit: 8000 },
    { month: "February", revenue: 30500, profit: 12000 },
    { month: "March", revenue: 23700, profit: 10000 },
    { month: "April", revenue: 7300, profit: 3000 },
    { month: "May", revenue: 20900, profit: 9500 },
    { month: "June", revenue: 21400, profit: 9800 },
]

const chartConfig = {
    revenue: {
        label: "Revenue",
        color: "hsl(var(--chart-1))",
    },
    profit: {
        label: "Profit",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig

function DashboardPage() {
    // --- LIVE DATA FETCHING ---
    const { data: statsData, isLoading: isLoadingStats } = useQuery({
        queryKey: ["dashboardStats"],
        queryFn: () => getDashboardStats(),
    })

    const { data: salesData, isLoading: isLoadingSales } = useQuery({
        queryKey: ["recentSales"],
        queryFn: () => getSales(0, 5), // Fetch the 5 most recent sales
    })

    return (
        <div className="flex min-h-screen w-full flex-col">
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                {/* --- STAT CARDS --- */}
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
                        </CardContent>
                    </Card>
                    <Card>
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
                        </CardContent>
                    </Card>
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
                        </CardContent>
                    </Card>
                </div>

                {/* --- CHARTS AND RECENT SALES --- */}
                <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-3">
                    {/* --- SALES OVERVIEW CHART --- */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Weekly Sales Overview</CardTitle>
                            <CardDescription>
                                Revenue from the last 7 days.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={chartConfig} className="h-[250px] w-full">
                                <LineChart
                                    accessibilityLayer
                                    data={salesOverviewData}
                                    margin={{
                                        left: 12,
                                        right: 12,
                                    }}
                                >
                                    <XAxis
                                        dataKey="date"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        tickFormatter={(value) => value.slice(0, 3)}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        tickFormatter={(value) => `GHS ${value / 1000}k`}
                                    />
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent indicator="line" />}
                                    />
                                    <Line
                                        dataKey="revenue"
                                        type="monotone"
                                        stroke="var(--color-revenue)"
                                        strokeWidth={2}
                                        dot={true}
                                    />
                                </LineChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* --- RECENT SALES TABLE --- */}
                    <Card>
                        <CardHeader className="flex flex-row items-center">
                            <div className="grid gap-2">
                                <CardTitle>Recent Sales</CardTitle>
                                <CardDescription>
                                    Your 5 most recent sales.
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
                                            <TableHead className="text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {salesData?.map((sale) => (
                                            <TableRow key={sale.id}>
                                                <TableCell>
                                                    <div className="font-medium">SALE-{sale.id}</div>
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
                </div>

                {/* --- MONTHLY PERFORMANCE CHART --- */}
                <div className="grid grid-cols-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Monthly Performance</CardTitle>
                            <CardDescription>
                                Revenue vs. Profit for the last 6 months.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={chartConfig} className="h-[300px] w-full">
                                <BarChart accessibilityLayer data={monthlyPerformanceData}>
                                    <XAxis
                                        dataKey="month"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                        tickFormatter={(value) => value.slice(0, 3)}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        tickFormatter={(value) => `GHS ${value / 1000}k`}
                                    />
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent indicator="dashed" />}
                                    />
                                    <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                                    <Bar dataKey="profit" fill="var(--color-profit)" radius={4} />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}