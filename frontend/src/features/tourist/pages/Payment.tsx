import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import paymentService from '@/services/paymentService';
import bookingService from '@/services/bookingService';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card';
import { Button } from '@/components/common/ui/button';
import { Loader2, AlertCircle, ShieldCheck, CreditCard } from 'lucide-react';
import { useTouristCurrency } from '@/features/tourist/hooks/TouristCurrencyContext';
import { Shimmer } from "@/components/common/ui/skeletons";

const Payment = () => {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { formatPrice } = useTouristCurrency();

  useEffect(() => {
    if (!id) return;
    const fetchDetails = async () => {
      try {
        const bData = await bookingService.getBookingDetails(id);
        setBooking(bData);
        const cData = await paymentService.getCheckoutData(id);
        setCheckoutData(cData);
      } catch (err: any) {
        const message = err.response?.data?.message || 'Failed to load payment details';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="container max-w-xl py-12 mx-auto animate-slide-up">
        <div className="rounded-xl overflow-hidden shadow-lg border-0 bg-white">
          <Shimmer className="h-20 w-full" />
          <div className="p-8 space-y-6">
            <div className="flex justify-center mb-6">
              <Shimmer className="h-16 w-16 rounded-full" />
            </div>
            <div className="space-y-4 mb-8">
              <Shimmer className="h-6 w-3/4 mx-auto" />
              <Shimmer className="h-4 w-1/2 mx-auto" />
            </div>
            <div className="bg-secondary/50 p-6 rounded-xl space-y-4">
              <Shimmer className="h-4 w-32 mb-4" />
              <div className="flex justify-between"><Shimmer className="h-4 w-24" /><Shimmer className="h-4 w-32" /></div>
              <div className="flex justify-between"><Shimmer className="h-4 w-24" /><Shimmer className="h-4 w-20" /></div>
              <Shimmer className="h-px w-full my-4" />
              <div className="flex justify-between"><Shimmer className="h-6 w-24" /><Shimmer className="h-6 w-28" /></div>
            </div>
            <Shimmer className="h-14 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container max-w-2xl py-20 mx-auto animate-slide-up">
        <Card className="text-center shadow-sm border-dashed">
          <CardContent className="pt-12 pb-12 px-6">
            <div className="flex justify-center mb-4">
              <AlertCircle className="w-16 h-16 text-warning" />
            </div>
            <h4 className="text-2xl font-bold mb-2">Payment Unavailable</h4>
            <p className="text-muted-foreground mb-6">{error || 'Booking not found'}</p>
            <Button asChild>
              <Link to="/tourist/billing">Back to Billing</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-xl py-12 mx-auto animate-slide-up">
      <Card className="shadow-lg overflow-hidden border-0">
        <CardHeader className="bg-primary text-primary-foreground py-6 text-center">
          <CardTitle className="text-2xl font-bold">Secure Payment</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-3">
              <ShieldCheck className="w-16 h-16 text-emerald-500" />
            </div>
            <p className="text-muted-foreground">Complete your booking securely via PayHere Sandbox</p>
          </div>

          <div className="bg-secondary/50 p-6 rounded-xl mb-8">
            <h6 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Booking Summary</h6>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Package:</span>
                <span className="font-medium text-right">{booking.packageName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium capitalize">{booking.status}</span>
              </div>
              {checkoutData?.outstanding_fine > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Package Price:</span>
                    <span className="font-medium">${(checkoutData.booking_price || booking.totalPrice)?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-destructive">
                    <span>Unpaid Cancellation Fine:</span>
                    <span className="font-bold">+${checkoutData.outstanding_fine.toLocaleString()}</span>
                  </div>
                </>
              )}
              <div className="border-t border-border my-3 pt-3 flex justify-between items-center">
                <span className="font-semibold text-lg">Total Payable Amount:</span>
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(checkoutData?.amount || booking.totalPrice)}
                </span>
              </div>
            </div>
          </div>

          {checkoutData && (
            <form 
              method="post" 
              action={checkoutData.checkout_url}
              onSubmit={() => setSubmitting(true)}
            >
              {Object.entries(checkoutData).map(([key, value]) => {
                if (key !== 'checkout_url') {
                  return <input key={key} type="hidden" name={key} value={value as string} />;
                }
                return null;
              })}

              <Button 
                type="submit" 
                size="lg" 
                className="w-full h-14 text-lg font-bold gap-2"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Connecting to PayHere...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Pay Now with PayHere
                  </>
                )}
              </Button>
            </form>
          )}

          <div className="text-center mt-8 space-y-4">
            <div className="flex justify-center">
              <img src="https://www.payhere.lk/downloads/images/payhere_short_banner_dark.png" alt="PayHere" className="h-8 opacity-80 hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-xs text-muted-foreground">Sandbox test cards are available in your PayHere merchant dashboard.</p>
            <Link to="/tourist/billing" className="text-sm text-primary hover:underline font-medium inline-block mt-2">
              View billing history
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Payment;
