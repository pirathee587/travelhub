import { Bell } from "lucide-react";

const FloatingDock = () => {
  return (
    <div className="fixed bottom-6 right-6 flex items-center gap-3 z-50">
      {/* Notification bell */}
      <button className="relative flex h-12 w-12 items-center justify-center rounded-full bg-card shadow-card-hover border border-border hover:scale-105 transition-transform">
        <Bell className="h-5 w-5 text-card-foreground" />
        <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-notification text-[10px] font-bold text-primary-foreground">
          3
        </span>
      </button>

      {/* Profile */}
      <div className="flex items-center gap-3 rounded-full bg-card shadow-card-hover border border-border pl-3 pr-5 py-2 hover:scale-[1.02] transition-transform cursor-pointer">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
          HK
        </div>
        <span className="text-sm font-medium text-card-foreground whitespace-nowrap">Harith Keshan</span>
      </div>
    </div>
  );
};

export default FloatingDock;
