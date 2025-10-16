import { createFileRoute, Outlet, redirect, Link } from "@tanstack/react-router"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { useQuery } from "@tanstack/react-query"
import { getDashboardStats } from "@/lib/api/dashboard"
import * as React from "react";
import { AlertTriangle, Clock, CalendarX, PackageX } from "lucide-react"; // Import icons
import { Badge } from "@/components/ui/badge"; // Import Badge component

export const Route = createFileRoute("/_authenticated")({
    beforeLoad: ({ context, location }) => {
        if (!context.auth?.isAuthenticated) {
            throw  redirect({
                to: "/login",
                search: {
                    redirect: location.href
                },
            })
        }
    },
    component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
    console.log("AuthenticatedLayout component is rendering!");

    const { data: statsData, isLoading: isLoadingStats } = useQuery({
        queryKey: ["dashboardStats"],
        queryFn: () => getDashboardStats(),
        staleTime: 1000 * 60 * 5,
    });

    const lowStockCount = statsData?.inventory_summary?.low_stock_medicines ?? 0;
    const expiringSoonCount = statsData?.expiring_soon_batches?.length ?? 0;
    const expiredBatchesCount = statsData?.inventory_summary?.expired_batches ?? 0;
    const outOfStockCount = statsData?.inventory_summary?.out_of_stock_medicines ?? 0;

    return (
        <div className="flex min-h-screen w-full flex-col">
            <header className="sticky top-0 z-40 w-full border-b bg-background">
                <div className="flex h-14 items-center justify-between px-4 md:px-8">
                    <MainNav />
                    {/* Alert Icons - New Placement */}
                    <div className="flex items-center space-x-4 ml-auto mr-4">
                        {/* Out of Stock */}
                        <Link to="/reports/out-of-stock" className="relative">
                            <PackageX className="h-6 w-6 text-red-500" />
                            {outOfStockCount > 0 && (
                                <Badge variant="destructive" className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center rounded-full text-xs">
                                    {outOfStockCount}
                                </Badge>
                            )}
                        </Link>
                        {/* Low Stock */}
                        <Link to="/reports/low-stock" className="relative">
                            <AlertTriangle className="h-6 w-6 text-yellow-500" />
                            {lowStockCount > 0 && (
                                <Badge variant="warning" className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center rounded-full text-xs">
                                    {lowStockCount}
                                </Badge>
                            )}
                        </Link>
                        {/* Expiring Soon */}
                        <Link to="/reports/expiring-soon" className="relative">
                            <Clock className="h-6 w-6 text-orange-500" />
                            {expiringSoonCount > 0 && (
                                <Badge variant="secondary" className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center rounded-full text-xs">
                                    {expiringSoonCount}
                                </Badge>
                            )}
                        </Link>
                        {/* Expired Batches */}
                        <Link to="/reports/expired-batches" className="relative">
                            <CalendarX className="h-6 w-6 text-red-500" />
                            {expiredBatchesCount > 0 && (
                                <Badge variant="destructive" className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center rounded-full text-xs">
                                    {expiredBatchesCount}
                                </Badge>
                            )}
                        </Link>
                    </div>
                    <UserNav />
                </div>
            </header>
            <div className="flex-1">
                <main className="p-4 md:p-8">
                    <Outlet context={{ statsData, isLoadingStats }} />
                </main>
            </div>
        </div>
    )
}