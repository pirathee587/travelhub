import { Bell, Search, User, X, LogIn } from "lucide-react";
import { Input } from "@/components/common/ui/input";
import { Button } from "@/components/common/ui/button";
import { Badge } from "@/components/common/ui/badge";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/features/tourist/services/api";
import { useAuth } from "@/context/AuthContext";
import notificationService from "@/services/notificationService";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/common/ui/dropdown-menu";

interface DashboardHeaderProps {
    userName?: string;
}

export function DashboardHeader({ userName: propUserName }: DashboardHeaderProps) {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const displayName = user?.name || propUserName || "Guest";

    useEffect(() => {
        if (user) {
            fetchNotifications();
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const data = await notificationService.getAll();
            setNotifications(data.slice(0, 5)); // Show latest 5
            setUnreadCount(data.filter((n: any) => !n.read).length);
        } catch (error) {
            console.error("Failed to load notifications", error);
        }
    };

    const handleNotificationClick = () => {
        navigate("/tourist/documents"); // Default documents or notification view if available
    };

    return (
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border h-12 md:h-14 lg:h-16 overflow-hidden">
            <div className="flex items-center justify-between h-full px-3 md:px-4 lg:px-6">
                {/* Left side - empty on mobile for menu button space */}
                <div className="w-10 md:w-12 lg:w-0 flex-shrink-0" />

                {/* Marquee Brand Name — CSS-based, reliable in all browsers */}
                <div className="flex-1 overflow-hidden mx-2 md:mx-4 h-full flex items-center">
                    <div className="flex w-max animate-marquee-scroll">
                        <span className="text-xs md:text-sm lg:text-base font-extrabold italic tracking-[0.2em] md:tracking-[0.25em] text-primary pr-10 md:pr-14 lg:pr-16 whitespace-nowrap select-none uppercase">
                            TRAVELHUB &bull; TRAVELHUB &bull; TRAVELHUB &bull; TRAVELHUB &bull; TRAVELHUB &bull;&nbsp;
                        </span>
                        <span className="text-xs md:text-sm lg:text-base font-extrabold italic tracking-[0.2em] md:tracking-[0.25em] text-primary pr-10 md:pr-14 lg:pr-16 whitespace-nowrap select-none uppercase" aria-hidden="true">
                            TRAVELHUB &bull; TRAVELHUB &bull; TRAVELHUB &bull; TRAVELHUB &bull; TRAVELHUB &bull;&nbsp;
                        </span>
                    </div>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-2 ml-auto">
                    {user ? (
                        <>
                            {/* Notifications */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="relative">
                                        <Bell className="h-5 w-5" />
                                        {unreadCount > 0 && (
                                            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-accent text-accent-foreground text-xs">
                                                {unreadCount}
                                            </Badge>
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-80">
                                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {notifications.length === 0 ? (
                                        <div className="p-4 text-center text-sm text-muted-foreground">No new notifications</div>
                                    ) : (
                                        notifications.map((notif: any) => (
                                            <DropdownMenuItem
                                                key={notif.id}
                                                className="flex flex-col items-start gap-1 cursor-pointer"
                                                onClick={handleNotificationClick}
                                            >
                                                <div className="flex items-center gap-2 w-full">
                                                    <span className="font-medium text-sm truncate">{notif.title}</span>
                                                    {!notif.read && <div className="h-2 w-2 rounded-full bg-primary ml-auto"></div>}
                                                </div>
                                                <span className="text-xs text-muted-foreground line-clamp-1 w-full text-left">
                                                    {notif.message}
                                                </span>
                                            </DropdownMenuItem>
                                        ))
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="cursor-pointer justify-center text-primary font-medium"
                                        onClick={handleNotificationClick}
                                    >
                                        View all notifications
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* User Menu */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="gap-2">
                                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shadow-sm">
                                            <User className="h-4 w-4 text-white" />
                                        </div>
                                        <span className="hidden sm:inline font-medium">{displayName}</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => navigate("/tourist/settings")}>Profile</DropdownMenuItem>
                                    <DropdownMenuItem>Preferences</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => navigate("/tourist/trips")}>My Trips</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="text-destructive cursor-pointer"
                                        onClick={() => {
                                            logout();
                                            navigate("/");
                                        }}
                                    >
                                        Log out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button
                                className="font-bold px-6 shadow-glow"
                                onClick={() => navigate("/login")}
                            >
                                <LogIn className="h-4 w-4 mr-2" />
                                Login
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
