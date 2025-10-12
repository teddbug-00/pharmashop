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
                        <Link
                            to="/"
                            activeProps={{
                                className: "bg-accent text-accent-foreground",
                            }}
                        >
                            <NavigationMenuLink
                                className={navigationMenuTriggerStyle()}
                            >
                                Dashboard
                            </NavigationMenuLink>
                        </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <Link
                            to="/medicines"
                            activeProps={{
                                className: "bg-accent text-accent-foreground",
                            }}
                        >
                            <NavigationMenuLink
                                className={navigationMenuTriggerStyle()}
                            >
                                Inventory
                            </NavigationMenuLink>
                        </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <Link
                            to="/sales"
                            activeProps={{
                                className: "bg-accent text-accent-foreground",
                            }}
                        >
                            <NavigationMenuLink
                                className={navigationMenuTriggerStyle()}
                            >
                                Sales
                            </NavigationMenuLink>
                        </Link>
                    </NavigationMenuItem>
                    {user?.role === "admin" && (
                        <NavigationMenuItem>
                            <Link
                                to="/users"
                                activeProps={{
                                    className: "bg-accent text-accent-foreground",
                                }}
                            >
                                <NavigationMenuLink
                                    className={navigationMenuTriggerStyle()}
                                >
                                    Users
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>
                    )}
                </NavigationMenuList>
            </NavigationMenu>
        </div>
    )
}