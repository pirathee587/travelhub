import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";

export function DashboardLayout({ children, showSearch }) {
    return (
        <div className="flex min-h-screen w-full bg-background">
            <DashboardSidebar />
            <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
                <DashboardHeader userName="Harith Keshan" showSearch={showSearch} />
                <main className="flex-1 p-4 lg:p-6 space-y-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}