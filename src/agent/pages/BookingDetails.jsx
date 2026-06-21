import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@agent/components/dashboard/DashboardLayout';
import { Button } from '@agent/components/ui/button';
import {
  MapPin, Calendar, Car, User, Users, ArrowLeft,
  Download, Package, CheckCircle, Circle, CreditCard,
  Clock, Hotel, Hash, Baby, MessageSquare,
} from 'lucide-react';
import { cn } from '@agent/lib/utils';
import { toast } from 'sonner';
import { api } from '@agent/lib/api';

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
  if (isActive(status)) return 'Active';
  return (status || '').replace('_', ' ');
};

// ── Invoice generator ──────────────────────────────────────────
const handleDownloadInvoice = (booking) => {
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
          <div class="field"><label>Destination</label><p>${booking.destination || '-'}</p></div>
          <div class="field"><label>Start Date</label><p>${booking.startDate || '-'}</p></div>
          <div class="field"><label>End Date</label><p>${booking.endDate || '-'}</p></div>
        </div>
      </div>
      <div class="section">
        <div class="section-title">Payment</div>
        <div class="payment-box">
          <div>
            <div style="font-size:12px;color:#64748b;margin-bottom:4px;">Total Amount</div>
            <div class="amount">$${(booking.totalPrice || 0).toLocaleString()}</div>
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

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

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
          <Button variant="outline" className="mt-4" onClick={() => navigate('/agent/bookings')}>
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

        {/* Back + status badge */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" className="gap-2" onClick={() => navigate('/agent/bookings')}>
            <ArrowLeft className="h-4 w-4" /> Back to List
          </Button>
          <span className={cn(
            'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize',
            statusBadge[booking.status] || statusBadge['confirmed']
          )}>
            {statusLabel(booking.status)}
          </span>
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
                <Field label="Destination" value={booking.destination} icon={MapPin} />
                <Field label="Package Name" value={booking.packageName} icon={Package} />
                <Field label="Start Date" value={booking.startDate} icon={Calendar} />
                <Field label="End Date" value={booking.endDate} icon={Calendar} />
                {duration && <Field label="Duration" value={duration} icon={Clock} />}
              </div>
            </div>

            {/* Passengers */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                <Users className="h-5 w-5 text-primary" />
                Passengers
              </h3>
              <div className="grid gap-6 sm:grid-cols-2">
                {(booking.adults != null) && (
                  <Field label="Adults" value={`${booking.adults} adult${booking.adults !== 1 ? 's' : ''}`} icon={User} />
                )}
                {(booking.children != null) && (
                  <Field label="Children" value={`${booking.children} child${booking.children !== 1 ? 'ren' : ''}`} icon={Baby} />
                )}
                {(booking.adults == null && booking.children == null && booking.passengers != null) && (
                  <Field label="Passengers" value={`${booking.passengers} passenger${booking.passengers !== 1 ? 's' : ''}`} icon={Users} />
                )}
              </div>
            </div>

            {/* Special Requests */}
            {booking.specialRequests && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Special Requests
                </h3>
                <p className="text-sm text-foreground leading-relaxed">{booking.specialRequests}</p>
              </div>
            )}

            {/* Hotel Preferences */}
            {booking.hotelPreferences && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                  <Hotel className="h-5 w-5 text-primary" />
                  Hotel Preferences
                </h3>
                <p className="text-sm text-foreground leading-relaxed">{booking.hotelPreferences}</p>
              </div>
            )}

            {/* Assigned Vehicle */}
            {vehicleLabel && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                  <Car className="h-5 w-5 text-primary" />
                  Assigned Vehicle
                </h3>
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field label="Vehicle" value={vehicleLabel} icon={Car} />
                  {(booking.vehicle?.type || booking.vehicleType) && (
                    <Field label="Type" value={booking.vehicle?.type || booking.vehicleType} icon={Hash} />
                  )}
                </div>
              </div>
            )}
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
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Price</span>
                  <span className="text-2xl font-bold text-foreground">
                    ${(booking.totalPrice || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className={cn(
                    'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
                    isPaid
                      ? 'bg-success/10 text-success border border-success/30'
                      : 'bg-warning/10 text-warning border border-warning/30'
                  )}>
                    {isPaid ? 'Paid' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            {/* Download Invoice (completed only) */}
            {booking.status === 'completed' && (
              <Button className="w-full gap-2" variant="outline"
                onClick={() => handleDownloadInvoice(booking)}>
                <Download className="h-4 w-4" />
                Download Invoice
              </Button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BookingDetails;
