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
const getTimelineSteps = (booking) => {
  if (!booking) return [];
  const status = booking.status;
  
  // Calculate total days
  let totalDays = 1;
  if (booking.startDate && booking.endDate) {
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    totalDays = diffDays > 0 ? diffDays : 1;
  } else if (booking.duration) {
    const num = parseInt(booking.duration, 10);
    if (!isNaN(num)) totalDays = num;
  }

  // Calculate completed days based on today's date if in progress
  let completedDays = 0;
  if (status === 'completed') {
    completedDays = totalDays;
  } else if (status === 'in_progress' || status === 'In_progress' || status === 'active') {
    if (booking.startDate) {
      const today = new Date();
      const start = new Date(booking.startDate);
      // Strip times
      today.setHours(0, 0, 0, 0);
      start.setHours(0, 0, 0, 0);
      
      const diffTime = today - start;
      const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (daysPassed >= 0) {
        completedDays = Math.min(daysPassed, totalDays);
      }
    }
  }

  const steps = [
    { label: 'Booking Requested', completed: true },
    { label: 'Booking Accepted', completed: status !== 'pending' && status !== 'cancelled' },
    { label: 'Trip Started', completed: status === 'in_progress' || status === 'In_progress' || status === 'active' || status === 'completed' },
  ];

  // Add dynamic day steps
  for (let d = 1; d <= totalDays; d++) {
    steps.push({
      label: `Day ${d} Completed`,
      completed: completedDays >= d
    });
  }

  steps.push({
    label: 'Trip Completed',
    completed: status === 'completed'
  });

  return steps;
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

  // ── Temp Vehicle & Driver selection (pending bookings only) ─────
  const [tempVehicle, setTempVehicle] = useState(null);
  const [tempDriver, setTempDriver] = useState(null);
  const [isEditingVehicle, setIsEditingVehicle] = useState(false);
  const [isEditingDriver, setIsEditingDriver] = useState(false);

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



  // Load vehicles + drivers once (lazy, on first need)
  const loadResources = async () => {
    if (resourcesLoaded) return;
    try {
      const [vehicles, drivers] = await Promise.all([
        api.getActiveVehicles(booking?.startDate, booking?.endDate),
        api.getDrivers(booking?.startDate, booking?.endDate),
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
    const hasVehicle = tempVehicle || vehicleLabel || booking.vehicle?.type || booking.vehicleType;
    const hasDriver = tempDriver || booking.driverName;

    if (!hasVehicle && !hasDriver) {
      toast.error('Please assign both a vehicle and a driver before accepting the booking.');
      return;
    }
    if (!hasVehicle) {
      toast.error('Please assign a vehicle before accepting the booking.');
      return;
    }
    if (!hasDriver) {
      toast.error('Please assign a driver before accepting the booking.');
      return;
    }

    try {
      if (tempVehicle) {
        await api.assignVehicle(booking.id, tempVehicle.id);
      }
      if (tempDriver) {
        await api.assignDriver(booking.id, tempDriver.id);
      }
      const updated = await api.acceptBooking(booking.id);
      setBooking(updated);
      setTempVehicle(null);
      setTempDriver(null);
      setIsEditingVehicle(false);
      setIsEditingDriver(false);
      toast.success('Booking accepted! Status is now Confirmed.');
    } catch {
      toast.error('Failed to accept booking or assign resources');
    }
  };

  // ── Assign Vehicle ─────────────────────────────────────────────
  const handleAssignVehicle = async () => {
    if (!selectedVehicleId) return;
    const vehicleObj = availableVehicles.find(v => String(v.id) === selectedVehicleId);
    if (!vehicleObj) return;

    if (booking.status === 'pending') {
      setTempVehicle(vehicleObj);
      setIsEditingVehicle(false);
      setSelectedVehicleId('');
      toast.success('Vehicle selected (will be assigned when booking is accepted)');
    } else {
      setAssigningVehicle(true);
      try {
        const updated = await api.assignVehicle(booking.id, Number(selectedVehicleId));
        setBooking(updated);
        setSelectedVehicleId('');
        setIsEditingVehicle(false);
        toast.success('Vehicle assigned successfully!');
      } catch {
        toast.error('Failed to assign vehicle');
      } finally {
        setAssigningVehicle(false);
      }
    }
  };

  // ── Assign Driver ──────────────────────────────────────────────
  const handleAssignDriver = async () => {
    if (!selectedDriverId) return;
    const driverObj = availableDrivers.find(d => String(d.id) === selectedDriverId);
    if (!driverObj) return;

    if (booking.status === 'pending') {
      setTempDriver(driverObj);
      setIsEditingDriver(false);
      setSelectedDriverId('');
      toast.success('Driver selected (will be assigned when booking is accepted)');
    } else {
      setAssigningDriver(true);
      try {
        const updated = await api.assignDriver(booking.id, Number(selectedDriverId));
        setBooking(updated);
        setSelectedDriverId('');
        setIsEditingDriver(false);
        toast.success('Driver assigned successfully!');
      } catch {
        toast.error('Failed to assign driver');
      } finally {
        setAssigningDriver(false);
      }
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
  const timeline = getTimelineSteps(booking);
  const isPaid = !!booking.isPaid;

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

  const hasVehicleAssigned = booking.status === 'pending'
    ? (tempVehicle !== null || !!vehicleLabel || !!booking.vehicle?.type || !!booking.vehicleType)
    : (!!vehicleLabel || !!booking.vehicle?.type || !!booking.vehicleType);

  const hasDriverAssigned = booking.status === 'pending'
    ? (tempDriver !== null || !!booking.driverName)
    : (!!booking.driverName);

  const displayedVehicleLabel = booking.status === 'pending' && tempVehicle
    ? `${tempVehicle.brand || ''} ${tempVehicle.model || ''} · ${tempVehicle.registrationNumber || tempVehicle.registration || ''}`
    : vehicleLabel;

  const displayedVehicleType = booking.status === 'pending' && tempVehicle
    ? tempVehicle.vehicleType
    : (booking.vehicle?.type || booking.vehicleType);

  const displayedDriverName = booking.status === 'pending' && tempDriver
    ? `${tempDriver.firstName} ${tempDriver.lastName || ''}`
    : booking.driverName;

  const displayedDriverPhone = booking.status === 'pending' && tempDriver
    ? tempDriver.mobileNumber
    : booking.driverPhone;

  const displayedDriverRating = booking.status === 'pending' && tempDriver
    ? tempDriver.rating
    : booking.driverRating;

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
              ) : (booking.accommodationOption === 'AGENCY' || booking.hotelPreferences) ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-200">
                      🏨 Agency Selected Preferences
                    </span>
                    <span className="text-xs text-muted-foreground">Ranked by Priority</span>
                  </div>

                  {booking.hotelPreferences && booking.hotelPreferences.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {booking.hotelPreferences.map((hotel) => (
                        <div key={hotel.id || hotel.hotelId} className="relative border rounded-xl p-4 bg-muted/5 flex flex-col gap-3 hover:border-primary/40 transition-colors shadow-sm">
                          <span className="absolute top-3 left-3 flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-md">
                            {hotel.preferenceNumber}
                          </span>
                          {hotel.imageUrl ? (
                            <img src={hotel.imageUrl} alt={hotel.hotelName} className="h-32 w-full object-cover rounded-lg border" />
                          ) : (
                            <div className="h-32 w-full bg-muted rounded-lg border flex items-center justify-center text-xl">🏨</div>
                          )}
                          <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                            <div>
                              <p className="font-bold text-sm text-foreground leading-tight truncate">{hotel.hotelName}</p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">{hotel.starRating || '4'}-Star · {hotel.district}</p>
                            </div>
                            
                            {/* Room Choice */}
                            <div className="bg-primary/5 border border-primary/10 rounded-md p-2 text-xs flex items-center gap-1.5 text-primary-dark">
                              <Hotel className="h-3.5 w-3.5 shrink-0 text-primary" />
                              <span className="truncate font-medium text-primary">Room: {hotel.roomName || 'Not Specified'}</span>
                            </div>

                            {/* Contact Details */}
                            <div className="border-t border-border/60 pt-2 space-y-1 mt-1 text-[11px]">
                              {hotel.contactNumber && (
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                                  <span className="truncate font-medium text-foreground">{hotel.contactNumber}</span>
                                </div>
                              )}
                              {hotel.email && (
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                                  <a href={`mailto:${hotel.email}`} className="truncate font-medium text-foreground hover:underline">{hotel.email}</a>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No hotel preferences specified.</p>
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

            {/* Assigned Vehicle and Driver (Trip Crew & Vehicle) */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-foreground">
                <Users className="h-5 w-5 text-primary" />
                Trip Crew & Vehicle
              </h3>
              
              <div className="grid gap-6 md:grid-cols-2">
                {/* Vehicle Column */}
                <div className="space-y-4 md:border-r md:border-border/50 md:pr-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      Vehicle Allocation
                    </h4>
                    {hasVehicleAssigned ? (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success border border-success/30">
                          ✓ Assigned
                        </span>
                        {booking.status !== 'cancelled' && booking.status !== 'completed' && !isEditingVehicle && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-[10px] font-semibold text-primary hover:text-primary-dark"
                            onClick={() => {
                              setIsEditingVehicle(true);
                              loadResources();
                            }}>
                            Change
                          </Button>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200">
                        ⚠️ Unassigned
                      </span>
                    )}
                  </div>

                  {(!hasVehicleAssigned || isEditingVehicle) ? (
                    booking.status !== 'cancelled' && booking.status !== 'completed' ? (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Select a vehicle from the active fleet for this trip's duration:</p>
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
                          {hasVehicleAssigned && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setIsEditingVehicle(false);
                                setSelectedVehicleId('');
                              }}>
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No vehicle assigned.</p>
                    )
                  ) : (
                    <div className="rounded-lg bg-muted/30 p-4 border border-border/40">
                      <div className="grid gap-4 sm:grid-cols-2">
                        {displayedVehicleLabel && <Field label="Vehicle" value={displayedVehicleLabel} icon={Car} />}
                        {displayedVehicleType && (
                          <Field label="Type" value={displayedVehicleType} icon={Hash} />
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Driver Column */}
                <div className="space-y-4 md:pl-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <User className="h-4 w-4 text-muted-foreground" />
                      Driver Allocation
                    </h4>
                    {hasDriverAssigned ? (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success border border-success/30">
                          ✓ Assigned
                        </span>
                        {booking.status !== 'cancelled' && booking.status !== 'completed' && !isEditingDriver && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-[10px] font-semibold text-primary hover:text-primary-dark"
                            onClick={() => {
                              setIsEditingDriver(true);
                              loadResources();
                            }}>
                            Change
                          </Button>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200">
                        ⚠️ Unassigned
                      </span>
                    )}
                  </div>

                  {(!hasDriverAssigned || isEditingDriver) ? (
                    booking.status !== 'cancelled' && booking.status !== 'completed' ? (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Select an available driver for this trip's duration:</p>
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
                          {hasDriverAssigned && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setIsEditingDriver(false);
                                setSelectedDriverId('');
                              }}>
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No driver assigned.</p>
                    )
                  ) : (
                    <div className="rounded-lg bg-muted/30 p-4 border border-border/40">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Driver Name" value={displayedDriverName} icon={User} />
                        {displayedDriverPhone && (
                          <Field label="Phone" value={displayedDriverPhone} icon={MessageSquare} />
                        )}
                        {displayedDriverRating && (
                          <Field label="Rating" value={`${displayedDriverRating} ⭐`} icon={CheckCircle} />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {booking.status === 'pending' && (
                <p className="text-[11px] text-muted-foreground mt-4 text-center border-t border-dashed pt-4">
                  💡 Both a vehicle and a driver must be assigned before accepting this booking request.
                </p>
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
                      <svg className="absolute left-0 top-3 h-full w-[60px] pointer-events-none" style={{ overflow: 'visible' }}>
                        <line
                          x1={step.label.startsWith('Day ') ? 44 : 12}
                          y1={0}
                          x2={timeline[i + 1]?.label.startsWith('Day ') ? 44 : 12}
                          y2="100%"
                          stroke={step.completed && timeline[i + 1]?.completed ? '#0d9488' : '#cbd5e1'}
                          strokeWidth={2}
                        />
                      </svg>
                    )}
                    <div className={cn(
                      "relative z-10 flex-shrink-0 transition-all duration-300",
                      step.label.startsWith('Day ') ? "ml-8" : "ml-0"
                    )}>
                      {step.completed
                        ? <CheckCircle className="h-6 w-6 text-primary bg-card rounded-full" />
                        : <Circle className="h-6 w-6 text-muted-foreground/40 bg-card rounded-full" />}
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
