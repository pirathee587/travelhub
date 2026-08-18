import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import billingService from '@/services/billingService';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/common/ui/card';
import { Button } from '@/components/common/ui/button';
import { Badge } from '@/components/common/ui/badge';
import { Input } from '@/components/common/ui/input';
import { Receipt, Download, Bell, Loader2, Search, X, ArrowUpDown, RotateCcw } from 'lucide-react';
import { DashboardLayout } from '@/features/tourist/components/dashboard/DashboardLayout';
import { useTouristCurrency } from '@/features/tourist/hooks/TouristCurrencyContext';
import { useAuth } from '@/context/AuthContext';
import { cn, RenderDateTime } from '@/features/tourist/services/utils';

const BillingHistory = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount_high' | 'amount_low'>('newest');
  const { formatPrice } = useTouristCurrency();
  const { user } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('travelhub_token')
      || localStorage.getItem('token')
      || sessionStorage.getItem('travelhub_token')
      || sessionStorage.getItem('token');
    if (user && token) {
      fetchHistory();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchHistory = async () => {
    const token = localStorage.getItem('travelhub_token')
      || localStorage.getItem('token')
      || sessionStorage.getItem('travelhub_token')
      || sessionStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await billingService.getHistory();
      setHistory(Array.isArray(data) ? data : []);
    } catch (error: any) {
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        toast.error(error.response?.data?.message || 'Failed to load billing history');
      }
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

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSortBy('newest');
  };

  const filteredAndSortedHistory = useMemo(() => {
    return history
      .filter((item) => {
        // Status Filter
        if (statusFilter === 'pending') {
          if (item.status === 'Completed' || item.status === 'SUCCESS' || item.status === 'Failed' || item.status === 'FAILED') return false;
        } else if (statusFilter === 'completed') {
          if (item.status !== 'Completed' && item.status !== 'SUCCESS') return false;
        } else if (statusFilter === 'failed') {
          if (item.status !== 'Failed' && item.status !== 'FAILED') return false;
        }

        // Search Query Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const pkgName = (item.packageName || '').toLowerCase();
          const txId = (item.transactionId || '').toLowerCase();
          const bId = String(item.bookingId || '').toLowerCase();
          return pkgName.includes(q) || txId.includes(q) || bId.includes(q);
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
        } else if (sortBy === 'oldest') {
          return new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime();
        } else if (sortBy === 'amount_high') {
          return (b.amount || 0) - (a.amount || 0);
        } else if (sortBy === 'amount_low') {
          return (a.amount || 0) - (b.amount || 0);
        }
        return 0;
      });
  }, [history, statusFilter, searchQuery, sortBy]);

  const hasActiveFilters = searchQuery.trim() !== '' || statusFilter !== 'all' || sortBy !== 'newest';

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto pb-10 animate-slide-up mt-8 md:mt-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Billing & Payments</h2>
            <p className="text-muted-foreground mt-1">View your payment history and download receipts.</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        {!loading && history.length > 0 && (
          <div className="bg-card p-4 rounded-xl border border-border shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by package name, booking ID, or order..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Status Filter Buttons */}
              <div className="flex items-center bg-muted/60 p-1 rounded-lg border border-border/50 text-xs">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={cn(
                    "px-3 py-1.5 rounded-md font-medium transition-all",
                    statusFilter === 'all' ? "bg-background text-foreground shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter('pending')}
                  className={cn(
                    "px-3 py-1.5 rounded-md font-medium transition-all",
                    statusFilter === 'pending' ? "bg-background text-amber-600 shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Pending
                </button>
                <button
                  onClick={() => setStatusFilter('completed')}
                  className={cn(
                    "px-3 py-1.5 rounded-md font-medium transition-all",
                    statusFilter === 'completed' ? "bg-background text-emerald-600 shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Completed
                </button>
              </div>

              {/* Sort Select */}
              <div className="flex items-center gap-2 bg-background border border-input rounded-lg px-3 py-1.5 text-sm">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer text-foreground"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="amount_high">Amount: High to Low</option>
                  <option value="amount_low">Amount: Low to High</option>
                </select>
              </div>

              {/* Reset Filters */}
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={handleResetFilters} className="gap-1 text-xs text-muted-foreground hover:text-foreground">
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        )}

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
        ) : filteredAndSortedHistory.length === 0 ? (
          <Card className="border-dashed border-2 shadow-sm rounded-xl">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-14 w-14 bg-secondary rounded-full flex items-center justify-center mb-4">
                <Search className="w-7 h-7 text-muted-foreground" />
              </div>
              <h5 className="text-lg font-semibold mb-2">No matching transactions</h5>
              <p className="text-muted-foreground mb-6 max-w-sm">We couldn't find any billing records matching your search or filters.</p>
              <Button variant="outline" onClick={handleResetFilters} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredAndSortedHistory.map((item) => (
              <Card key={item.paymentId} className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                        <RenderDateTime dateTimeStr={item.date} className="text-sm text-muted-foreground" />
                      </div>
                      <div>
                        <h5 className="text-lg font-semibold">{item.packageName}</h5>
                        <p className="text-sm text-muted-foreground">Transaction: {item.transactionId}</p>
                        <p className="text-sm text-muted-foreground">Booking ID: {item.bookingId}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:items-end justify-between">
                      <div className="text-2xl font-bold text-primary mb-4 md:mb-0">
                        {formatPrice(item.amount)}
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
    </DashboardLayout>
  );
};

export default BillingHistory;
