import { createFileRoute } from "@tanstack/react-router"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { DollarSign, Pill, Users } from "lucide-react"

export const Route = createFileRoute("/_authenticated/")({
    component: DashboardIndex,
})


function DashboardIndex() {
    return (
        <div>
            <h2 className="mb-4 text-3xl font-bold tracking-tight">
                Dashboard
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Revenue
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$45,231.89</div>
                        <p className="text-xs text-muted-foreground">
                            +20.1% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Medicines in Stock
                        </CardTitle>
                        <Pill className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,254</div>
                        <p className="text-xs text-muted-foreground">
                            +180 since last week
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Active Users
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+5</div>
                        <p className="text-xs text-muted-foreground">
                            +1 since last hour
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}