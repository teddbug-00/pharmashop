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

export function MainNav({
    className,
    ...props
}: React.HTMLAttributes<HTMLElement>) {
    const { user } = useAuth()

    return (
        <div className="flex items-center gap-6 text-sm" {...props}>
            <Link to="/" className="flex items-center gap-2 font-semibold">
                <Pill className="h-6 w-6" />
                <span>PharmaShop</span>
            </Link>
            <NavigationMenu className={cn("hidden md:flex", className)}>
                <NavigationMenuList>
                    <NavigationMenuItem>
                        <NavigationMenuLink asChild>
                            <Link
                                to="/"
                                className={navigationMenuTriggerStyle()} // Apply style directly to Link
                                activeProps={{
                                    className: "bg-accent text-accent-foreground",
                                }}
                            >
                                Dashboard
                            </Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuLink asChild>
                            <Link
                                to="/medicines"
                                className={navigationMenuTriggerStyle()} // Apply style directly to Link
                                activeProps={{
                                    className: "bg-accent text-accent-foreground",
                                }}
                            >
                                Inventory
                            </Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuLink asChild>
                            <Link
                                to="/sales"
                                className={navigationMenuTriggerStyle()} // Apply style directly to Link
                                activeProps={{
                                    className: "bg-accent text-accent-foreground",
                                }}
                            >
                                Sales
                            </Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                    {user?.role === "ADMIN" && (
                        <NavigationMenuItem>
                            <NavigationMenuLink asChild>
                                <Link
                                    to="/users"
                                    className={navigationMenuTriggerStyle()} // Apply style directly to Link
                                    activeProps={{
                                        className: "bg-accent text-accent-foreground",
                                    }}
                                >
                                    Users
                                </Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                    )}
                </NavigationMenuList>
            </NavigationMenu>
        </div>
    )
}