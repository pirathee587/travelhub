import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/common/ui/card';
import { Button } from '@/components/common/ui/button';
import { XCircle, RefreshCw, Home, FileText } from 'lucide-react';

const PaymentCancel = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');

  return (
    <div className="container max-w-2xl py-20 mx-auto animate-slide-up">
      <Card className="text-center shadow-lg border-destructive/20 bg-destructive/5">
        <CardContent className="pt-12 pb-12 px-6">
          <div className="flex justify-center mb-6">
            <XCircle className="w-24 h-24 text-destructive" />
          </div>
          <h2 className="text-3xl font-bold text-destructive mb-4">Payment Cancelled</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
            The payment process was interrupted or cancelled. No charges were made to your account.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {bookingId ? (
              <Button asChild className="gap-2 bg-destructive hover:bg-destructive/90">
                <Link to={`/tourist/payment/${bookingId}`}>
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Link>
              </Button>
            ) : (
              <Button asChild className="gap-2">
                <Link to="/tourist/billing">
                  <FileText className="w-4 h-4" />
                  Back to Billing
                </Link>
              </Button>
            )}
            <Button variant="outline" asChild className="gap-2">
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

export default PaymentCancel;
