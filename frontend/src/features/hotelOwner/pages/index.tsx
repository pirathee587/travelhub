import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  MapPin,
  Pencil,
  Trash2,
  Building2,
  Sparkles,
  Clock,
  CheckCircle2,
  Lock,
  Search,
  Map,
  XCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/features/hotelOwner/components/AppShell";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/common/ui/alert-dialog";
import { deleteHotel, useHotels, useHotelSummary, type Hotel, DISTRICTS } from "@/features/hotelOwner/services/hotels-store";
import { toast } from "sonner";
import { useOwnerSession } from "@/features/hotelOwner/services/owner-session";
import { OwnerStatusBanner } from "@/features/hotelOwner/components/OwnerStatusBanner";

export default function WelcomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const getInitialStatus = () => {
    const params = new URLSearchParams(location.search);
    const searchStatus = params.get("status");
    if (searchStatus === "Pending" || searchStatus === "Approved" || searchStatus === "Rejected") {
      return searchStatus;
    }
    const storedStatus = sessionStorage.getItem("travelhub:lastHotelFilterStatus");
    if (storedStatus === "Pending" || storedStatus === "Approved" || storedStatus === "Rejected") {
      sessionStorage.removeItem("travelhub:lastHotelFilterStatus");
      return storedStatus;
    }
    return "Approved";
  };

  const [filterStatus, setFilterStatus] = useState(getInitialStatus);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchStatus = params.get("status");
    if (searchStatus === "Pending" || searchStatus === "Approved" || searchStatus === "Rejected") {
      setFilterStatus(searchStatus);
    }
  }, [location.search]);

  const { session } = useOwnerSession();
  const { hotels, loading } = useHotels(filterStatus);
  const { summary, loading: summaryLoading } = useHotelSummary();
  const firstName = (session?.name || "there").split(" ")[0];
  const [toDelete, setToDelete] = useState<Hotel | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("All");

  const filteredHotels = hotels.filter((h) => {
    const name = h?.hotelName || "";
    const dist = h?.district || "";
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDistrict = selectedDistrict === "All" || dist === selectedDistrict;
    return matchesSearch && matchesDistrict;
  });

  if (loading) {
    return (
      <AppShell>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppShell>
    );
  }

  const handleDelete = () => {
    if (!toDelete) return;
    deleteHotel(toDelete.id);
    toast.success(`${toDelete.hotelName} has been removed.`);
    setToDelete(null);
  };

  return (
    <AppShell>


      {/* Header */}
      <section className="mt-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
          className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Owner workspace
        </motion.div>
        <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Welcome back, {firstName}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-balance text-[15px] leading-relaxed text-muted-foreground">
          Your portfolio at a glance. Add a new property or jump straight into managing rooms,
          amenities, and guest reviews.
        </p>

        <div className="mt-7 flex justify-center">
          <button
            onClick={() => navigate("/hotelowner/hotels/new")}
            className="group inline-flex h-11 items-center gap-2 rounded-[10px] bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:bg-[var(--color-primary-hover)] hover:shadow-lg hover:shadow-primary/30 active:scale-[0.97]"
          >
            <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" strokeWidth={2.5} />
            Add Hotel
          </button>
        </div>
      </section>

      {/* Properties */}
      <section className="mt-14">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">
              Your Properties
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {filteredHotels.length} {filteredHotels.length === 1 ? "hotel" : "hotels"} found
            </p>
          </div>

          {/* Search, Filter, and Status Toggles */}
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search hotels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full sm:w-48 rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
              />
            </div>

            {/* District Filter */}
            <div className="relative">
              <Map className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="h-9 w-full sm:w-48 appearance-none rounded-lg border border-border bg-card pl-9 pr-8 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
              >
                <option value="All">All Districts</option>
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2.5 top-2.5 text-muted-foreground">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.18179 6.18181C4.35753 6.00608 4.64245 6.00608 4.81819 6.18181L7.49999 8.86362L10.1818 6.18181C10.3575 6.00608 10.6424 6.00608 10.8182 6.18181C10.9939 6.35755 10.9939 6.64247 10.8182 6.81821L7.81819 9.81821C7.73379 9.9026 7.61934 9.95001 7.49999 9.95001C7.38064 9.95001 7.26618 9.9026 7.18179 9.81821L4.18179 6.81821C4.00605 6.64247 4.00605 6.35755 4.18179 6.18181Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
              </div>
            </div>

            {/* Status Dropdown */}
            <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1 shadow-sm h-9">
            <button
              onClick={() => setFilterStatus("Approved")}
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
                filterStatus === "Approved"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              Approved ({summary.approved})
            </button>
            <button
              onClick={() => setFilterStatus("Pending")}
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
                filterStatus === "Pending"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              Pending ({summary.pending})
            </button>
            <button
              onClick={() => setFilterStatus("Rejected")}
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
                filterStatus === "Rejected"
                  ? "bg-destructive text-destructive-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              Rejected ({summary.rejected})
            </button>
          </div>
        </div>
        </div>

        {filteredHotels.length === 0 ? (

          <EmptyState status={filterStatus} hasSearch={searchQuery !== "" || selectedDistrict !== "All"} />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filteredHotels.map((hotel, index) => (
                <motion.div
                  key={hotel.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{
                    duration: 0.45,
                    delay: index * 0.05,
                    ease: [0.2, 0.8, 0.2, 1],
                  }}
                >
                  <HotelCard hotel={hotel} onDelete={() => setToDelete(hotel)} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* Delete confirmation */}
      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Remove this property?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <span className="font-medium text-foreground">{toDelete?.hotelName}</span>? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-[10px]">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-[10px] bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

function HotelCard({ hotel, onDelete }: { hotel: Hotel; onDelete: () => void }) {
  const isPending = hotel.applicationStatus === "Pending";
  const isRejected = hotel.applicationStatus === "Rejected";
  const isSuspended = hotel.applicationStatus === "Approved" && hotel.isActive === false;
  const isLocked = isPending || isRejected || isSuspended;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
      className={`group relative overflow-hidden rounded-2xl bg-card shadow-md transition-all duration-300 ${
        isLocked ? "grayscale-[0.5]" : "hover:shadow-lg"
      }`}
    >
      <Link to={`/hotelowner/dashboard/${String(hotel.id)}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          <img
            src={hotel.images && hotel.images.length > 0 ? hotel.images[0] : "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop"}
            alt={hotel.hotelName}
            className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-[1.04]"
          />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/30 to-transparent" />
          
          {/* Status Badge */}
          <div className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm backdrop-blur ${
            isSuspended
              ? "bg-slate-950/90 text-slate-100"
              : isPending
                ? "bg-amber-50/90 text-amber-700"
                : isRejected
                  ? "bg-red-50/90 text-red-700"
                  : "bg-emerald-50/90 text-emerald-700"
          }`}>
            {isSuspended ? (
              <>
                <Lock className="h-3 w-3" />
                Suspended
              </>
            ) : isPending ? (
              <>
                <Clock className="h-3 w-3" />
                Pending Approval
              </>
            ) : isRejected ? (
              <>
                <XCircle className="h-3 w-3" />
                Rejected
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3 w-3" />
                Approved
              </>
            )}
          </div>

          <div className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-sm backdrop-blur">
            {hotel.district}
          </div>

          {isSuspended && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-center p-4">
              <div className="rounded-full border border-white/20 bg-slate-950/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-lg">
                Suspended
              </div>
            </div>
          )}

          {/* Overlay for Locked (Pending/Rejected) */}
          {isLocked && !isSuspended && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 text-center p-4 backdrop-blur-[1px] transition-opacity group-hover:opacity-0">
               <div className="rounded-full bg-white/40 p-2">
                <Lock className="h-5 w-5 text-white" />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-1.5 p-5">
          <h3 className="font-display text-lg font-semibold leading-tight text-foreground">
            {hotel.hotelName}
          </h3>
          <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
            <span className="line-clamp-1">{hotel.location}</span>
          </div>
        </div>
      </Link>

      {/* Action Buttons */}
      <div className="flex gap-2 px-5 pb-5">
        <Link to={`/hotelowner/dashboard/${String(hotel.id)}`}
          className={`flex flex-[2] items-center justify-center gap-1.5 h-9 rounded-[8px] text-xs font-semibold shadow-sm transition ${
            isLocked
              ? "bg-secondary text-foreground hover:bg-secondary/80"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          {isSuspended ? "View Suspended Dashboard" : isLocked ? "View Locked Dashboard" : "Manage Dashboard"}
        </Link>
        
        {!isLocked && (
          <Link to={`/hotelowner/hotels/${String(hotel.id)}/edit`}
            className="flex flex-[1] items-center justify-center gap-1.5 h-9 rounded-[8px] bg-secondary text-xs font-semibold text-foreground transition hover:bg-secondary/80"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onDelete();
          }}
          className="flex flex-[1] items-center justify-center gap-1.5 h-9 rounded-[8px] bg-destructive/10 text-xs font-semibold text-destructive transition hover:bg-destructive/20"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>
    </motion.div>
  );
}

function SummaryCard({
  label,
  count,
  active,
  onClick,
  tone,
}: {
  label: string;
  count: number | string;
  active: boolean;
  onClick?: () => void;
  tone?: "approved" | "pending" | "rejected";
}) {
  const toneClass =
    tone === "approved"
      ? "border-emerald-200 bg-emerald-50/50"
      : tone === "pending"
        ? "border-amber-200 bg-amber-50/50"
        : tone === "rejected"
          ? "border-red-200 bg-red-50/50"
          : "border-border bg-card";

  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`rounded-xl border p-4 text-left transition ${toneClass} ${
        active ? "ring-2 ring-primary ring-offset-2" : ""
      } ${onClick ? "hover:shadow-md cursor-pointer" : ""}`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-foreground">{count}</p>
    </Tag>
  );
}

function EmptyState({ status, hasSearch }: { status: string; hasSearch?: boolean }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/50 p-14 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Building2 className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
        {hasSearch 
          ? "No matching hotels found" 
          : status === "Pending" 
            ? "No Pending Hotels" 
            : status === "Rejected" 
              ? "No Rejected Hotels" 
              : "No Approved Hotels"}
      </h3>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
        {hasSearch 
          ? "Try adjusting your search query or district filter."
          : status === "Pending" 
            ? "You don't have any properties currently waiting for approval." 
            : status === "Rejected" 
              ? "You don't have any rejected properties." 
              : "You haven't added any properties yet. Let's set up your first hotel."}
      </p>
      {/* The top Add Hotel button already provides the primary action. */}
    </div>
  );
}
