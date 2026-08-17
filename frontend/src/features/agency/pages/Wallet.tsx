import React, { useEffect, useState } from 'react';
import { 
  Wallet as WalletIcon, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  Building2, 
  FileText, 
  ShieldCheck, 
  RefreshCw,
  Info
} from 'lucide-react';
import { walletApi } from '../services/wallet';
import { DashboardLayout } from '@/features/agency/components/dashboard/DashboardLayout';

interface Transaction {
  id: number;
  bookingId?: number;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
}

interface PayoutRequest {
  id: number;
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

export default function Wallet() {
  const [loading, setLoading] = useState(true);
  const [availableBalance, setAvailableBalance] = useState<number>(0);
  const [pendingEscrow, setPendingEscrow] = useState<number>(0);
  const [totalWithdrawn, setTotalWithdrawn] = useState<number>(0);
  const [commissionRate, setCommissionRate] = useState<number>(5.0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState<string>('');
  const [bankName, setBankName] = useState<string>('');
  const [accountNo, setAccountNo] = useState<string>('');
  const [accountHolderName, setAccountHolderName] = useState<string>('');
  const [branchName, setBranchName] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  const loadWalletData = async () => {
    setLoading(true);
    try {
      const [walletRes, payoutsRes] = await Promise.all([
        walletApi.getWallet(),
        walletApi.getPayoutRequests()
      ]);

      if (walletRes?.data) {
        setAvailableBalance(walletRes.data.availableBalance || 0);
        setPendingEscrow(walletRes.data.pendingEscrowBalance || 0);
        setTotalWithdrawn(walletRes.data.totalWithdrawn || 0);
        setCommissionRate(walletRes.data.platformCommissionRate || 5.0);
        setTransactions(walletRes.data.recentTransactions || []);
      }

      if (payoutsRes?.data) {
        setPayouts(payoutsRes.data || []);
      }
    } catch (err) {
      console.error("Failed to load wallet data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWalletData();
  }, []);

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Please enter a valid payout amount');
      return;
    }
    if (numAmount > availableBalance) {
      setErrorMsg(`Amount cannot exceed available wallet balance ($${availableBalance.toFixed(2)})`);
      return;
    }
    if (!bankName || !accountNo || !accountHolderName) {
      setErrorMsg('Please fill in all required bank details');
      return;
    }

    setSubmitting(true);
    try {
      const res = await walletApi.requestPayout({
        amount: numAmount,
        bankName,
        accountNo,
        accountHolderName,
        branchName
      });

      if (res?.success) {
        setSuccessMsg('Payout request submitted successfully!');
        setIsModalOpen(false);
        setAmount('');
        loadWalletData();
      } else {
        setErrorMsg(res?.message || 'Failed to submit payout request');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred submitting payout request');
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'TRIP_COMPLETED_CREDIT':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> Trip Payout (95%)</span>;
      case 'COMMISSION_DEDUCTION':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400"><Info className="w-3.5 h-3.5" /> Platform Fee (5%)</span>;
      case 'CANCELLATION_COMPENSATION':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400"><ShieldCheck className="w-3.5 h-3.5" /> Late Fee Share (80%)</span>;
      case 'PAYOUT_WITHDRAWAL_REQUEST':
      case 'PAYOUT_APPROVED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400"><ArrowUpRight className="w-3.5 h-3.5" /> Bank Withdrawal</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-500/10 text-gray-600 dark:text-gray-400">{type}</span>;
    }
  };

  return (
    <DashboardLayout 
      title="Agency Wallet & Payouts" 
      subtitle="Track net earnings, escrow balances for active trips, and request bank withdrawals."
    >
      <div className="space-y-8">
        {/* Actions Bar */}
        <div className="flex items-center justify-end gap-3">
          <button 
            onClick={loadWalletData}
            className="p-2.5 rounded-xl border border-input hover:bg-accent text-foreground transition-colors bg-card"
            title="Refresh Wallet"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-all shadow-md hover:shadow-lg text-sm"
          >
            <ArrowUpRight className="w-4 h-4" /> Request Payout
          </button>
        </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Info Notice Banner */}
      <div className="p-4 bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-blue-900 dark:text-blue-200 leading-relaxed">
          <span className="font-semibold">How Financial Settlements Work:</span> Booking payments are safely held in 
          <span className="font-semibold"> Escrow</span> during active trips. Upon trip completion, the platform retains a 
          <span className="font-semibold text-primary"> {commissionRate}% commission fee</span>, and the remaining 
          <span className="font-semibold text-emerald-600 dark:text-emerald-400"> 95% net earnings</span> are instantly released to your Available Balance for withdrawal. In late cancellations, agencies receive an 80% share of the cancellation fee.
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Available Balance */}
        <div className="p-6 bg-gradient-to-br from-emerald-500/10 via-card to-card border border-emerald-500/20 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Available for Withdrawal</span>
            <div className="p-2.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold tracking-tight text-foreground">
              ${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Ready to be transferred to your bank account.</p>
        </div>

        {/* Pending Escrow */}
        <div className="p-6 bg-gradient-to-br from-amber-500/10 via-card to-card border border-amber-500/20 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Pending Escrow (Active Trips)</span>
            <div className="p-2.5 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold tracking-tight text-foreground">
              ${pendingEscrow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Releases upon completion of upcoming tours.</p>
        </div>

        {/* Total Lifetime Withdrawn */}
        <div className="p-6 bg-gradient-to-br from-blue-500/10 via-card to-card border border-blue-500/20 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Total Lifetime Withdrawn</span>
            <div className="p-2.5 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold tracking-tight text-foreground">
              ${totalWithdrawn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Total funds successfully transferred to bank.</p>
        </div>
      </div>

      {/* Payout Requests Section */}
      <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" /> Bank Withdrawal History
          </h2>
          <span className="text-xs text-muted-foreground">{payouts.length} Requests</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b">
              <tr>
                <th className="px-6 py-3.5">ID</th>
                <th className="px-6 py-3.5">Amount</th>
                <th className="px-6 py-3.5">Bank Details</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5 text-right">Deposit Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payouts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No payout requests submitted yet.
                  </td>
                </tr>
              ) : (
                payouts.map(p => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs">#PO-{p.id}</td>
                    <td className="px-6 py-4 font-bold text-foreground">${p.amount.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{p.bankName}</div>
                      <div className="text-xs text-muted-foreground">{p.accountNo} ({p.accountHolderName})</div>
                    </td>
                    <td className="px-6 py-4">
                      {p.status === 'APPROVED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                        </span>
                      )}
                      {p.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          <Clock className="w-3.5 h-3.5" /> Pending Review
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
                      {p.transferSlipUrl ? (
                        <a 
                          href={p.transferSlipUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-semibold"
                        >
                          <FileText className="w-3.5 h-3.5" /> View Slip
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">--</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Financial Transactions Audit Ledger */}
      <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" /> Wallet Financial Ledger
          </h2>
          <span className="text-xs text-muted-foreground">{transactions.length} Transactions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b">
              <tr>
                <th className="px-6 py-3.5">Txn ID</th>
                <th className="px-6 py-3.5">Type</th>
                <th className="px-6 py-3.5">Description</th>
                <th className="px-6 py-3.5">Amount</th>
                <th className="px-6 py-3.5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (
                transactions.map(t => (
                  <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">#TXN-{t.id}</td>
                    <td className="px-6 py-4">{getTypeBadge(t.type)}</td>
                    <td className="px-6 py-4 text-foreground font-medium">{t.description}</td>
                    <td className={`px-6 py-4 font-bold ${t.amount >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                      {t.amount >= 0 ? `+$${t.amount.toFixed(2)}` : `-$${Math.abs(t.amount).toFixed(2)}`}
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {new Date(t.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payout Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-lg rounded-2xl border shadow-xl overflow-hidden p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-primary" /> Request Bank Withdrawal
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-xl font-bold px-2"
              >
                ×
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleRequestPayout} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Withdrawal Amount (USD) * (Available: ${availableBalance.toFixed(2)})
                </label>
                <input 
                  type="number" 
                  step="0.01"
                  max={availableBalance}
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="e.g. 500.00"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Bank Name *</label>
                <input 
                  type="text" 
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  placeholder="e.g. Commercial Bank / HSBC"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Account Number *</label>
                <input 
                  type="text" 
                  value={accountNo}
                  onChange={e => setAccountNo(e.target.value)}
                  placeholder="e.g. 8001234567"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Account Holder Name *</label>
                <input 
                  type="text" 
                  value={accountHolderName}
                  onChange={e => setAccountHolderName(e.target.value)}
                  placeholder="e.g. Pinnacle Travels Ltd"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Branch Name</label>
                <input 
                  type="text" 
                  value={branchName}
                  onChange={e => setBranchName(e.target.value)}
                  placeholder="e.g. Colombo Main Branch"
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-input text-foreground hover:bg-accent font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-all text-xs disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}
