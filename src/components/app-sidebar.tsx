import { Link } from "@tanstack/react-router"
import {
    LayoutDashboard,
    Pill,
    ShoppingCart,
    Users,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarFooter,
} from "@/components/ui/sidebar"
import { UserNav } from "@/components/user-nav"
import { useAuth } from "@/hooks/use-auth"
import React from "react"

interface NavLink {
    to: string
    title: string
    icon: React.ElementType
    adminOnly: boolean
}

const navLinks: NavLink[] = [
    {
        to: "/",
        title: "Dashboard",
        icon: LayoutDashboard,
        adminOnly: false,
    },
    {
        to: "/medicines",
        title: "Inventory",
        icon: Pill,
        adminOnly: false,
    },
    {
        to: "/sales",
        title: "Sales",
        icon: ShoppingCart,
        adminOnly: false,
    },
    {
        to: "/users",
        title: "Users",
        icon: Users,
        adminOnly: true,
    },
]

export function AppSidebar() {
    const { user } = useAuth()

    const filteredLinks = navLinks.filter(
        (link) => !link.adminOnly || user?.role === "admin",
    )

    return (
        <Sidebar>
            <SidebarHeader>
                <Link to="/" className="flex items-center gap-2 font-semibold">
                    <Pill className="h-6 w-6" />
                    <span>PharmaShop</span>
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {filteredLinks.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link
                                            to={item.to}
                                            activeProps={{
                                                className: "bg-sidebar-accent",
                                            }}
                                        >
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <UserNav />
            </SidebarFooter>
        </Sidebar>
    )
}