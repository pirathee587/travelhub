import { Search, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

type DashboardHeaderProps = {
  roomSearch: string;
  onRoomSearchChange: (value: string) => void;
  hotelName?: string;
};

const DashboardHeader = ({
  roomSearch,
  onRoomSearchChange,
  hotelName,
}: DashboardHeaderProps) => {
  return (
    <header className="w-full px-6 py-5 md:px-10 border-b border-border">
      {/* Back link */}
      <div className="mb-4">
        <Link
          to="/"
          className="group inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <svg
            className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to My Hotels
        </Link>
      </div>

      {/* Main header row */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            {hotelName ? `Managing — ${hotelName}` : "Manage Your Property"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Rooms, amenities &amp; guest feedback in one place
          </p>
        </div>

        <div className="relative w-full max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search rooms…"
            className="w-full rounded-lg border border-border bg-card pl-11 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
            value={roomSearch}
            onChange={(e) => onRoomSearchChange(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background block" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full">
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
