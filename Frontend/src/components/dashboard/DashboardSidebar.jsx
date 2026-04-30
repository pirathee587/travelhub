import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Map,
    FileText,
    Compass,
    Settings,
    Bell,
    LogOut,
    Plane,
    Menu,
    X,
    Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const navItems = [
    { icon: Compass, label: "Explore", path: "/" },
    { icon: LayoutDashboard, label: "Overview", path: "/overview" },
    { icon: Map, label: "My Trips", path: "/trips" },
    { icon: FileText, label: "Documents", path: "/documents" },
    { icon: Building2, label: "Hotels", path: "/hotels" },
];

const bottomNavItems = [
    { icon: Settings, label: "Settings", path: "/settings" },
];

export function DashboardSidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();

    const isActive = (path) => {
        if (path === "/") {
            return location.pathname === "/" || location.pathname.startsWith("/explore");
        }
        return location.pathname === path || location.pathname.startsWith(`${path}/`);
    };

    const SidebarContent = () => (
        <>
            {/* Logo */}
            <div className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl gradient-ocean flex items-center justify-center shadow-glow">
                    <Plane className="h-5 w-5 text-primary-foreground" />
                </div>
                {!collapsed && (
                    <div className="animate-fade-in">
                        <h1 className="font-bold text-lg text-sidebar-foreground">TravelHub</h1>
                        <p className="text-xs text-sidebar-foreground/60">Dashboard</p>
                    </div>
                )}
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                            "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                            isActive(item.path) && "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow"
                        )}
                    >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!collapsed && <span className="font-medium">{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Notifications */}
            {!collapsed && (
                <div className="mx-3 p-4 rounded-xl bg-sidebar-accent/50 border border-sidebar-border animate-fade-in">
                    <div className="flex items-center gap-2 mb-2">
                        <Bell className="h-4 w-4 text-sidebar-primary" />
                        <span className="text-sm font-medium text-sidebar-foreground">Notifications</span>
                        <Badge className="ml-auto bg-accent text-accent-foreground text-xs px-1.5 py-0.5">3</Badge>
                    </div>
                    <p className="text-xs text-sidebar-foreground/60">You have 3 new updates</p>
                </div>
            )}

            {/* Bottom Navigation */}
            <nav className="px-3 py-4 border-t border-sidebar-border space-y-1">
                {bottomNavItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                            "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                            isActive(item.path) && "bg-sidebar-accent text-sidebar-foreground"
                        )}
                    >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!collapsed && <span className="font-medium">{item.label}</span>}
                    </NavLink>
                ))}
                <button
                    className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                        "text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10"
                    )}
                >
                    <LogOut className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span className="font-medium">Log Out</span>}
                </button>
            </nav>

            {/* Collapse Button - Desktop only */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="hidden lg:flex absolute -right-3 top-20 h-6 w-6 items-center justify-center rounded-full bg-sidebar-accent border border-sidebar-border text-sidebar-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground transition-colors"
            >
                <Menu className="h-3 w-3" />
            </button>
        </>
    );

    return (
        <>
            {/* Mobile Trigger */}
            <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 h-10 w-10 flex items-center justify-center rounded-lg bg-card border border-border shadow-card"
            >
                <Menu className="h-5 w-5" />
            </button>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-40 bg-foreground/50 backdrop-blur-sm"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside
                className={cn(
                    "lg:hidden fixed left-0 top-0 z-50 h-full w-64 bg-sidebar transform transition-transform duration-300",
                    mobileOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <button
                    onClick={() => setMobileOpen(false)}
                    className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-lg text-sidebar-foreground hover:bg-sidebar-accent"
                >
                    <X className="h-5 w-5" />
                </button>
                <div className="h-full flex flex-col">
                    <SidebarContent />
                </div>
            </aside>

            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    "hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 z-30",
                    collapsed ? "w-16" : "w-64"
                )}
            >
                <SidebarContent />
            </aside>
        </>
    );
}
