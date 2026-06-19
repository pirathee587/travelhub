import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardFooter } from "./DashboardFooter";
import { ChatbotButton } from "@/components/ChatbotButton";

export function DashboardLayout({ children }) {
    return (
        <div className="flex min-h-screen w-full bg-background overflow-x-hidden">
            <DashboardSidebar />
            <div className="flex-1 flex flex-col min-h-screen lg:ml-64 overflow-x-hidden">
                <DashboardHeader userName="Harith Keshan" />
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