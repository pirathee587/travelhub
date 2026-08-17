import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  DollarSign, 
  FileText, 
  Upload, 
  ShieldCheck, 
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { adminPayoutApi } from '../services/payouts';

interface FinanceStats {
  totalGrossMarketplaceVolume: number;
  totalPlatformCommissionRevenue: number;
  totalPlatformCancellationFees: number;
  totalPlatformNetRevenue: number;
  totalPendingAgencyEscrow: number;
  totalAgencyPayoutsCompleted: number;
  pendingPayoutRequestsCount: number;
}

interface PayoutItem {
  id: number;
  agentId: number;
  agencyName: string;
  amount: number;
  bankName: string;
  accountNo: string;
  accountHolderName: string;
  branchName?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  transferSlipUrl?: string;
  createdAt: string;
}

export default function PayoutApprovals() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [payouts, setPayouts] = useState<PayoutItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('PENDING');

  // Approval / Rejection Modal State
  const [selectedPayout, setSelectedPayout] = useState<PayoutItem | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, payoutsRes] = await Promise.all([
        adminPayoutApi.getFinanceStats(),
        adminPayoutApi.getAllPayouts(filterStatus === 'ALL' ? '' : filterStatus)
      ]);

      if (statsRes?.data) setStats(statsRes.data);
      if (payoutsRes?.data) setPayouts(payoutsRes.data);
    } catch (err) {
      console.error("Failed to load admin payouts data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  const handleApproveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayout) return;
    setProcessing(true);
    setMsg(null);

    try {
      const res = await adminPayoutApi.approvePayout(selectedPayout.id, slipFile || undefined);
      if (res?.success) {
        setMsg({ type: 'success', text: `Payout #${selectedPayout.id} approved successfully!` });
        setSelectedPayout(null);
        setActionType(null);
        setSlipFile(null);
        loadData();
      } else {
        setMsg({ type: 'error', text: res?.message || 'Failed to approve payout' });
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Error approving payout' });
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayout) return;
    setProcessing(true);
    setMsg(null);

    try {
      const res = await adminPayoutApi.rejectPayout(selectedPayout.id, rejectionReason);
      if (res?.success) {
        setMsg({ type: 'success', text: `Payout #${selectedPayout.id} rejected and funds refunded to agency.` });
        setSelectedPayout(null);
        setActionType(null);
        setRejectionReason('');
        loadData();
      } else {
        setMsg({ type: 'error', text: res?.message || 'Failed to reject payout' });
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Error rejecting payout' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-2xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="w-7 h-7 text-primary" /> Platform Finance & Agency Payout Approvals
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review agency withdrawal requests, track 5% platform commission revenues, and upload deposit slips.
          </p>
        </div>
        <button 
          onClick={loadData}
          className="p-2.5 rounded-xl border border-input hover:bg-accent text-foreground transition-colors self-start sm:self-auto"
          title="Refresh Data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Notification Msg */}
      {msg && (
        <div className={`p-4 rounded-xl flex items-center gap-2 text-sm ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300' : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300'}`}>
          {msg.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-5 bg-card border rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
            <span>Gross Volume (GMV)</span>
            <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg"><TrendingUp className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-extrabold mt-3 text-foreground">
            ${stats?.totalGrossMarketplaceVolume?.toLocaleString() || '0.00'}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Total completed booking sales.</p>
        </div>

        <div className="p-5 bg-card border rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
            <span>Net Platform Revenue</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg"><DollarSign className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-extrabold mt-3 text-emerald-600 dark:text-emerald-400">
            ${stats?.totalPlatformNetRevenue?.toLocaleString() || '0.00'}
          </div>
          <p className="text-xs text-muted-foreground mt-1">5% commission + 20% cancellation fees.</p>
        </div>

        <div className="p-5 bg-card border rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
            <span>Pending Escrow Held</span>
            <div className="p-2 bg-amber-500/10 text-amber-600 rounded-lg"><Clock className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-extrabold mt-3 text-amber-600 dark:text-amber-400">
            ${stats?.totalPendingAgencyEscrow?.toLocaleString() || '0.00'}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Held for active/upcoming trips.</p>
        </div>

        <div className="p-5 bg-card border rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
            <span>Total Payouts Completed</span>
            <div className="p-2 bg-purple-500/10 text-purple-600 rounded-lg"><ShieldCheck className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-extrabold mt-3 text-foreground">
            ${stats?.totalAgencyPayoutsCompleted?.toLocaleString() || '0.00'}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Disbursed to agencies.</p>
        </div>
      </div>

      {/* Payout Approval List */}
      <div className="bg-card border rounded-2xl shadow-sm overflow-hidden space-y-4">
        <div className="p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Agency Payout Requests</h2>
            <p className="text-xs text-muted-foreground">Approve bank transfer requests and upload deposit receipts.</p>
          </div>
          
          {/* Filters */}
          <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-xl border">
            {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${filterStatus === st ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {st} {st === 'PENDING' && stats?.pendingPayoutRequestsCount ? `(${stats.pendingPayoutRequestsCount})` : ''}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b">
              <tr>
                <th className="px-6 py-3.5">ID</th>
                <th className="px-6 py-3.5">Agency</th>
                <th className="px-6 py-3.5">Amount</th>
                <th className="px-6 py-3.5">Bank Account Details</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Submitted Date</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payouts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    No payout requests found matching status "{filterStatus}".
                  </td>
                </tr>
              ) : (
                payouts.map(p => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">#PO-{p.id}</td>
                    <td className="px-6 py-4 font-bold text-foreground">{p.agencyName}</td>
                    <td className="px-6 py-4 font-extrabold text-foreground">${p.amount.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground">{p.bankName}</div>
                      <div className="text-xs text-muted-foreground font-mono">Acc: {p.accountNo}</div>
                      <div className="text-xs text-muted-foreground">Holder: {p.accountHolderName} {p.branchName ? `(${p.branchName})` : ''}</div>
                    </td>
                    <td className="px-6 py-4">
                      {p.status === 'APPROVED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                        </span>
                      )}
                      {p.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          <Clock className="w-3.5 h-3.5" /> Awaiting Review
                        </span>
                      )}
                      {p.status === 'REJECTED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
                          <AlertCircle className="w-3.5 h-3.5" /> Rejected
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {new Date(p.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {p.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setSelectedPayout(p); setActionType('APPROVE'); }}
                            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => { setSelectedPayout(p); setActionType('REJECT'); }}
                            className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      ) : p.transferSlipUrl ? (
                        <a 
                          href={p.transferSlipUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-semibold"
                        >
                          <FileText className="w-3.5 h-3.5" /> Transfer Slip
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">Completed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Modal (Approve / Reject) */}
      {selectedPayout && actionType && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl border shadow-xl overflow-hidden p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-bold text-foreground">
                {actionType === 'APPROVE' ? 'Approve Payout Request' : 'Reject Payout Request'}
              </h3>
              <button 
                onClick={() => { setSelectedPayout(null); setActionType(null); }}
                className="text-muted-foreground hover:text-foreground text-xl font-bold px-2"
              >
                ×
              </button>
            </div>

            <div className="p-4 bg-muted/40 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Agency:</span>
                <span className="font-bold text-foreground">{selectedPayout.agencyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payout Amount:</span>
                <span className="font-extrabold text-foreground">${selectedPayout.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bank:</span>
                <span className="font-medium text-foreground">{selectedPayout.bankName} ({selectedPayout.accountNo})</span>
              </div>
            </div>

            {actionType === 'APPROVE' ? (
              <form onSubmit={handleApproveSubmit} className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Upload Transfer Deposit Slip (Optional)
                  </label>
                  <input 
                    type="file" 
                    accept="image/*,.pdf"
                    onChange={e => setSlipFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => { setSelectedPayout(null); setActionType(null); }}
                    className="px-4 py-2 rounded-xl border text-xs font-semibold text-foreground hover:bg-accent"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="px-5 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50"
                  >
                    {processing ? 'Approving...' : 'Confirm Approval'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRejectSubmit} className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Rejection Reason *
                  </label>
                  <textarea 
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                    placeholder="Provide a clear reason for rejecting this payout request..."
                    required
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl border border-input bg-background text-foreground text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => { setSelectedPayout(null); setActionType(null); }}
                    className="px-4 py-2 rounded-xl border text-xs font-semibold text-foreground hover:bg-accent"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="px-5 py-2 bg-red-600 text-white text-xs font-semibold rounded-xl hover:bg-red-700 transition-all disabled:opacity-50"
                  >
                    {processing ? 'Rejecting...' : 'Confirm Rejection'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
