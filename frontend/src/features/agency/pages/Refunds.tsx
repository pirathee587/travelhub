import { useState, useEffect } from 'react';
import { Search, FileText, CheckCircle, XCircle, Clock, Upload, ArrowUpRight, Ban, Eye } from 'lucide-react';
import { DashboardLayout } from '@/features/agency/components/dashboard/DashboardLayout';
import { Button } from '@/components/common/ui/button';
import { Input } from '@/components/common/ui/input';
import { toast } from 'sonner';
import { useCurrency } from '@/features/agency/hooks/CurrencyContext';
import refundService, { RefundResponseDto } from '@/services/refundService';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/common/ui/dialog';

const Refunds = () => {
  const { formatPrice } = useCurrency();
  const [requests, setRequests] = useState<RefundResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  
  // Modal states
  const [selectedRequest, setSelectedRequest] = useState<RefundResponseDto | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [processing, setProcessing] = useState(false);

  const fetchRefundRequests = async () => {
    try {
      setLoading(true);
      const data = await refundService.getAgentRefundRequests();
      setRequests(data);
    } catch (error) {
      console.error('Failed to load refund requests:', error);
      toast.error('Failed to load refund requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefundRequests();
  }, []);

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    if (!slipFile) {
      toast.error('Please upload a bank deposit slip as proof');
      return;
    }
    setProcessing(true);
    try {
      await refundService.approveRefundRequest(selectedRequest.id, slipFile);
      toast.success('Refund request successfully approved and processed!');
      setShowDetailDialog(false);
      setSelectedRequest(null);
      setSlipFile(null);
      fetchRefundRequests();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to approve refund request';
      toast.error(msg);
    } finally {
      setProcessing(false);
    }
  };

  const handleDecline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    if (!declineReason.trim()) {
      toast.error('Please provide a decline reason');
      return;
    }
    setProcessing(true);
    try {
      await refundService.declineRefundRequest(selectedRequest.id, declineReason);
      toast.success('Refund request declined.');
      setShowDetailDialog(false);
      setSelectedRequest(null);
      setDeclineReason('');
      setShowDeclineForm(false);
      fetchRefundRequests();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to decline refund request';
      toast.error(msg);
    } finally {
      setProcessing(false);
    }
  };

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      (req.touristName || '').toLowerCase().includes(search.toLowerCase()) ||
      (req.packageName || '').toLowerCase().includes(search.toLowerCase()) ||
      `#${req.bookingId}`.includes(search);
    
    if (activeTab === 'ALL') return matchesSearch;
    return req.status === activeTab && matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in p-6">
        {/* Header */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Refund Requests</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage and process manual bank deposit refunds requested by tourists.
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-sidebar-accent/30 p-4 rounded-xl border border-sidebar-border/40">
          {/* Tabs */}
          <div className="flex bg-sidebar-background/60 p-1 rounded-lg border border-sidebar-border/60 max-w-fit">
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-primary text-primary-foreground shadow'
                    : 'text-muted-foreground hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by tourist, package or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 text-sm h-10 w-full"
            />
          </div>
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-20 bg-sidebar-accent/20 rounded-2xl border border-dashed border-sidebar-border/40">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground/60 mb-4" />
            <h3 className="text-lg font-bold text-white">No Refund Requests Found</h3>
            <p className="text-muted-foreground text-sm">
              Any refund requests submitted by tourists will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-sidebar-border/40 bg-sidebar-accent/10 backdrop-blur-md">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-sidebar-border/60 bg-sidebar-accent/40 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="p-4">Booking</th>
                  <th className="p-4">Tourist</th>
                  <th className="p-4">Package</th>
                  <th className="p-4 text-right">Amount</th>
                  <th className="p-4">Bank Details</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sidebar-border/40 text-sm text-sidebar-foreground">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-sidebar-accent/15 transition-all">
                    <td className="p-4 font-mono font-medium text-white">#{req.bookingId}</td>
                    <td className="p-4 font-medium text-white">{req.touristName}</td>
                    <td className="p-4">{req.packageName}</td>
                    <td className="p-4 text-right font-bold text-primary">${req.amount.toLocaleString()}</td>
                    <td className="p-4 max-w-xs truncate text-xs text-muted-foreground">
                      {req.bankName} - {req.accountNo}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                          req.status === 'PENDING'
                            ? 'bg-warning/10 text-warning border-warning/20'
                            : req.status === 'APPROVED'
                            ? 'bg-success/10 text-success border-success/20'
                            : 'bg-destructive/10 text-destructive border-destructive/20'
                        }`}
                      >
                        {req.status === 'PENDING' && <Clock className="h-3 w-3" />}
                        {req.status === 'APPROVED' && <CheckCircle className="h-3 w-3" />}
                        {req.status === 'REJECTED' && <XCircle className="h-3 w-3" />}
                        {req.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(req);
                          setShowDetailDialog(true);
                          setShowDeclineForm(false);
                        }}
                        className="gap-1 font-semibold text-xs border-sidebar-border/80 hover:bg-sidebar-accent"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail & Action Modal */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-lg bg-sidebar border-sidebar-border text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Refund Request Details
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Review tourist bank account details and deposit proof to process or decline.
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4 bg-sidebar-accent/30 p-4 rounded-xl border border-sidebar-border/40">
                <div>
                  <p className="text-xs text-muted-foreground">Tourist</p>
                  <p className="font-semibold text-sm">{selectedRequest.touristName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Refund Amount</p>
                  <p className="font-bold text-sm text-primary">${selectedRequest.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Booking ID</p>
                  <p className="font-mono text-sm">#{selectedRequest.bookingId}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Package</p>
                  <p className="font-semibold text-sm truncate">{selectedRequest.packageName}</p>
                </div>
              </div>

              {/* Tourist Bank Account Info */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tourist Bank Details</h4>
                <div className="grid grid-cols-2 gap-3 text-sm bg-sidebar-background/60 p-4 rounded-xl border border-sidebar-border/60">
                  <div>
                    <span className="text-muted-foreground text-xs block">Bank Name</span>
                    <span className="font-medium text-white">{selectedRequest.bankName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs block">Account Number</span>
                    <span className="font-mono font-medium text-white">{selectedRequest.accountNo}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs block">Account Holder Name</span>
                    <span className="font-medium text-white">{selectedRequest.accountHolderName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs block">Branch Name</span>
                    <span className="font-medium text-white">{selectedRequest.branchName}</span>
                  </div>
                </div>
              </div>

              {/* Request Reason */}
              {selectedRequest.reason && (
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Reason for refund</span>
                  <div className="p-3 rounded-lg bg-sidebar-accent/20 border border-sidebar-border/30 italic text-sm text-muted-foreground">
                    "{selectedRequest.reason}"
                  </div>
                </div>
              )}

              {/* Status Specific Details */}
              {selectedRequest.status === 'APPROVED' && selectedRequest.refundSlipUrl && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-success">Approved Deposit Slip</span>
                  <a
                    href={selectedRequest.refundSlipUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg border border-success/35 bg-success/5 text-success hover:bg-success/10 text-sm font-semibold"
                  >
                    <span>View Refund Deposit Slip Receipt</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>
              )}

              {selectedRequest.status === 'REJECTED' && (
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-destructive">Rejection Reason</span>
                  <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20 text-sm text-destructive font-semibold">
                    {selectedRequest.reason || 'No reason provided.'}
                  </div>
                </div>
              )}

              {/* Actions for PENDING request */}
              {selectedRequest.status === 'PENDING' && (
                <div className="border-t border-sidebar-border/60 pt-4 space-y-4">
                  {!showDeclineForm ? (
                    <form onSubmit={handleApprove} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white block">
                          Upload Bank Deposit Slip (JPG, PNG or WEBP) *
                        </label>
                        <div className="flex items-center gap-3">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setSlipFile(e.target.files[0]);
                              }
                            }}
                            className="bg-sidebar-background/60 border-sidebar-border/80 text-sm cursor-pointer"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end pt-2">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setShowDeclineForm(true)}
                          className="gap-1 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Ban className="h-3.5 w-3.5" />
                          Decline Request
                        </Button>
                        <Button
                          type="submit"
                          disabled={processing}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                        >
                          {processing ? 'Processing...' : 'Approve & Confirm Deposit'}
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleDecline} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white block">
                          Reason for Rejection *
                        </label>
                        <textarea
                          className="w-full p-3 bg-sidebar-background border border-sidebar-border rounded-lg text-sm text-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          value={declineReason}
                          onChange={(e) => setDeclineReason(e.target.value)}
                          placeholder="Provide the reason for rejecting the request..."
                          rows={3}
                          required
                        />
                      </div>

                      <div className="flex gap-2 justify-end pt-2">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setShowDeclineForm(false)}
                          disabled={processing}
                        >
                          Back to Approve
                        </Button>
                        <Button
                          type="submit"
                          disabled={processing}
                          className="bg-destructive hover:bg-destructive/90 text-white font-bold"
                        >
                          {processing ? 'Processing...' : 'Confirm Reject'}
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Refunds;
