import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardFooter } from "./DashboardFooter";
import { useUserProfile } from "@tourist/hooks/useApi";
import { defaultUserName } from "@tourist/lib/userHelpers";
import { ChatbotButton } from "@tourist/components/ChatbotButton";
import { useAuth } from "@shared/auth/AuthContext";

/**
 * Root layout shell for all dashboard pages.
 * Fetches the real user profile from the backend so the header always shows
 * the correct name. Falls back to localStorage / "Traveler" while loading.
 *
 * Also scopes the tourist color theme (.theme-tourist) and renders the
 * chatbot button, so both are only ever present on tourist pages.
 */
export function DashboardLayout({ children }) {
    const { user } = useAuth();
    const userId = user?.id;

    // Fetch the live user profile so the header name stays in sync with the DB.
    const { data: userProfile } = useUserProfile(userId);

    // Prefer the DB name; fall back to the cached localStorage value while loading.
    const displayName = userProfile?.name || user?.name || defaultUserName();

    return (
        <div className="theme-tourist flex min-h-screen w-full bg-slate-50 dark:bg-background overflow-x-hidden">
            <DashboardSidebar />
            <div className="flex-1 flex flex-col min-h-screen lg:ml-64 overflow-x-hidden">
                <DashboardHeader userName={displayName} />
                <main className="flex-1 p-4 lg:p-6 space-y-6 lg:space-y-10 overflow-y-auto flex flex-col">
                    <div className="flex-1">
                        {children}
                    </div>
                    <DashboardFooter />
                </main>
            </div>
            <ChatbotButton />
        </div>
    );
}

//Header, Footer, Sidebar ellam Layout la Varum, athu praku ella page laum varutu