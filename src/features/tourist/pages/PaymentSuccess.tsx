import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import api from '@/services/axios';
import billingService from '@/services/billingService';
import { Card, CardContent } from '@/components/common/ui/card';
import { Button } from '@/components/common/ui/button';
import { CheckCircle2, Download, Home, FileText } from 'lucide-react';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      const params = Object.fromEntries(searchParams.entries());
      if (!params.order_id) {
        setVerifying(false);
        return;
      }

      try {
        await api.get('/payments/return', { params });
        setVerified(true);
        toast.success('Payment verified successfully');
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Payment verification failed');
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  const handleDownloadReceipt = async () => {
    if (!bookingId) return;
    try {
      const response = await billingService.downloadReceipt(bookingId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Receipt_Booking_${bookingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Failed to download receipt');
    }
  };

  return (
    <div className="container max-w-2xl py-20 mx-auto animate-slide-up">
      <Card className="text-center shadow-lg border-emerald-100 bg-emerald-50/50">
        <CardContent className="pt-12 pb-12 px-6">
          <div className="flex justify-center mb-6">
            <CheckCircle2 className="w-24 h-24 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-bold text-emerald-700 mb-4">Payment Successful!</h2>
          
          {verifying ? (
            <p className="text-muted-foreground text-lg mb-8">Verifying your payment...</p>
          ) : (
            <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
              Thank you for your booking. {verified ? 'Your payment has been confirmed and a confirmation email has been sent.' : 'If you completed payment on PayHere, it will appear in your billing history shortly.'}
            </p>
          )}

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {bookingId && verified && (
              <Button onClick={handleDownloadReceipt} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                <Download className="w-4 h-4" />
                Download Receipt
              </Button>
            )}
            <Button variant={verified ? "outline" : "default"} asChild className="gap-2">
              <Link to="/tourist/billing">
                <FileText className="w-4 h-4" />
                View Billing History
              </Link>
            </Button>
            <Button variant="secondary" asChild className="gap-2">
              <Link to="/tourist">
                <Home className="w-4 h-4" />
                Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
