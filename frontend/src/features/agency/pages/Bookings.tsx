import { useState, useEffect } from 'react';
import {
  Search, Filter, Check, X, CheckCircle, Eye,
  Download, MapPin, Calendar, DollarSign, SearchX, Car,
  Users, Clock, FileText, Hotel, Package, Play, AlertTriangle,
  LayoutGrid, List, User, Sparkles,
} from 'lucide-react';
import { DashboardLayout } from '@/features/agency/components/dashboard/DashboardLayout';
import { Button } from '@/components/common/ui/button';
import { Input } from '@/components/common/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/common/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/common/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/common/ui/dialog';
import { cn } from '@/utils/utils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '@/features/agency/services/api';
import { Skeleton } from '@/components/common/ui/skeleton';
import { useCurrency } from '@/features/agency/hooks/CurrencyContext';
import { downloadBookingInvoice } from '@/features/agency/utils/invoiceGenerator';

// ── Status badge styles ───────────────────────────────────────────────────────
// Each status maps to a unique color token so the badge is instantly readable.
const statusBadge = {
  pending:     'bg-warning/10 text-warning border border-warning/20',
  confirmed:   'bg-primary/10 text-primary border border-primary/20',
  in_progress: 'bg-success/10 text-success border border-success/20',
  completed:   'bg-success/20 text-success border border-success/30',
  cancelled:   'bg-destructive/10 text-destructive border border-destructive/20',
};

// Human-readable label for each status value from the backend
const statusLabel = (status) => {
  const map = {
    pending:     'Pending',
    confirmed:   'Confirmed',
    in_progress: 'In Progress',
    completed:   'Completed',
    cancelled:   'Cancelled',
  };
  return map[status] || (status || '').replace('_', ' ');
};

// Returns true for bookings that count as "active" (confirmed = accepted but not started,
// in_progress = currently running)
const isActive = (status) =>
  status === 'confirmed' || status === 'in_progress';

// Reasons an agent can provide when declining a pending booking
const DECLINE_REASONS = [
  'No available driver for selected dates',
  'No available vehicle for selected dates',
  'Destination not covered by our agency',
  'Dates conflict with existing booking',
  'Customer request outside service area',
  'Other',
];

// Reasons an agent can provide for emergency cancellation of an accepted/active trip
const CANCEL_REASONS = [
  'Vehicle breakdown',
  'Driver unavailable due to emergency',
  'Natural disaster or road closure',
  'Customer requested cancellation',
  'Force majeure',
  'Other',
];

// ── Invoice helper ────────────────────────────────────────────────────────────
const handleDownloadInvoice = (booking, formatPrice, agencyProfile) => {
  downloadBookingInvoice(booking, formatPrice, agencyProfile);
};

