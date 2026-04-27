import { useState } from 'react';
import {
  Search,
  Filter,
  Check,
  X,
  CheckCircle,
  Eye,
  Download,
  MapPin,
  Calendar,
  Car,
  User,
  Users,
  SearchX,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { bookings as initialBookings, statusBadge } from '@/data/bookings';
import { toast } from 'sonner';

const DECLINE_REASONS = [
  'No available driver for selected dates',
  'No available vehicle for selected dates',
  'Destination not covered by our agency',
  'Dates conflict with existing booking',
  'Customer request outside service area',
  'Other',
];

/**
 * Opens a styled HTML invoice in a new window and triggers print / save-as-PDF.
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

const Bookings = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [localBookings, setLocalBookings] = useState(initialBookings);

  // Decline dialog state
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [declineBookingId, setDeclineBookingId] = useState(null);
  const [declineReason, setDeclineReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  // Complete trip dialog state
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [completeBookingId, setCompleteBookingId] = useState(null);

  const handleUpdateStatus = (id, newStatus) => {
    setLocalBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );
  };

  const handleOpenDeclineDialog = (bookingId) => {
    setDeclineBookingId(bookingId);
    setDeclineReason('');
    setCustomReason('');
    setDeclineDialogOpen(true);
  };

  const handleConfirmDecline = () => {
    if (!declineReason) return;
    handleUpdateStatus(declineBookingId, 'cancelled');
    setDeclineDialogOpen(false);
    setDeclineBookingId(null);
    setDeclineReason('');
    setCustomReason('');
    toast.success('Booking declined. Customer has been notified.');
  };

  const handleOpenCompleteDialog = (bookingId) => {
    setCompleteBookingId(bookingId);
    setCompleteDialogOpen(true);
  };

  const handleConfirmComplete = () => {
    handleUpdateStatus(completeBookingId, 'completed');
    setCompleteDialogOpen(false);
    setCompleteBookingId(null);
    toast.success('Trip marked as completed successfully');
  };

  const filteredBookings = localBookings.filter((booking) => {
    const matchesSearch =
      booking.customerName.toLowerCase().includes(search.toLowerCase()) ||
      booking.destination.toLowerCase().includes(search.toLowerCase()) ||
      booking.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = localBookings.filter((b) => b.status === 'pending').length;
  const activeCount = localBookings.filter((b) => b.status === 'active').length;
  const completedCount = localBookings.filter(
    (b) => b.status === 'completed'
  ).length;
  const cancelledCount = localBookings.filter(
    (b) => b.status === 'cancelled'
  ).length;

  /**
   * Renders status-specific action buttons for each booking card.
   */
  const renderActionButtons = (booking) => {
    switch (booking.status) {
      case 'pending':
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-1 border-success text-success hover:bg-success hover:text-success-foreground"
              onClick={() => {
                handleUpdateStatus(booking.id, 'active');
                toast.success('Booking accepted successfully');
              }}
            >
              <Check className="h-4 w-4" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => handleOpenDeclineDialog(booking.id)}
            >
              <X className="h-4 w-4" />
              Decline
            </Button>
          </div>
        );

      case 'active':
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-1 border-success text-success hover:bg-success hover:text-success-foreground"
              onClick={() => handleOpenCompleteDialog(booking.id)}
            >
              <CheckCircle className="h-4 w-4" />
              Complete Trip
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              onClick={() => navigate(`/bookings/${booking.id}`)}
            >
              <Eye className="h-4 w-4" />
              View Details
            </Button>
          </div>
        );

      case 'completed':
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              onClick={() => navigate(`/bookings/${booking.id}`)}
            >
              <Eye className="h-4 w-4" />
              View Details
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              onClick={() => handleDownloadInvoice(booking)}
            >
              <Download className="h-4 w-4" />
              Download Invoice
            </Button>
          </div>
        );

      case 'cancelled':
        return (
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="outline"
              className="gap-1 text-muted-foreground"
              onClick={() => navigate(`/bookings/${booking.id}`)}
            >
              <Eye className="h-4 w-4" />
              View Details
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout
      title="Booking Requests"
      subtitle="Manage and track all your travel bookings"
      showSearch={false}
    >
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
            <p className="text-sm font-medium text-warning">Pending Requests</p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {pendingCount}
            </p>
          </div>
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
            <p className="text-sm font-medium text-primary">Active Trips</p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {activeCount}
            </p>
          </div>
          <div className="rounded-xl border border-success/30 bg-success/5 p-4">
            <p className="text-sm font-medium text-success">Completed</p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {completedCount}
            </p>
          </div>
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <p className="text-sm font-medium text-destructive">Cancelled</p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {cancelledCount}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search bookings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-search w-full sm:w-80"
            />
          </div>
          <div className="flex gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bookings Cards */}
        {filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16">
            <SearchX className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-lg font-semibold text-foreground">
              No bookings found
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search or filter to find what you are looking for
            </p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-semibold text-primary-foreground">
                      {booking.customerName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">
                          {booking.customerName}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {booking.id}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {booking.customerEmail}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize',
                      statusBadge[booking.status]
                    )}
                  >
                    {booking.status}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{booking.destination}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{booking.travelDates}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{booking.vehicle}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{booking.driver}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">
                      {booking.passengers} {booking.passengers === 1 ? 'Passenger' : 'Passengers'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {booking.packageType}
                    </p>
                    <p className="text-lg font-bold text-foreground">
                      ${booking.amount.toLocaleString()}
                    </p>
                  </div>

                  {renderActionButtons(booking)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Decline Reason Dialog */}
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
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent>
                {DECLINE_REASONS.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {declineReason === 'Other' && (
              <Input
                placeholder="Enter custom reason..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="w-full"
              />
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeclineDialogOpen(false);
                setDeclineReason('');
                setCustomReason('');
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={!declineReason || (declineReason === 'Other' && !customReason)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmDecline}
            >
              Confirm Decline
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Complete Trip Confirmation Dialog */}
      <AlertDialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Trip as Completed</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this trip as completed? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setCompleteDialogOpen(false);
                setCompleteBookingId(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-success text-success-foreground hover:bg-success/90"
              onClick={handleConfirmComplete}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Bookings;
