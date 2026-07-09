import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronDown, LayoutDashboard, LogOut, Plane, Settings as SettingsIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { type ReactNode } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/common/ui/dropdown-menu";
import { getInitials, useProfile } from "@/features/hotelOwner/services/profile-store";
import { useOwnerSession } from "@/features/hotelOwner/services/owner-session";
import { isUsingMockAuth, MOCK_USER_ID } from "@/features/hotelOwner/services/mock-auth";
import { NotificationBell } from "@/features/hotelOwner/components/NotificationBell";

const nav = [
  { label: "Dashboard", to: "/hotelowner" as const, icon: LayoutDashboard, exact: true },
];

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="min-h-screen w-full bg-background text-foreground antialiased">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Plane className="h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <p className="font-display text-lg font-bold tracking-tight text-white">
              TravelHUB
            </p>
            <p className="text-[11px] font-medium uppercase tracking-wider text-white/40">
              Owner Suite
            </p>
          </div>
        </div>

        <nav className="mt-2 flex-1 px-3">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-white/40">
            Workspace
          </p>
          <ul className="space-y-1">
            {nav.map((item) => {
              const isActive = item.exact ? path === item.to : path.startsWith(item.to);
              return (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? "bg-sidebar-active text-white"
                        : "text-white/60 hover:bg-sidebar-active/60 hover:text-white"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="sidebar-active-bar"
                        className="absolute inset-y-1.5 left-0 w-1 rounded-r-full bg-primary"
                      />
                    )}
                    <item.icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="px-6 pb-6 text-[11px] text-white/30">
          © {new Date().getFullYear()} TravelHUB
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-sidebar px-5 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Plane className="h-4 w-4" />
          </div>
          <p className="font-display font-bold text-white">TravelHUB</p>
        </div>
        <ProfileMenu compact />
      </header>

      {/* Main */}
      <main className="lg:pl-[260px]">
        {/* Desktop top bar with profile */}
        <div className="sticky top-0 z-20 hidden h-16 items-center justify-end border-b border-border bg-background/80 px-8 backdrop-blur-md lg:flex lg:px-10 gap-3">
          <NotificationBell />
          <ProfileMenu />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
          className="mx-auto w-full max-w-[1200px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}

export function OwnerSessionChip() {
  const { session } = useOwnerSession();
  if (!session) return null;

  const activeOk = session.isActive !== false;
  const approvedOk = session.isApproved;

  return (
    <div className="mx-3 mb-4 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-[11px] text-white/70">
      <p className="font-semibold text-white/90">
        {isUsingMockAuth() ? `Testing: Owner #${MOCK_USER_ID}` : session.name}
      </p>
      <p className="mt-1">
        Approval:{" "}
        <span className={approvedOk ? "text-emerald-300" : "text-amber-300"}>
          {approvedOk ? "ACTIVE" : session.status}
        </span>
      </p>
      <p>
        Account:{" "}
        <span className={activeOk ? "text-emerald-300" : "text-red-300"}>
          {activeOk ? "Active" : "Inactive"}
        </span>
      </p>
    </div>
  );
}

function ProfileMenu({ compact = false }: { compact?: boolean }) {
  const profile = useProfile();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const initials = getInitials(profile.name);

  const handleLogout = () => {
    logout();
    toast.success("You have been signed out.");
    navigate("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={`group inline-flex items-center gap-2.5 rounded-full outline-none transition focus-visible:ring-2 focus-visible:ring-primary/40 ${
          compact
            ? ""
            : "rounded-full border border-border bg-card py-1 pl-1 pr-3 shadow-sm hover:shadow-md"
        }`}
        aria-label="Open profile menu"
      >
        {profile.avatar ? (
          <img
            src={profile.avatar}
            alt={profile.name}
            className={`rounded-full object-cover ring-1 ring-border ${
              compact ? "h-8 w-8" : "h-9 w-9"
            }`}
          />
        ) : (
          <div
            className={`flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 font-semibold text-white ${
              compact ? "h-8 w-8 text-xs" : "h-9 w-9 text-sm"
            }`}
          >
            {initials}
          </div>
        )}
        {!compact && (
          <>
            <div className="hidden text-left sm:block">
              <p className="truncate text-sm font-semibold leading-tight text-foreground">
                {profile.name}
              </p>
              <p className="truncate text-[11px] leading-tight text-muted-foreground">
                Hotel Owner
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 rounded-xl border border-border p-1.5 shadow-lg"
      >
        <div className="px-2.5 py-2">
          <p className="truncate text-sm font-semibold text-foreground">{profile.name}</p>
          <p className="truncate text-xs text-muted-foreground">{profile.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="rounded-[8px] py-2 text-sm">
          <Link to="/hotelowner/settings" className="flex items-center gap-2.5">
            <SettingsIcon className="h-4 w-4 text-muted-foreground" />
            Profile Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(e: Event) => {
            e.preventDefault();
            handleLogout();
          }}
          className="rounded-[8px] py-2 text-sm text-destructive focus:bg-destructive/10 focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}