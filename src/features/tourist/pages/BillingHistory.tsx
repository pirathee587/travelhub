import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import billingService from '@/services/billingService';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/common/ui/card';
import { Button } from '@/components/common/ui/button';
import { Badge } from '@/components/common/ui/badge';
import { Receipt, Download, Bell, Loader2 } from 'lucide-react';

const BillingHistory = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await billingService.getHistory();
      setHistory(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load billing history');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async (bookingId: string | number) => {
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

  const getStatusColor = (status: string) => {
    if (status === 'Completed' || status === 'SUCCESS') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (status === 'Failed' || status === 'FAILED') return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-amber-100 text-amber-700 border-amber-200';
  };

  return (
    <div className="container max-w-5xl py-8 mx-auto animate-slide-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Billing & Payments</h2>
          <p className="text-muted-foreground mt-1">View your payment history and download receipts.</p>
        </div>
        <Button variant="outline" className="gap-2" asChild>
          <Link to="/tourist/notifications">
            <Bell className="w-4 h-4" />
            Notifications
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : history.length === 0 ? (
        <Card className="border-dashed border-2 shadow-sm rounded-xl">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 bg-secondary rounded-full flex items-center justify-center mb-4">
              <Receipt className="w-8 h-8 text-muted-foreground" />
            </div>
            <h5 className="text-xl font-semibold mb-2">No payments yet</h5>
            <p className="text-muted-foreground mb-6 max-w-sm">Your completed payments and receipts will appear here.</p>
            <Button asChild>
              <Link to="/tourist">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {history.map((item) => (
            <Card key={item.paymentId} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{item.date}</span>
                    </div>
                    <div>
                      <h5 className="text-lg font-semibold">{item.packageName}</h5>
                      <p className="text-sm text-muted-foreground">Transaction: {item.transactionId}</p>
                      <p className="text-sm text-muted-foreground">Booking ID: {item.bookingId}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:items-end justify-between">
                    <div className="text-2xl font-bold text-primary mb-4 md:mb-0">
                      ${item.amount?.toLocaleString()}
                    </div>
                    <div className="flex gap-3">
                      {item.status !== 'Completed' && item.status !== 'SUCCESS' && item.bookingId && (
                        <Button asChild>
                          <Link to={`/tourist/payment/${item.bookingId}`}>Pay Now</Link>
                        </Button>
                      )}
                      {item.receiptAvailable && (
                        <Button variant="outline" className="gap-2" onClick={() => handleDownloadReceipt(item.bookingId)}>
                          <Download className="w-4 h-4" />
                          Receipt
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BillingHistory;
