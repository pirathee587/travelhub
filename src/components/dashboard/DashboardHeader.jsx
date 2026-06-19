import { Bell, Search, User, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DashboardHeader({ userName }) {
    const navigate = useNavigate();

    /**
     * Logout handler — mirrors the sidebar's handleLogout.
     * Clears cached userName and redirects to the explore / root page.
     * TODO: When JWT auth is added, also clear the token here.
     */
    const handleLogout = () => {
        localStorage.removeItem("userName");
        navigate("/");
    };

    return (
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border h-12 md:h-14 lg:h-16 overflow-hidden">
            <div className="flex items-center justify-between h-full px-3 md:px-4 lg:px-6">
                {/* Left side - empty on mobile for menu button space */}
                <div className="w-10 md:w-12 lg:w-0 flex-shrink-0" />

                {/* Marquee Effect */}
                <div className="flex-1 overflow-hidden mx-2 md:mx-4 h-8 md:h-10 flex items-center bg-gradient-to-r from-blue-500/10 via-emerald-500/10 to-blue-500/10 rounded-full border border-emerald-500/20 relative shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)]">
                    {/* Edge fade gradients for smooth text entry/exit */}
                    <div className="absolute left-0 top-0 bottom-0 w-8 md:w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none rounded-l-full" />
                    <div className="absolute right-0 top-0 bottom-0 w-8 md:w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none rounded-r-full" />
                    
                    <div className="flex w-max animate-marquee-scroll items-center h-full">
                        <span className="text-xs md:text-sm font-black italic tracking-[0.2em] md:tracking-[0.25em] bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500 text-transparent bg-clip-text pr-10 md:pr-14 lg:pr-16 whitespace-nowrap select-none uppercase drop-shadow-sm">
                            TRAVELHUB &bull; TRAVELHUB &bull; TRAVELHUB &bull; TRAVELHUB &bull;TRAVELHUB &bull; TRAVELHUB &bull; TRAVELHUB &bull; TRAVELHUB &bull;TRAVELHUB &bull; TRAVELHUB &bull; TRAVELHUB &bull; TRAVELHUB &bull; TRAVELHUB &bull;&nbsp;
                        </span>
                    </div>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-2 ml-auto">

                    {/* Notifications */}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="relative">
                                <Bell className="h-5 w-5" />
                                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-accent text-accent-foreground text-xs">
                                    3
                                </Badge>
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-80">
                            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {/* <DropdownMenuItem className="flex flex-col items-start gap-1 cursor-pointer">
                                <span className="font-medium">Trip Reminder</span>
                                <span className="text-sm text-muted-foreground">
                                    Your Bali trip starts in 3 days!
                                </span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex flex-col items-start gap-1 cursor-pointer">
                                <span className="font-medium">Payment Confirmed</span>
                                <span className="text-sm text-muted-foreground">
                                    Payment for Paris trip received
                                </span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex flex-col items-start gap-1 cursor-pointer">
                                <span className="font-medium">New Recommendation</span>
                                <span className="text-sm text-muted-foreground">
                                    Check out our Swiss Alps package!
                                </span>
                            </DropdownMenuItem> */}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* User Menu */}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="gap-2">
                                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shadow-sm">
                                    <User className="h-4 w-4 text-white" />
                                </div>
                                <span className="hidden sm:inline font-medium">{userName}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-primary" onClick={() => navigate("/settings")}>Profile</DropdownMenuItem>
                            {/* <DropdownMenuItem>Preferences</DropdownMenuItem> */}
                            <DropdownMenuItem>Billing</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-500" onClick={handleLogout}>Log out</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
