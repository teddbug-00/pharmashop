import { Link } from "@tanstack/react-router"
import { cn } from "@/lib/utils"
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Pill } from "lucide-react"
import React from "react"
import { useAuth } from "@/hooks/use-auth"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface MainNavProps extends React.HTMLAttributes<HTMLElement> {}

export function MainNav({
    className,
    ...props
}: MainNavProps) {
    const { user } = useAuth()

    return (
        <div className="flex items-center gap-6 text-sm" {...props}>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link to="/" className="flex items-center gap-2 font-semibold">
                            <Pill className="h-6 w-6" />
                            <span>PharmaShop</span>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Home</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <NavigationMenu className={cn("hidden md:flex", className)}>
                <NavigationMenuList>
                    <NavigationMenuItem>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <NavigationMenuLink asChild>
                                    <Link
                                        to="/"
                                        className={navigationMenuTriggerStyle()}
                                        activeProps={{
                                            className: "bg-accent text-accent-foreground",
                                        }}
                                    >
                                        Dashboard
                                    </Link>
                                </NavigationMenuLink>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Dashboard</p>
                            </TooltipContent>
                        </Tooltip>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <NavigationMenuLink asChild>
                                    <Link
                                        to="/medicines"
                                        className={navigationMenuTriggerStyle()}
                                        activeProps={{
                                            className: "bg-accent text-accent-foreground",
                                        }}
                                    >
                                        Inventory
                                    </Link>
                                </NavigationMenuLink>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Manage Inventory</p>
                            </TooltipContent>
                        </Tooltip>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <NavigationMenuLink asChild>
                                    <Link
                                        to="/sales"
                                        className={navigationMenuTriggerStyle()}
                                        activeProps={{
                                            className: "bg-accent text-accent-foreground",
                                        }}
                                    >
                                        Sales
                                    </Link>
                                </NavigationMenuLink>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>View Sales</p>
                            </TooltipContent>
                        </Tooltip>
                    </NavigationMenuItem>
                    {user?.role === "ADMIN" && (
                        <NavigationMenuItem>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <NavigationMenuLink asChild>
                                        <Link
                                            to="/users"
                                            className={navigationMenuTriggerStyle()}
                                            activeProps={{
                                                className: "bg-accent text-accent-foreground",
                                            }}
                                        >
                                            Users
                                        </Link>
                                    </NavigationMenuLink>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Manage Users</p>
                                </TooltipContent>
                            </Tooltip>
                        </NavigationMenuItem>
                    )}
                </NavigationMenuList>
            </NavigationMenu>
        </div>
    )
}