/* ── Booking Details Modal ──────────────────────────────────────────────────── */
const BookingDetailsModal = ({ booking, open, onClose }) => {
  const { formatPrice } = useCurrency();
  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{booking.packageName || 'Booking Details'}</span>
            <div className="ml-auto flex items-center gap-2">
              <span className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
                statusBadge[booking.status] || statusBadge['confirmed']
              )}>
                {statusLabel(booking.status)}
              </span>
              {booking.packageType === 'MULTI_DISTRICT' ? (
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                  📦 Included
                </span>
              ) : booking.accommodationOption === 'AGENCY' ? (
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-200">
                  🏨 Agency
                </span>
              ) : booking.accommodationOption === 'SELF_ARRANGE' ? (
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                  🏠 Self-arranged
                </span>
              ) : null}
            </div>
          </DialogTitle>
          <DialogDescription>
            {booking.bookingId || `#${booking.id}`} · Booked on {booking.bookedOn ? new Date(booking.bookedOn).toLocaleDateString() : '—'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">

          {/* Trip Info */}
          <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Trip Info</p>
            <div className="grid grid-cols-2 gap-3 text-sm">

              {booking.duration && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="font-medium">{booking.duration}</p>
                  </div>
                </div>
              )}
              {booking.startDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Start Date</p>
                    <p className="font-medium">{booking.startDate}</p>
                  </div>
                </div>
              )}
              {booking.endDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">End Date</p>
                    <p className="font-medium">{booking.endDate}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tourist Details */}
          {booking.touristName && (
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tourist Info</p>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{booking.touristName}</span>
              </div>
            </div>
          )}

          {/* Passengers */}
          {(booking.adults != null || booking.children != null) && (
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Passengers</p>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Adults</p>
                    <p className="font-medium">{booking.adults ?? '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Children</p>
                    <p className="font-medium">{booking.children ?? '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Total Price</p>
                    <p className="font-medium">{formatPrice(booking.totalPrice || 0)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Hotel Preferences (Single District) */}
          {booking.packageType !== 'MULTI_DISTRICT' && booking.preferredHotels && booking.preferredHotels.length > 0 && (
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <Hotel className="h-3.5 w-3.5" /> Tourist Hotel Preferences
              </p>
              <div className="space-y-1.5 text-sm">
                {booking.preferredHotels.map((hotelStr, i) => (
                  <p key={i} className="font-medium text-foreground">{hotelStr}</p>
                ))}
              </div>
            </div>
          )}

          {/* Hotel Information (Multi District Itinerary) */}
          {booking.packageType === 'MULTI_DISTRICT' && booking.itineraryHotels && booking.itineraryHotels.length > 0 && (
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <Hotel className="h-3.5 w-3.5" /> Package Hotel Itinerary
              </p>
              <div className="space-y-1.5 text-sm">
                {booking.itineraryHotels.map((hotelStr, i) => (
                  <p key={i} className="font-medium text-foreground">{hotelStr}</p>
                ))}
              </div>
            </div>
          )}

          {/* Vehicle */}
          {(booking.vehicleModel || booking.vehicleType) && (
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Assigned Vehicle</p>
              <div className="flex items-center gap-2 text-sm">
                <Car className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{booking.vehicleModel || booking.vehicleType}</span>
                {booking.vehicleRegistration && (
                  <span className="text-muted-foreground">· {booking.vehicleRegistration}</span>
                )}
              </div>
            </div>
          )}

          {/* Special Requests */}
          {booking.specialRequests && (
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" /> Special Requests
              </p>
              <p className="text-sm text-foreground leading-relaxed">{booking.specialRequests}</p>
            </div>
          )}

        </div>

        <DialogFooter className="gap-2">
          {booking.status === 'completed' && (
            <Button variant="outline" className="gap-1.5" onClick={() => { onClose(); handleDownloadInvoice(booking, formatPrice); }}>
              <Download className="h-4 w-4" /> Download Invoice
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/* ── MAIN PAGE COMPONENT ────────────────────────────────────────────────────── */
const Bookings = () => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  // Data state
  const [bookings, setBookings]     = useState([]);
  const [loading, setLoading]       = useState(true);

  // Filters & Views
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [userChangedTab, setUserChangedTab] = useState(false);

  /* ── Intelligent Initial Tab Selection ────────────────────────────────────── */
  useEffect(() => {
    if (bookings.length > 0 && !userChangedTab) {
      const pCount = bookings.filter(b => b.status === 'pending').length;
      const aCount = bookings.filter(b => b.status === 'confirmed' || b.status === 'in_progress').length;
      if (pCount > 0) {
        setStatusFilter('pending');
      } else if (aCount > 0) {
        setStatusFilter('active');
      }
    }
  }, [bookings]);

  // Details modal state
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking]   = useState(null);

  // Accept modal state
  const [acceptModalOpen, setAcceptModalOpen]     = useState(false);
  const [acceptBookingId, setAcceptBookingId]     = useState(null);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [vehiclesLoading, setVehiclesLoading]     = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [accepting, setAccepting]                 = useState(false);

  // Decline dialog state
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [declineBookingId, setDeclineBookingId]   = useState(null);
  const [declineReason, setDeclineReason]         = useState('');
  const [customDeclineReason, setCustomDeclineReason] = useState('');

  // Start Trip confirmation dialog
  const [startDialogOpen, setStartDialogOpen]   = useState(false);
  const [startBookingId, setStartBookingId]     = useState(null);
  const [startBookingName, setStartBookingName] = useState('');

  // Complete dialog state
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [completeBookingId, setCompleteBookingId]   = useState(null);

  // Emergency cancel dialog state (for confirmed or in_progress)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelBookingId, setCancelBookingId]   = useState(null);
  const [cancelReason, setCancelReason]         = useState('');
  const [customCancelReason, setCustomCancelReason] = useState('');

  /* ── Data Fetching ────────────────────────────────────────────────────────── */
  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await api.getBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  // ── Details navigation ─────────────────────────────────────────────────────
  const handleViewDetails = (booking) => {
    navigate(`/agency/bookings/${booking.id}`);
  };

  // ── Accept flow: pending → confirmed ──────────────────────────────────────
  const handleOpenAcceptModal = async (bookingId) => {
    setAcceptBookingId(bookingId);
    setSelectedVehicleId('');
    setAcceptModalOpen(true);
    setVehiclesLoading(true);
    try {
      const data = await api.getActiveVehicles();
      setAvailableVehicles(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load vehicles');
      setAvailableVehicles([]);
    } finally {
      setVehiclesLoading(false);
    }
  };

  const handleConfirmAccept = async () => {
    if (!selectedVehicleId) return;
    setAccepting(true);
    try {
      const updated = await api.acceptBooking(acceptBookingId, Number(selectedVehicleId));
      setBookings(prev => prev.map(b => b.id === acceptBookingId ? updated : b));
      setAcceptModalOpen(false);
      setAcceptBookingId(null);
      toast.success('Booking accepted! Status is now Confirmed.');
    } catch {
      toast.error('Failed to accept booking');
    } finally {
      setAccepting(false);
    }
  };

  // ── Decline flow: pending → cancelled ─────────────────────────────────────
  const handleOpenDeclineDialog = (bookingId) => {
    setDeclineBookingId(bookingId);
    setDeclineReason('');
    setCustomDeclineReason('');
    setDeclineDialogOpen(true);
  };

  const handleConfirmDecline = async () => {
    if (!declineReason) return;
    const reason = declineReason === 'Other' ? customDeclineReason : declineReason;
    try {
      const updated = await api.declineBooking(declineBookingId, reason);
      setBookings(prev => prev.map(b => b.id === declineBookingId ? updated : b));
      setDeclineDialogOpen(false);
      setDeclineBookingId(null);
      toast.success('Booking declined. Customer has been notified.');
    } catch {
      toast.error('Failed to decline booking');
    }
  };

  // ── Start Trip flow: confirmed → in_progress ──────────────────────────────
  const handleOpenStartDialog = (booking) => {
    setStartBookingId(booking.id);
    setStartBookingName(booking.packageName || `#${booking.id}`);
    setStartDialogOpen(true);
  };

  const handleConfirmStart = async () => {
    try {
      const updated = await api.startTrip(startBookingId);
      setBookings(prev => prev.map(b => b.id === startBookingId ? updated : b));
      setStartDialogOpen(false);
      setStartBookingId(null);
      toast.success('Trip started! Status is now In Progress.');
    } catch {
      toast.error('Failed to start trip');
    }
  };

  // ── Complete Trip flow: in_progress → completed ───────────────────────────
  const handleOpenCompleteDialog = (bookingId) => {
    setCompleteBookingId(bookingId);
    setCompleteDialogOpen(true);
  };

  const handleConfirmComplete = async () => {
    try {
      const updated = await api.completeBooking(completeBookingId);
      setBookings(prev => prev.map(b => b.id === completeBookingId ? updated : b));
      setCompleteDialogOpen(false);
      setCompleteBookingId(null);
      toast.success('Trip marked as completed successfully!');
    } catch {
      toast.error('Failed to complete booking');
    }
  };

  // ── Emergency Cancel flow: confirmed/in_progress → cancelled ──────────────
  const handleOpenCancelDialog = (bookingId) => {
    setCancelBookingId(bookingId);
    setCancelReason('');
    setCustomCancelReason('');
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancelReason) return;
    const reason = cancelReason === 'Other' ? customCancelReason : cancelReason;
    try {
      const updated = await api.cancelBooking(cancelBookingId, reason);
      setBookings(prev => prev.map(b => b.id === cancelBookingId ? updated : b));
      setCancelDialogOpen(false);
      setCancelBookingId(null);
      toast.success('Booking cancelled. Customer has been notified.');
    } catch {
      toast.error('Failed to cancel booking');
    }
  };

  // ── Date-aware helpers ─────────────────────────────────────────────────────
  // Returns true if the booking's startDate is today or has already passed
  const isTripStartDue = (booking) => {
    if (!booking.startDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(booking.startDate);
    return start <= today;
  };

  // Returns true if the booking's endDate has passed
  const isTripEndPast = (booking) => {
    if (!booking.endDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(booking.endDate);
    return end < today;
  };

  // ── Smart Action Buttons (context-aware per status + date) ─────────────────
  const renderActionButtons = (booking) => {
    const { status } = booking;

    // ── PENDING: new request — view details before deciding ──────────────────
    if (status === 'pending') {
      return (
        <Button size="sm" variant="outline"
          className="gap-1 bg-warning/10 text-warning border-warning/20 hover:bg-warning/20 hover:text-warning"
          onClick={() => handleViewDetails(booking)}>
          <Eye className="h-4 w-4" />View Details
        </Button>
      );
    }

    // ── CONFIRMED: accepted, waiting for trip date ────────────────────────────
    // "Start Trip" appears only when startDate has arrived (date-aware)
    if (status === 'confirmed') {
      const startDue = isTripStartDue(booking);
      return (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline"
            className="gap-1 text-muted-foreground hover:bg-muted"
            onClick={() => handleViewDetails(booking)}>
            <Eye className="h-4 w-4" />Details
          </Button>
          {startDue ? (
            // Trip date has arrived — prominently show Start Trip
            <Button size="sm"
              className="gap-1 bg-success text-success-foreground hover:bg-success/90 animate-pulse"
              onClick={() => handleOpenStartDialog(booking)}>
              <Play className="h-4 w-4" />Start Trip
            </Button>
          ) : (
            // Trip date hasn't come yet — show dimmed label
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground px-2 py-1 rounded-md bg-muted">
              <Calendar className="h-3.5 w-3.5" />Starts {booking.startDate}
            </span>
          )}
          {/* Emergency cancel always available */}
          <Button size="sm" variant="outline"
            className="gap-1 border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => handleOpenCancelDialog(booking.id)}>
            <AlertTriangle className="h-4 w-4" />Cancel
          </Button>
        </div>
      );
    }

    // ── IN PROGRESS: trip is currently running ────────────────────────────────
    // "Complete Trip" is always available; turns more prominent when endDate is past
    if (status === 'in_progress') {
      const endPast = isTripEndPast(booking);
      return (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline"
            className="gap-1 text-muted-foreground hover:bg-muted"
            onClick={() => handleViewDetails(booking)}>
            <Eye className="h-4 w-4" />Details
          </Button>
          <Button size="sm"
            className={cn(
              'gap-1',
              endPast
                ? 'bg-success text-success-foreground hover:bg-success/90 animate-pulse'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
            onClick={() => handleOpenCompleteDialog(booking.id)}>
            <CheckCircle className="h-4 w-4" />Complete Trip
          </Button>
          {/* Emergency cancel still available during a live trip */}
          <Button size="sm" variant="outline"
            className="gap-1 border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => handleOpenCancelDialog(booking.id)}>
            <AlertTriangle className="h-4 w-4" />Cancel
          </Button>
        </div>
      );
    }

    // ── COMPLETED ─────────────────────────────────────────────────────────────
    if (status === 'completed') {
      return (
        <div className="flex gap-2">
          <Button size="sm" variant="outline"
            className="gap-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            onClick={() => handleViewDetails(booking)}>
            <Eye className="h-4 w-4" />View Details
          </Button>
          <Button size="sm" variant="outline" className="gap-1"
            onClick={() => handleDownloadInvoice(booking, formatPrice)}>
            <Download className="h-4 w-4" />Invoice
          </Button>
        </div>
      );
    }

    // ── CANCELLED / OTHER ─────────────────────────────────────────────────────
    return (
      <Button size="sm" variant="outline" className="gap-1 text-muted-foreground"
        onClick={() => handleViewDetails(booking)}>
        <Eye className="h-4 w-4" />View Details
      </Button>
    );
  };

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filteredBookings = bookings.filter(booking => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      (booking.packageName || '').toLowerCase().includes(searchLower) ||

      (booking.bookingId    || '').toLowerCase().includes(searchLower);
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' ? isActive(booking.status) : booking.status === statusFilter);
    return matchesSearch && matchesStatus;
  });

  // ── Quick stats ────────────────────────────────────────────────────────────
  const pendingCount   = bookings.filter(b => b.status === 'pending').length;
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
  const inProgressCount = bookings.filter(b => b.status === 'in_progress').length;
  const activeCount    = confirmedCount + inProgressCount;
  const completedCount = bookings.filter(b => b.status === 'completed').length;
  const cancelledCount = bookings.filter(b => b.status === 'cancelled').length;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout title="Booking Requests" subtitle="Manage and track all your travel bookings" showSearch={false}>
      <div className="space-y-6">



        {/* 2. Segmented Status Tabs & Control Bar */}
        <div className="flex flex-col gap-4 border-b border-border pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            
            {/* Segmented Pills */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 overflow-x-auto max-w-full">
              <button
                onClick={() => { setStatusFilter('all'); setUserChangedTab(true); }}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap",
                  statusFilter === 'all'
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                )}>
                All Bookings
                <span className="rounded-full bg-slate-200 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-bold">
                  {bookings.length}
                </span>
              </button>

              <button
                onClick={() => { setStatusFilter('pending'); setUserChangedTab(true); }}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap",
                  statusFilter === 'pending'
                    ? "bg-amber-500 text-white shadow-sm font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400"
                )}>
                Pending Requests
                {pendingCount > 0 ? (
                  <span className="rounded-full bg-amber-400 text-amber-950 px-2 py-0.5 text-[10px] font-extrabold animate-pulse">
                    {pendingCount}
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-200 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-bold">0</span>
                )}
              </button>

              <button
                onClick={() => { setStatusFilter('active'); setUserChangedTab(true); }}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap",
                  statusFilter === 'active'
                    ? "bg-teal-600 text-white shadow-sm font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400"
                )}>
                Active &amp; Confirmed
                <span className="rounded-full bg-slate-200 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-bold">
                  {activeCount}
                </span>
              </button>

              <button
                onClick={() => { setStatusFilter('completed'); setUserChangedTab(true); }}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap",
                  statusFilter === 'completed'
                    ? "bg-emerald-600 text-white shadow-sm font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                )}>
                Completed
                <span className="rounded-full bg-slate-200 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-bold">
                  {completedCount}
                </span>
              </button>

              <button
                onClick={() => { setStatusFilter('cancelled'); setUserChangedTab(true); }}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap",
                  statusFilter === 'cancelled'
                    ? "bg-rose-600 text-white shadow-sm font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                )}>
                Cancelled
                <span className="rounded-full bg-slate-200 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-bold">
                  {cancelledCount}
                </span>
              </button>
            </div>

            {/* Right Tools: Search */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Search bookings or guests..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full sm:w-64 pl-9 text-xs rounded-xl h-9" 
                />
              </div>
            </div>

          </div>
        </div>

        {/* 3. Booking Cards Grid */}
        {loading ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="grid grid-cols-2 gap-4 py-2 border-y border-border">
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-28" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
              {search ? <SearchX className="h-8 w-8 text-primary" /> : <Calendar className="h-8 w-8 text-primary" />}
            </div>
            <h3 className="text-xl font-bold text-foreground">
              {search
                ? 'No bookings match your search'
                : statusFilter !== 'all'
                ? `No ${statusFilter} bookings found`
                : 'No booking requests received yet'}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md">
              {search
                ? 'Try adjusting your search query or status filter.'
                : statusFilter !== 'all'
                ? 'No bookings currently match the selected status filter.'
                : 'Your tourist booking requests will appear here once travelers reserve your travel packages. Keep your packages active to attract tourist bookings!'}
            </p>
            {search && (
              <div className="mt-6 flex gap-3">
                <Button variant="outline" onClick={() => setSearch('')} className="rounded-xl">
                  Clear Search
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredBookings.map(booking => {
              // Highlight cards that need immediate attention
              const needsStartAction = booking.status === 'confirmed' && isTripStartDue(booking);
              const needsCompleteAction = booking.status === 'in_progress' && isTripEndPast(booking);
              const needsAttention = needsStartAction || needsCompleteAction;

              return (
                <div key={booking.id}
                  className={cn(
                    'flex rounded-xl border bg-card overflow-hidden transition-all hover:shadow-md',
                    needsAttention
                      ? 'border-warning/50 ring-1 ring-warning/20 hover:border-warning/70'
                      : 'border-border hover:border-primary/30'
                  )}>

                  {/* 1. Left Cover Image */}
                  <div className="relative w-28 shrink-0 bg-muted">
                    {booking.imageUrl ? (
                      <img
                        src={booking.imageUrl}
                        alt={booking.packageName || 'Package Cover'}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/15 text-muted-foreground/40">
                        <Package className="h-8 w-8" />
                      </div>
                    )}
                  </div>

                  {/* 2. Status Accent Border Strip */}
                  <div className={cn(
                    'w-1.5 shrink-0',
                    booking.status === 'pending' && 'bg-warning',
                    booking.status === 'confirmed' && 'bg-primary',
                    booking.status === 'in_progress' && 'bg-indigo-500',
                    booking.status === 'completed' && 'bg-success',
                    booking.status === 'cancelled' && 'bg-destructive'
                  )} />

                  {/* 3. Card Content Area */}
                  <div className="flex-1 p-5 flex flex-col justify-between">
                    <div>
                      {/* Attention banner for time-sensitive cards */}
                      {needsAttention && (
                        <div className={cn(
                          'mb-3 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium',
                          needsStartAction
                            ? 'bg-success/10 text-success border border-success/20'
                            : 'bg-warning/10 text-warning border border-warning/20'
                        )}>
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                          {needsStartAction
                            ? 'Trip is scheduled to start today — please confirm it has begun.'
                            : 'Trip end date has passed — please mark as completed.'}
                        </div>
                      )}

                      {/* Header: package name, tourist name, badges */}
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-bold text-foreground text-lg leading-tight">
                            {booking.packageName || 'Travel Package'}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1 font-medium">
                            {booking.touristName || 'Guest'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {booking.bookingId || `#${booking.id}`}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <div className="flex items-center gap-1.5">
                            <span className={cn(
                              'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize',
                              statusBadge[booking.status] || statusBadge['confirmed']
                            )}>
                              {statusLabel(booking.status)}
                            </span>
                            {booking.paymentStatus === 'PAID' ? (
                              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                💳 Paid
                              </span>
                            ) : booking.paymentStatus === 'REFUNDED' ? (
                              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-300">
                                🔄 Refunded
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-300">
                                ⏳ Unpaid
                              </span>
                            )}
                          </div>
                          {booking.packageType === 'MULTI_DISTRICT' ? (
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                              📦 Hotel Included
                            </span>
                          ) : booking.accommodationOption === 'AGENCY' ? (
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-200">
                              🏨 Agency
                            </span>
                          ) : booking.accommodationOption === 'SELF_ARRANGE' ? (
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                              🏠 Self-arranged
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {/* Info Chips & Allocation Badges */}
                      <div className="mt-4 space-y-2">
                        {/* Row 1: Dates & Guests */}
                        <div className="flex flex-wrap gap-2">
                          {(booking.startDate || booking.endDate) && (
                            <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100/80 dark:bg-slate-800/80 px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50">
                              <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                              <span>
                                {booking.startDate} → {booking.endDate}
                              </span>
                            </div>
                          )}
                          {(booking.adults != null || booking.children != null) && (
                            <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100/80 dark:bg-slate-800/80 px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50">
                              <Users className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                              <span>
                                {[
                                  booking.adults != null ? `${booking.adults} Adult${booking.adults !== 1 ? 's' : ''}` : null,
                                  booking.children != null && booking.children > 0 ? `${booking.children} Child${booking.children !== 1 ? 'ren' : ''}` : null,
                                ].filter(Boolean).join(' · ')}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Row 2: Driver & Vehicle Allocations (Side-by-Side) */}
                        {((booking.driverName || booking.driver) || (booking.vehicleModel || booking.vehicleType || booking.vehicle)) && (
                          <div className="flex flex-wrap items-center gap-2 pt-0.5">
                            {(booking.driverName || booking.driver) && (
                              <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                <User className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                                <span>{booking.driverName || (booking.driver ? `${booking.driver.firstName || ''} ${booking.driver.lastName || ''}`.trim() : 'Driver')}</span>
                              </div>
                            )}
                            {(booking.vehicleModel || booking.vehicleType || booking.vehicle) && (
                              <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 dark:bg-teal-950/40 px-3 py-1 text-xs font-semibold text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                                <Car className="h-3.5 w-3.5 shrink-0 text-teal-500" />
                                <span>{booking.vehicleModel || booking.vehicleType || (booking.vehicle ? `${booking.vehicle.brand || ''} ${booking.vehicle.model || ''}`.trim() : 'Vehicle')}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer: price + action buttons */}
                    <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                      <div className="text-base text-muted-foreground font-medium">
                        Total <span className="text-lg font-bold text-foreground ml-1">{formatPrice(booking.totalPrice || 0)}</span>
                      </div>
                      {renderActionButtons(booking)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─────────────────────── ALL DIALOGS ─────────────────────────────────── */}

      {/* Booking Details Modal */}
      <BookingDetailsModal
        booking={selectedBooking}
        open={detailsModalOpen}
        onClose={() => { setDetailsModalOpen(false); setSelectedBooking(null); }}
      />

      {/* Accept & Assign Vehicle Modal */}
      <Dialog open={acceptModalOpen} onOpenChange={(open) => { if (!accepting) setAcceptModalOpen(open); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-primary" />
              Accept Booking &amp; Assign Vehicle
            </DialogTitle>
            <DialogDescription>
              Select an available vehicle to assign to this booking before accepting.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            {vehiclesLoading ? (
              <p className="text-sm text-muted-foreground">Loading vehicles...</p>
            ) : availableVehicles.length === 0 ? (
              <div className="rounded-lg border border-warning/30 bg-warning/5 p-4 text-sm text-warning">
                No active vehicles available. Please add or activate a vehicle first.
              </div>
            ) : (
              <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a vehicle..." />
                </SelectTrigger>
                <SelectContent>
                  {availableVehicles.map(v => (
                    <SelectItem key={v.id} value={String(v.id)}>
                      <span className="flex items-center gap-2">
                        <Car className="h-3.5 w-3.5 text-muted-foreground" />
                        {[v.brand, v.model].filter(Boolean).join(' ')}
                        {v.registrationNumber ? ` · ${v.registrationNumber}` : ''}
                        {v.type ? ` · ${v.type}` : ''}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAcceptModalOpen(false)} disabled={accepting}>
              Cancel
            </Button>
            <Button
              disabled={!selectedVehicleId || vehiclesLoading || accepting}
              onClick={handleConfirmAccept}
              className="bg-success text-success-foreground hover:bg-success/90 gap-2">
              <Check className="h-4 w-4" />
              {accepting ? 'Accepting...' : 'Accept & Assign Vehicle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Decline Dialog */}
      <AlertDialog open={declineDialogOpen} onOpenChange={setDeclineDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Decline Booking Request</AlertDialogTitle>
            <AlertDialogDescription>
              Please select a reason for declining this booking. The customer will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-2">
            <Select value={declineReason} onValueChange={setDeclineReason}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select a reason..." /></SelectTrigger>
              <SelectContent>
                {DECLINE_REASONS.map(reason => (
                  <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {declineReason === 'Other' && (
              <Input placeholder="Enter custom reason..." value={customDeclineReason}
                onChange={e => setCustomDeclineReason(e.target.value)} className="w-full" />
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setDeclineDialogOpen(false); setDeclineReason(''); setCustomDeclineReason(''); }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={!declineReason || (declineReason === 'Other' && !customDeclineReason)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmDecline}>
              Confirm Decline
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Start Trip Confirmation Dialog */}
      <AlertDialog open={startDialogOpen} onOpenChange={setStartDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-success" />
              Confirm Trip Start
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you confirming that <strong>"{startBookingName}"</strong> has started today?
              This will change the status to <strong>In Progress</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setStartDialogOpen(false); setStartBookingId(null); }}>
              Not Yet
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-success text-success-foreground hover:bg-success/90"
              onClick={handleConfirmStart}>
              Yes, Trip Has Started
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Complete Trip Dialog */}
      <AlertDialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Trip as Completed</AlertDialogTitle>
            <AlertDialogDescription>
              Are you confirming that this trip has finished? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setCompleteDialogOpen(false); setCompleteBookingId(null); }}>
              Not Yet
            </AlertDialogCancel>
            <AlertDialogAction className="bg-success text-success-foreground hover:bg-success/90"
              onClick={handleConfirmComplete}>
              Yes, Trip Completed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Emergency Cancel Dialog (for confirmed or in_progress bookings) */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Emergency Cancellation
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel an accepted or ongoing trip. Please provide a reason —
              the customer will be notified immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-2">
            <Select value={cancelReason} onValueChange={setCancelReason}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select a reason..." /></SelectTrigger>
              <SelectContent>
                {CANCEL_REASONS.map(reason => (
                  <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {cancelReason === 'Other' && (
              <Input placeholder="Enter custom reason..." value={customCancelReason}
                onChange={e => setCustomCancelReason(e.target.value)} className="w-full" />
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setCancelDialogOpen(false); setCancelReason(''); setCustomCancelReason(''); }}>
              Go Back
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={!cancelReason || (cancelReason === 'Other' && !customCancelReason)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmCancel}>
              Confirm Cancellation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </DashboardLayout>
  );
};

export default Bookings;
