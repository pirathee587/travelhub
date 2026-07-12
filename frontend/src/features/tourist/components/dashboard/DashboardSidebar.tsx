import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
    LayoutDashboard,
    Map,
    FileText,
    Compass,
    Settings,
    LogOut,
    Plane,
    Menu,
    X,
    Building2,
    Users,
    CreditCard,
} from "lucide-react";
import { cn } from "@/features/tourist/services/utils";

const navItems = [
    { icon: Compass, label: "Explore", path: "/tourist" },
    { icon: LayoutDashboard, label: "Overview", path: "/tourist/overview" },
    { icon: Map, label: "My Trips", path: "/tourist/trips" },
    { icon: FileText, label: "Documents", path: "/tourist/documents" },
    { icon: Building2, label: "Hotels", path: "/tourist/hotels" },
    { icon: Users, label: "Agents", path: "/tourist/agents" },
    { icon: CreditCard, label: "Billing", path: "/tourist/billing" },
];

const bottomNavItems = [
    { icon: Settings, label: "Settings", path: "/tourist/settings" },
];

interface DashboardSidebarProps {
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
}

export function DashboardSidebar({ collapsed, setCollapsed }: DashboardSidebarProps) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const isActive = (path: string) => {
        if (path === "/tourist") {
            return location.pathname === "/" || location.pathname === "/tourist" || location.pathname === "/tourist/" || location.pathname.startsWith("/tourist/explore");
        }
        if (path === "/") {
            return location.pathname === "/" || location.pathname.startsWith("/explore");
        }
        return location.pathname === path || location.pathname.startsWith(`${path}/`);
    };

    const handleLogout = () => {
        logout();
        navigate("/");
        setMobileOpen(false);
    };

    const visibleNavItems = navItems.filter(item => {
        if (!user) {
            // Guest can only see Explore
            return item.path === "/tourist";
        }
        return true;
    });

    const visibleBottomNavItems = bottomNavItems.filter(item => {
        if (!user) return false;
        return true;
    });

    const SidebarContent = () => (
        <>
            {/* Logo */} 
            <div className={cn("p-4 flex items-center gap-3 transition-all duration-300", collapsed && "justify-center px-2 py-4")}>
                <div className={cn("rounded-xl bg-primary flex items-center justify-center shadow-glow transition-all duration-300", collapsed ? "h-10 w-10" : "h-12 w-12")}>
                    <Plane className={cn("text-white transition-all duration-300", collapsed ? "h-5 w-5" : "h-7 w-7")} />
                </div>
                {!collapsed && (
                    <div className="animate-fade-in">
                        <h1 className="font-bold text-lg text-sidebar-foreground">TravelHub</h1> 
                        <p className="text-xs text-sidebar-foreground/60">Dashboard</p>
                    </div>
                )}
            </div>

            {/* Main Navigation */}
            <nav className={cn("flex-1 px-3 py-4 space-y-1 transition-all duration-300", collapsed && "px-1")}>
                {visibleNavItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path === "/tourist" ? "/" : item.path}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                            "flex items-center rounded-xl transition-all duration-300",
                            collapsed ? "justify-center px-0 py-3" : "px-4 py-3 gap-3",
                            "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                            !collapsed && "hover:translate-x-1",
                            isActive(item.path) && (collapsed ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow" : "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow translate-x-1")
                        )}
                    >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!collapsed && <span className="font-semibold">{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom Navigation */}
            <nav className={cn("px-3 py-4 border-t border-sidebar-border space-y-1 transition-all duration-300", collapsed && "px-1")}>
                {visibleBottomNavItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                            "flex items-center rounded-lg transition-all",
                            collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5 gap-3",
                            "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                            isActive(item.path) && "bg-sidebar-accent text-sidebar-foreground"
                        )}
                    >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!collapsed && <span className="font-medium">{item.label}</span>}
                    </NavLink>
                ))}
                {user && (
                    <button
                        onClick={handleLogout}
                        className={cn(
                            "w-full flex items-center rounded-xl transition-all duration-300",
                            collapsed ? "justify-center px-0 py-3" : "px-4 py-3 gap-3",
                            "text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10",
                            !collapsed && "hover:translate-x-1"
                        )}
                    >
                        <LogOut className="h-5 w-5 flex-shrink-0" />
                        {!collapsed && <span className="font-semibold">Log Out</span>}
                    </button>
                )}
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
                    "hidden lg:flex flex-col relative h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out z-30 flex-shrink-0",
                    collapsed ? "w-16" : "w-64"
                )}
            >
                <SidebarContent />
            </aside>
        </>
    );
}
