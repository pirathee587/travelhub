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
                            <DropdownMenuItem className="flex flex-col items-start gap-1 cursor-pointer">
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
                                <span className="hidden sm:inline font-medium">{userName}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => navigate("/settings")}>Profile</DropdownMenuItem>
                            <DropdownMenuItem>Preferences</DropdownMenuItem>
                            <DropdownMenuItem>Billing</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">Log out</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
