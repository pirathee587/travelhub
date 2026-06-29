import { useState } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardFooter } from "./DashboardFooter";
import { useUserProfile } from "@/features/tourist/hooks/useApi";
import { defaultUserId, defaultUserName } from "@/features/tourist/services/userHelpers";

/**
 * Root layout shell for all dashboard pages.
 * Fetches the real user profile from the backend so the header always shows
 * the correct name.  Falls back to localStorage / "Traveler" while loading.
 */
export function DashboardLayout({ children }) {
    const [collapsed, setCollapsed] = useState(() => {
        return localStorage.getItem("sidebar-collapsed") === "true";
    });
    const handleSetCollapsed = (value) => {
        setCollapsed(value);
        localStorage.setItem("sidebar-collapsed", String(value));
    };
    const userId = defaultUserId();

    // Fetch the live user profile so the header name stays in sync with the DB.
    // TODO: When JWT auth is added, userId will come from the decoded token.
    const { data: userProfile } = useUserProfile(userId);

    // Prefer the DB name; fall back to the cached localStorage value while loading.
    const displayName = userProfile?.name || defaultUserName();

    return (
        <div className="flex h-screen w-full bg-slate-50 dark:bg-background overflow-hidden">
            <DashboardSidebar collapsed={collapsed} setCollapsed={handleSetCollapsed} />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <DashboardHeader userName={displayName} />
                <main className="flex-1 p-4 lg:p-6 space-y-6 lg:space-y-10 overflow-y-auto flex flex-col">
                    <div className="flex-1">
                        {children}
                    </div>
                    <DashboardFooter />
                </main>
            </div>
        </div>
    );
}

//Header, Footer, Sidebar ellam Layout la Varum, athu praku ella page laum varutu