import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/features/agency/components/dashboard/DashboardLayout';
import { Button } from '@/components/common/ui/button';
import {
  MapPin, Calendar, Car, User, Users, ArrowLeft,
  Download, Package, CheckCircle, Circle, CreditCard,
  Clock, Hotel, Hash, Baby, MessageSquare, Check, X, Mail, Phone,
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/common/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/common/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/common/ui/select';
import { cn } from '@/utils/utils';
import { toast } from 'sonner';
import { api } from '@/features/agency/services/api';
import { useCurrency } from '@/features/agency/hooks/CurrencyContext';

// ── Status badge styles ────────────────────────────────────────
const statusBadge = {
  pending: 'bg-warning/10 text-warning border border-warning/20',
  confirmed: 'bg-primary/10 text-primary border border-primary/20',
  in_progress: 'bg-primary/10 text-primary border border-primary/20',
  completed: 'bg-success/10 text-success border border-success/20',
  cancelled: 'bg-destructive/10 text-destructive border border-destructive/20',
};

const isActive = (status) =>
  status === 'active' || status === 'In_progress' ||
  status === 'in_progress' || status === 'confirmed';

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

// ── Invoice generator ──────────────────────────────────────────
const handleDownloadInvoice = (booking, formatPrice) => {
  const invoiceHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Invoice - ${booking.bookingId || booking.id}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; color: #1a1a2e; padding: 48px; background: #fff; }
        .invoice-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #0d9488; padding-bottom: 24px; margin-bottom: 32px; }
        .brand h1 { font-size: 22px; font-weight: 700; color: #0d9488; }
        .brand p { font-size: 12px; color: #64748b; margin-top: 4px; }
        .invoice-title { text-align: right; }
        .invoice-title h2 { font-size: 28px; font-weight: 700; color: #0d9488; letter-spacing: 2px; }
        .invoice-title p { font-size: 13px; color: #64748b; margin-top: 4px; }
        .section { margin-bottom: 28px; }
        .section-title { font-size: 14px; font-weight: 700; color: #0d9488; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 32px; }
        .field label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
        .field p { font-size: 14px; font-weight: 500; margin-top: 2px; }
        .payment-box { background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 8px; padding: 20px; display: flex; justify-content: space-between; align-items: center; }
        .payment-box .amount { font-size: 28px; font-weight: 700; color: #0d9488; }
        .payment-box .status { background: #0d9488; color: #fff; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .footer { margin-top: 48px; text-align: center; padding-top: 24px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 13px; }
        @media print { body { padding: 24px; } @page { margin: 0.5in; } }
      </style>
    </head>
    <body>
      <div class="invoice-header">
        <div class="brand"><h1>Sri Lanka Travel Experts</h1><p>Premium Travel &amp; Tour Services</p></div>
        <div class="invoice-title">
          <h2>OFFICIAL INVOICE</h2>
          <p>Booking ID: ${booking.bookingId || booking.id}</p>
          <p>Issue Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>
      <div class="section">
        <div class="section-title">Trip Details</div>
        <div class="grid">
          <div class="field"><label>Package</label><p>${booking.packageName || '-'}</p></div>

          <div class="field"><label>Start Date</label><p>${booking.startDate || '-'}</p></div>
          <div class="field"><label>End Date</label><p>${booking.endDate || '-'}</p></div>
        </div>
      </div>
      <div class="section">
        <div class="section-title">Tourist Information</div>
        <div class="grid">
          <div class="field"><label>Name</label><p>${booking.touristName || '-'}</p></div>
          <div class="field"><label>Email</label><p>${booking.touristEmail || '-'}</p></div>
          <div class="field"><label>Adults</label><p>${booking.adults || 0}</p></div>
          <div class="field"><label>Children</label><p>${booking.children || 0}</p></div>
        </div>
      </div>
      <div class="section">
        <div class="section-title">Payment</div>
        <div class="payment-box">
          <div>
            <div style="font-size:12px;color:#64748b;margin-bottom:4px;">Total Amount</div>
            <div class="amount">${formatPrice(booking.totalPrice || 0)}</div>
          </div>
          <div class="status">Paid</div>
        </div>
      </div>
      <div class="footer"><p>Thank you for choosing Sri Lanka Travel Experts</p></div>
    </body>
    </html>`;
  const printWindow = window.open('', '_blank', 'width=800,height=900');
  printWindow.document.write(invoiceHTML);
  printWindow.document.close();
  printWindow.onload = () => printWindow.print();
  toast.success('Invoice downloaded successfully');
};

// ── Timeline ───────────────────────────────────────────────────
const getTimelineSteps = (status) => {
  const steps = [
    { label: 'Booking Requested' },
    { label: 'Booking Accepted' },
    { label: 'Trip Started' },
    { label: 'Trip Completed' },
  ];
  const statusIndex = { pending: 0, confirmed: 1, in_progress: 2, completed: 3, cancelled: 0 };
  const reached = statusIndex[status] ?? (isActive(status) ? 2 : 0);
  return steps.map((step, i) => ({ ...step, completed: i <= reached }));
};

// ── Info field helper ──────────────────────────────────────────
const Field = ({ label, value, icon: Icon, className = '' }) => (
  <div className={cn('space-y-1', className)}>
    <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
    <div className="flex items-center gap-2">
      {Icon && <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />}
      <p className="font-medium text-foreground">{value || <span className="text-muted-foreground/60 italic">—</span>}</p>
    </div>
  </div>
);

// ── Main component ─────────────────────────────────────────────
const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [preferredHotels, setPreferredHotels] = useState([]);
  const [preferredHotelsLoading, setPreferredHotelsLoading] = useState(false);

  // ── Shared resource lists ──────────────────────────────────────
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [resourcesLoaded, setResourcesLoaded] = useState(false);

  // ── Assign Vehicle state ───────────────────────────────────────
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [assigningVehicle, setAssigningVehicle] = useState(false);

  // ── Assign Driver state ────────────────────────────────────────
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [assigningDriver, setAssigningDriver] = useState(false);

  // ── Decline state ──────────────────────────────────────────────
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [customDeclineReason, setCustomDeclineReason] = useState('');

  useEffect(() => {
    const fetchBooking = async () => {
      setLoading(true);
      try {
        const data = await api.getBookingById(id);
        if (!data || data.error) {
          setNotFound(true);
        } else {
          setBooking(data);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  useEffect(() => {
    if (booking && booking.hotelIdsWithPreference) {
      const fetchPreferredHotels = async () => {
        setPreferredHotelsLoading(true);
        try {
          const parsed = JSON.parse(booking.hotelIdsWithPreference);
          const ids = parsed.hotelIds || [];
          const details = await Promise.all(
            ids.map(id => fetch(`http://localhost:8082/api/hotels/${id}`).then(r => r.json()))
          );
          setPreferredHotels(details.filter(h => h && h.id));
        } catch (err) {
          console.error('Failed to load preferred hotels:', err);
        } finally {
          setPreferredHotelsLoading(false);
        }
      };
      fetchPreferredHotels();
    } else {
      setPreferredHotels([]);
    }
  }, [booking]);

  // Load vehicles + drivers once (lazy, on first need)
  const loadResources = async () => {
    if (resourcesLoaded) return;
    try {
      const [vehicles, drivers] = await Promise.all([
        api.getActiveVehicles(),
        api.getDrivers(),
      ]);
      setAvailableVehicles(Array.isArray(vehicles) ? vehicles : []);
      setAvailableDrivers(Array.isArray(drivers) ? drivers : []);
      setResourcesLoaded(true);
    } catch {
      // fail silently — dropdowns just show empty
    }
  };

  // ── Simple Accept: just confirms the booking ───────────────────
  const handleAccept = async () => {
    try {
      const updated = await api.acceptBooking(booking.id);
      setBooking(updated);
      toast.success('Booking accepted! Status is now Confirmed.');
    } catch {
      toast.error('Failed to accept booking');
    }
  };

  // ── Assign Vehicle ─────────────────────────────────────────────
  const handleAssignVehicle = async () => {
    if (!selectedVehicleId) return;
    setAssigningVehicle(true);
    try {
      const updated = await api.assignVehicle(booking.id, Number(selectedVehicleId));
      setBooking(updated);
      setSelectedVehicleId('');
      toast.success('Vehicle assigned successfully!');
    } catch {
      toast.error('Failed to assign vehicle');
    } finally {
      setAssigningVehicle(false);
    }
  };

  // ── Assign Driver ──────────────────────────────────────────────
  const handleAssignDriver = async () => {
    if (!selectedDriverId) return;
    setAssigningDriver(true);
    try {
      const updated = await api.assignDriver(booking.id, Number(selectedDriverId));
      setBooking(updated);
      setSelectedDriverId('');
      toast.success('Driver assigned successfully!');
    } catch {
      toast.error('Failed to assign driver');
    } finally {
      setAssigningDriver(false);
    }
  };

  // ── Decline handlers ───────────────────────────────────────────
  const handleConfirmDecline = async () => {
    if (!declineReason) return;
    const reason = declineReason === 'Other' ? customDeclineReason : declineReason;
    try {
      const updated = await api.declineBooking(booking.id, reason);
      setBooking(updated);
      setDeclineDialogOpen(false);
      toast.success('Booking declined. Customer has been notified.');
    } catch {
      toast.error('Failed to decline booking');
    }
  };

  // ── Loading ────────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout title="Booking Details" showSearch={false}>
        <div className="flex items-center justify-center py-16">
          <p className="text-muted-foreground">Loading booking details...</p>
        </div>
      </DashboardLayout>
    );
  }

  // ── Not found ──────────────────────────────────────────────
  if (notFound || !booking) {
    return (
      <DashboardLayout title="Booking Details" showSearch={false}>
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-2xl font-bold">Booking not found</h2>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/agency/bookings')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Bookings
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // ── Derived values ─────────────────────────────────────────
  const timeline = getTimelineSteps(booking.status);
  const isPaid = booking.status === 'completed' || isActive(booking.status);

  const duration = (() => {
    if (booking.duration) return `${booking.duration} days`;
    if (booking.startDate && booking.endDate) {
      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      const days = Math.round((end - start) / 86400000);
      return isNaN(days) ? '—' : `${days} day${days !== 1 ? 's' : ''}`;
    }
    return null;
  })();

  const vehicleLabel = (() => {
    if (!booking.vehicle && !booking.vehicleModel) return null;
    const v = booking.vehicle || {};
    const parts = [
      v.brand || booking.vehicleBrand,
      v.model || booking.vehicleModel,
    ].filter(Boolean);
    const reg = v.registrationNumber || booking.vehicleRegistration;
    return parts.length ? `${parts.join(' ')}${reg ? ` · ${reg}` : ''}` : reg || null;
  })();

  return (
    <DashboardLayout
      title={`Booking ${booking.bookingId || `#${id}`}`}
      subtitle="View complete booking information"
      showSearch={false}>
      <div className="space-y-6">

        {/* Back + status badge + pending actions */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" className="gap-2" onClick={() => navigate('/agency/bookings')}>
            <ArrowLeft className="h-4 w-4" /> Back to List
          </Button>
          <div className="flex items-center gap-3">
            {/* Accept / Decline shown only for pending bookings */}
            {booking.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => { setDeclineReason(''); setCustomDeclineReason(''); setDeclineDialogOpen(true); }}>
                  <X className="h-4 w-4" /> Decline
                </Button>
                <Button
                  size="sm"
                  className="gap-1.5 bg-success text-success-foreground hover:bg-success/90"
                  onClick={handleAccept}>
                  <Check className="h-4 w-4" /> Accept Booking
                </Button>
              </>
            )}
            <span className={cn(
              'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize',
              statusBadge[booking.status] || statusBadge['confirmed']
            )}>
              {statusLabel(booking.status)}
            </span>
            {booking.packageType === 'MULTI_DISTRICT' ? (
              <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                📦 Included
              </span>
            ) : booking.accommodationOption === 'AGENCY' ? (
              <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200">
                🏨 Agency
              </span>
            ) : booking.accommodationOption === 'SELF_ARRANGE' ? (
              <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                🏠 Self-arranged
              </span>
            ) : null}
          </div>
        </div>

        {/* Booking ID banner */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Booking ID</p>
              <p className="text-2xl font-bold text-foreground">{booking.bookingId || `#${id}`}</p>
            </div>
            {booking.packageName && (
              <div className="flex items-center gap-2 text-right">
                <Package className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Package</p>
                  <p className="font-semibold text-foreground">{booking.packageName}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* ── Left / main column ──────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Trip Details */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                <MapPin className="h-5 w-5 text-primary" />
                Trip Details
              </h3>
              <div className="grid gap-6 sm:grid-cols-2">

                <Field label="Package Name" value={booking.packageName} icon={Package} />
                <Field label="Start Date" value={booking.startDate} icon={Calendar} />
                <Field label="End Date" value={booking.endDate} icon={Calendar} />
                {duration && <Field label="Duration" value={duration} icon={Clock} />}
              </div>
            </div>

            {/* Tourist Contact Info */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                <User className="h-5 w-5 text-primary" />
                Tourist Information
              </h3>
              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Name" value={booking.touristName} icon={User} />
                <Field label="Email" value={booking.touristEmail} icon={Mail} />
                <Field label="Phone" value={booking.touristPhone} icon={Phone} />
              </div>
            </div>

            {/* Passengers */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                <Users className="h-5 w-5 text-primary" />
                Passengers
              </h3>
              <div className="grid gap-6 sm:grid-cols-2">
                {(booking.adults == null && booking.children == null) ? (
                  <p className="text-sm text-muted-foreground italic">No passenger details specified.</p>
                ) : (
                  <>
                    <Field label="Adults" value={`${booking.adults || 0} adult${booking.adults !== 1 ? 's' : ''}`} icon={User} />
                    <Field label="Children" value={`${booking.children || 0} child${booking.children !== 1 ? 'ren' : ''}`} icon={Baby} />
                  </>
                )}
              </div>
            </div>

            {/* Special Requests */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                <MessageSquare className="h-5 w-5 text-primary" />
                Special Requests
              </h3>
              <p className={cn("text-sm leading-relaxed", !booking.specialRequests && "text-muted-foreground italic")}>
                {booking.specialRequests || "No special requests specified."}
              </p>
            </div>

            {/* Hotel Information */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                <Hotel className="h-5 w-5 text-primary" />
                Hotel Information
              </h3>

              {booking.packageType === 'MULTI_DISTRICT' ? (
                <div className="space-y-2">
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                    📦 Included in Package
                  </span>
                  <p className="text-sm text-muted-foreground mt-2">
                    Accommodation is pre-arranged by the agency and built directly into the package. Please refer to the daily itinerary details to see the hotels selected for each day.
                  </p>
                </div>
              ) : booking.accommodationOption === 'SELF_ARRANGE' ? (
                <div className="space-y-2">
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                    🏠 Self-arranged
                  </span>
                  <p className="text-sm text-muted-foreground mt-2">
                    The tourist has chosen to manage their own accommodation. No booking action is required from the agent.
                  </p>
                </div>
              ) : (booking.accommodationOption === 'AGENCY' || booking.hotelIdsWithPreference) ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-200">
                      🏨 Agency Selected Preferences
                    </span>
                    <span className="text-xs text-muted-foreground">Ranked by Priority</span>
                  </div>

                  {preferredHotelsLoading ? (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="h-3 w-3 animate-spin rounded-full border border-primary border-t-transparent" />
                      Loading preferred hotels...
                    </div>
                  ) : preferredHotels.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {preferredHotels.map((hotel, index) => (
                        <div key={hotel.id} className="relative border rounded-lg p-3 bg-muted/10 flex flex-col gap-2 hover:border-primary/30 transition-colors">
                          <span className="absolute top-2 left-2 flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold shadow-sm">
                            {index + 1}
                          </span>
                          {hotel.imageUrl ? (
                            <img src={hotel.imageUrl} alt={hotel.hotelName} className="h-24 w-full object-cover rounded border" />
                          ) : (
                            <div className="h-24 w-full bg-muted rounded border flex items-center justify-center text-xs">🏨</div>
                          )}
                          <div>
                            <p className="font-semibold text-xs text-foreground truncate">{hotel.hotelName}</p>
                            <p className="text-[10px] text-muted-foreground">{hotel.starRating}-Star · {hotel.district}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No hotel preferences fetched.</p>
                  )}

                  <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200/50 p-2.5 rounded-lg">
                    ⚠️ Tourist must pay for the accommodation externally. Hotel cost is not included in the package booking total.
                  </p>
                </div>
              ) : (
                (!booking.hotelName && !booking.hotelPreferences) ? (
                  <p className="text-sm text-muted-foreground italic">No hotel details specified.</p>
                ) : (
                  <>
                    {booking.hotelName && (
                      <div className="mb-4 grid gap-6 sm:grid-cols-2">
                        <Field label="Hotel Name" value={booking.hotelName} icon={Hotel} />
                        {booking.hotelLocation && (
                          <Field label="Location" value={booking.hotelLocation} icon={MapPin} />
                        )}
                      </div>
                    )}
                    {booking.hotelPreferences && (
                      <p className="text-sm text-foreground leading-relaxed">{booking.hotelPreferences}</p>
                    )}
                  </>
                )
              )}
            </div>

            {/* Assigned Vehicle */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                <Car className="h-5 w-5 text-primary" />
                Assigned Vehicle
              </h3>
              {!vehicleLabel && !(booking.vehicle?.type || booking.vehicleType) ? (
                booking.status !== 'cancelled' && booking.status !== 'completed' ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground italic">No vehicle assigned yet.</p>
                    <div className="flex gap-2 items-center">
                      <Select
                        value={selectedVehicleId}
                        onValueChange={setSelectedVehicleId}
                        onOpenChange={(open) => { if (open) loadResources(); }}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select a vehicle…" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableVehicles.map(v => (
                            <SelectItem key={v.id} value={String(v.id)}>
                              {v.brand} {v.model} · {v.registrationNumber}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        onClick={handleAssignVehicle}
                        disabled={!selectedVehicleId || assigningVehicle}>
                        {assigningVehicle ? 'Assigning…' : 'Assign'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No vehicle assigned.</p>
                )
              ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                  {vehicleLabel && <Field label="Vehicle" value={vehicleLabel} icon={Car} />}
                  {(booking.vehicle?.type || booking.vehicleType) && (
                    <Field label="Type" value={booking.vehicle?.type || booking.vehicleType} icon={Hash} />
                  )}
                </div>
              )}
            </div>

            {/* Assigned Driver */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                <User className="h-5 w-5 text-primary" />
                Assigned Driver
              </h3>
              {!booking.driverName ? (
                booking.status !== 'cancelled' && booking.status !== 'completed' ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground italic">No driver assigned yet.</p>
                    <div className="flex gap-2 items-center">
                      <Select
                        value={selectedDriverId}
                        onValueChange={setSelectedDriverId}
                        onOpenChange={(open) => { if (open) loadResources(); }}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select a driver…" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableDrivers.map(d => (
                            <SelectItem key={d.id} value={String(d.id)}>
                              {d.firstName} {d.lastName || ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        onClick={handleAssignDriver}
                        disabled={!selectedDriverId || assigningDriver}>
                        {assigningDriver ? 'Assigning…' : 'Assign'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No driver assigned.</p>
                )
              ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field label="Driver Name" value={booking.driverName} icon={User} />
                  {booking.driverPhone && (
                    <Field label="Phone" value={booking.driverPhone} icon={MessageSquare} />
                  )}
                  {booking.driverRating && (
                    <Field label="Rating" value={`${booking.driverRating} ⭐`} icon={CheckCircle} />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Right sidebar ────────────────────────────────── */}
          <div className="space-y-6">

            {/* Booking Timeline */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-6 text-lg font-semibold text-foreground">Booking Timeline</h3>
              <div className="relative space-y-0">
                {timeline.map((step, i) => (
                  <div key={step.label} className="relative flex gap-4 pb-8 last:pb-0">
                    {i < timeline.length - 1 && (
                      <div className={cn(
                        'absolute left-[11px] top-6 h-full w-0.5',
                        step.completed && timeline[i + 1]?.completed ? 'bg-primary' : 'bg-border'
                      )} />
                    )}
                    <div className="relative z-10 flex-shrink-0">
                      {step.completed
                        ? <CheckCircle className="h-6 w-6 text-primary" />
                        : <Circle className="h-6 w-6 text-muted-foreground/40" />}
                    </div>
                    <div className="pt-0.5">
                      <p className={cn('text-sm font-medium', step.completed ? 'text-foreground' : 'text-muted-foreground')}>
                        {step.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                <CreditCard className="h-5 w-5 text-primary" />
                Payment
              </h3>
              <div className="space-y-4">
                {(booking.basePriceAdult || booking.basePriceChild) && (
                  <div className="space-y-2 border-b border-border pb-4 mb-4">
                    {booking.adults > 0 && booking.basePriceAdult && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Adults ({booking.adults} &times; {formatPrice(booking.basePriceAdult)})</span>
                        <span className="font-medium">{formatPrice(booking.adults * booking.basePriceAdult)}</span>
                      </div>
                    )}
                    {booking.children > 0 && booking.basePriceChild && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Children ({booking.children} &times; {formatPrice(booking.basePriceChild)})</span>
                        <span className="font-medium">{formatPrice(booking.children * booking.basePriceChild)}</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Total Price</span>
                  <span className="text-2xl font-bold text-foreground">
                    {formatPrice(booking.totalPrice || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className={cn(
                    'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
                    booking.status === 'cancelled'
                      ? 'bg-destructive/10 text-destructive border border-destructive/30'
                      : isPaid
                        ? 'bg-success/10 text-success border border-success/30'
                        : 'bg-warning/10 text-warning border border-warning/30'
                  )}>
                    {booking.status === 'cancelled' ? 'Cancelled' : isPaid ? 'Paid' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            {/* Download Invoice (completed only) */}
            {booking.status === 'completed' && (
              <Button className="w-full gap-2" variant="outline"
                onClick={() => handleDownloadInvoice(booking, formatPrice)}>
                <Download className="h-4 w-4" />
                Download Invoice
              </Button>
            )}
          </div>
        </div>


        {/* ── Decline Booking Dialog ───────────────────────────────────── */}
        <AlertDialog open={declineDialogOpen} onOpenChange={setDeclineDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Decline Booking</AlertDialogTitle>
              <AlertDialogDescription>
                Please select a reason for declining this booking. The customer will be notified.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-2 space-y-3">
              <Select value={declineReason} onValueChange={setDeclineReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Unavailable dates">Unavailable dates</SelectItem>
                  <SelectItem value="Package no longer available">Package no longer available</SelectItem>
                  <SelectItem value="Insufficient passengers">Insufficient passengers</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {declineReason === 'Other' && (
                <textarea
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground resize-none"
                  rows={3}
                  placeholder="Enter custom reason…"
                  value={customDeclineReason}
                  onChange={e => setCustomDeclineReason(e.target.value)}
                />
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => { setDeclineDialogOpen(false); setDeclineReason(''); setCustomDeclineReason(''); }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={!declineReason || (declineReason === 'Other' && !customDeclineReason)}
                onClick={handleConfirmDecline}>
                Confirm Decline
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default BookingDetails;
