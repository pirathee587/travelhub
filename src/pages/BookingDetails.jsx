import { useParams, useNavigate } from 'react-router-dom';
import { bookings, statusBadge } from '@/data/bookings';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  Calendar,
  Car,
  User,
  Users,
  ArrowLeft,
  Mail,
  Download,
  Phone,
  Package,
  CheckCircle,
  Circle,
  CreditCard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

/**
 * Generates a styled HTML invoice in a new window and triggers print / save-as-PDF.
 */
const handleDownloadInvoice = (booking) => {
  const invoiceHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Invoice - ${booking.id}</title>
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
        @media print {
          body { padding: 24px; }
          @page { margin: 0.5in; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-header">
        <div class="brand">
          <h1>Sri Lanka Travel Experts</h1>
          <p>Premium Travel & Tour Services</p>
        </div>
        <div class="invoice-title">
          <h2>OFFICIAL INVOICE</h2>
          <p>Booking ID: ${booking.id}</p>
          <p>Issue Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Customer Details</div>
        <div class="grid">
          <div class="field"><label>Full Name</label><p>${booking.customerName}</p></div>
          <div class="field"><label>Email Address</label><p>${booking.customerEmail}</p></div>
          <div class="field"><label>Contact Number</label><p>${booking.contactNumber}</p></div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Trip Details</div>
        <div class="grid">
          <div class="field"><label>Destination</label><p>${booking.destination}</p></div>
          <div class="field"><label>Travel Dates</label><p>${booking.travelDates}</p></div>
          <div class="field"><label>Package Type</label><p>${booking.packageType}</p></div>
          <div class="field"><label>Number of Passengers</label><p>${booking.passengers}</p></div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Vehicle & Driver</div>
        <div class="grid">
          <div class="field"><label>Vehicle</label><p>${booking.vehicle}</p></div>
          <div class="field"><label>Driver</label><p>${booking.driver}</p></div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Payment</div>
        <div class="payment-box">
          <div>
            <div style="font-size:12px;color:#64748b;margin-bottom:4px;">Total Amount</div>
            <div class="amount">$${booking.amount.toLocaleString()}</div>
          </div>
          <div class="status">Paid</div>
        </div>
      </div>

      <div class="footer">
        <p>Thank you for choosing Sri Lanka Travel Experts</p>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank', 'width=800,height=900');
  printWindow.document.write(invoiceHTML);
  printWindow.document.close();
  printWindow.onload = () => {
    printWindow.print();
  };
  toast.success('Invoice downloaded successfully');
};

/**
 * Returns timeline steps with completed state based on booking status.
 */
const getTimelineSteps = (status) => {
  const steps = [
    { label: 'Booking Requested', date: 'Jan 10, 2025' },
    { label: 'Booking Accepted', date: 'Jan 11, 2025' },
    { label: 'Trip Started', date: 'Jan 15, 2025' },
    { label: 'Trip Completed', date: 'Jan 22, 2025' },
  ];

  const statusIndex = {
    pending: 0,
    active: 2,
    completed: 3,
    cancelled: 0,
  };

  const reached = statusIndex[status] ?? 0;
  return steps.map((step, i) => ({
    ...step,
    completed: i <= reached,
  }));
};

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const booking = bookings.find((b) => b.id === id);

  if (!booking) {
    return (
      <DashboardLayout title="Booking Details" showSearch={false}>
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-2xl font-bold">Booking not found</h2>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate('/bookings')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Bookings
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const timeline = getTimelineSteps(booking.status);
  const isPaid = booking.status === 'completed' || booking.status === 'active';

  return (
    <DashboardLayout
      title={`Booking ${booking.id}`}
      subtitle="View complete booking information"
      showSearch={false}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            className="gap-2"
            onClick={() => navigate('/bookings')}
          >
            <ArrowLeft className="h-4 w-4" /> Back to List
          </Button>
          <div className="flex items-center gap-3">
            <span
              className={cn(
                'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize',
                statusBadge[booking.status]
              )}
            >
              {booking.status}
            </span>
          </div>
        </div>

        {/* Booking ID & Issue Date */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Booking ID</p>
              <p className="text-2xl font-bold text-foreground">{booking.id}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Issue Date</p>
              <p className="font-semibold text-foreground">
                {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column — Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section 1 — Customer Information */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                <User className="h-5 w-5 text-primary" />
                Customer Information
              </h3>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Full Name
                  </p>
                  <p className="font-medium text-foreground">{booking.customerName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Email Address
                  </p>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium text-foreground">{booking.customerEmail}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Contact Number
                  </p>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium text-foreground">{booking.contactNumber}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2 — Trip Details */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                <MapPin className="h-5 w-5 text-primary" />
                Trip Details
              </h3>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Destination
                  </p>
                  <p className="font-medium text-foreground">{booking.destination}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Travel Dates
                  </p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium text-foreground">{booking.travelDates}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Package Type
                  </p>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium text-foreground">{booking.packageType}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Number of Passengers
                  </p>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium text-foreground">
                      {booking.passengers} {booking.passengers === 1 ? 'Passenger' : 'Passengers'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3 — Vehicle & Driver */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                <Car className="h-5 w-5 text-primary" />
                Vehicle & Driver
              </h3>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Vehicle
                  </p>
                  <p className="font-medium text-foreground">{booking.vehicle}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Driver
                  </p>
                  <p className="font-medium text-foreground">{booking.driver}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column — Sidebar */}
          <div className="space-y-6">
            {/* Section 4 — Booking Timeline */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-6 text-lg font-semibold text-foreground">
                Booking Timeline
              </h3>
              <div className="relative space-y-0">
                {timeline.map((step, i) => (
                  <div key={step.label} className="relative flex gap-4 pb-8 last:pb-0">
                    {/* Vertical line */}
                    {i < timeline.length - 1 && (
                      <div
                        className={cn(
                          'absolute left-[11px] top-6 h-full w-0.5',
                          step.completed && timeline[i + 1]?.completed
                            ? 'bg-primary'
                            : 'bg-border'
                        )}
                      />
                    )}
                    {/* Step icon */}
                    <div className="relative z-10 flex-shrink-0">
                      {step.completed ? (
                        <CheckCircle className="h-6 w-6 text-primary" />
                      ) : (
                        <Circle className="h-6 w-6 text-muted-foreground/40" />
                      )}
                    </div>
                    {/* Step content */}
                    <div className="pt-0.5">
                      <p
                        className={cn(
                          'text-sm font-medium',
                          step.completed ? 'text-foreground' : 'text-muted-foreground'
                        )}
                      >
                        {step.label}
                      </p>
                      <p
                        className={cn(
                          'text-xs mt-0.5',
                          step.completed ? 'text-muted-foreground' : 'text-muted-foreground/50'
                        )}
                      >
                        {step.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 5 — Payment */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                <CreditCard className="h-5 w-5 text-primary" />
                Payment
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="text-2xl font-bold text-foreground">
                    ${booking.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Payment Status
                  </span>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
                      isPaid
                        ? 'bg-success/10 text-success border border-success/30'
                        : 'bg-warning/10 text-warning border border-warning/30'
                    )}
                  >
                    {isPaid ? 'Paid' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            {/* Download Invoice — only for completed bookings */}
            {booking.status === 'completed' && (
              <Button
                className="w-full gap-2"
                variant="outline"
                onClick={() => handleDownloadInvoice(booking)}
              >
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
