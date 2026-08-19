import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ShieldAlert, AlertTriangle, LogOut, Mail, HelpCircle, Phone, Copy, Check, X, Headphones } from 'lucide-react';
import { Button } from '@/components/common/ui/button';
import { useAuth } from '@/context/AuthContext';

interface AgencyLockedOverlayProps {
  adminReason?: string | null;
  agencyName?: string;
}

export const AgencyLockedOverlay: React.FC<AgencyLockedOverlayProps> = ({
  adminReason,
  agencyName,
}) => {
  const { logout } = useAuth();
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const supportEmail = 'Travelhub@gmail.com';
  const supportPhone = '0775678956';

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 sm:p-6 text-center backdrop-blur-md bg-background/80"
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 120 }}
        className="max-w-lg w-full rounded-3xl bg-card border border-destructive/30 shadow-2xl p-6 sm:p-8 relative overflow-hidden"
      >
        {/* Top subtle alert accent */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-red-500 via-rose-500 to-amber-500" />

        {/* Pulsing Lock Icon */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-destructive/20" />
            <div className="relative rounded-full p-4 bg-destructive/10 text-destructive border border-destructive/20 shadow-sm">
              <Lock className="h-10 w-10 text-destructive" />
            </div>
          </div>
        </div>

        {/* Agency and Title */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-destructive/10 text-destructive border border-destructive/20 mb-3">
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>Account Suspended</span>
        </div>

        <h2 className="text-2xl font-bold text-foreground tracking-tight mb-2">
          Agency Dashboard Locked
        </h2>

        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          {agencyName ? <strong>{agencyName}</strong> : 'Your agency account'} has been suspended by a platform administrator.
          All management actions, bookings, packages, and vehicle dispatches are temporarily disabled.
        </p>

        {/* Admin Suspension Reason Box */}
        <div className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/5 dark:bg-destructive/10 p-4 text-left shadow-inner">
          <div className="flex items-center gap-2 mb-1.5">
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
            <p className="text-xs font-bold uppercase tracking-wider text-destructive">
              Reason Provided by Administrator
            </p>
          </div>
          <p className="text-sm text-foreground/90 font-medium leading-relaxed bg-background/60 dark:bg-background/40 p-3 rounded-xl border border-destructive/15">
            {adminReason && adminReason.trim().length > 0
              ? adminReason
              : 'Your account was suspended due to compliance review or policy adherence. Please reach out to TravelHub administration for further clarification.'}
          </p>
        </div>

        {/* Info points */}
        <div className="space-y-2.5 mb-8 text-left">
          <div className="flex items-start gap-3 rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground border border-border/50">
            <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              Your tour packages and vehicle listings are hidden from public tourist discovery while suspended.
            </span>
          </div>
          <div className="flex items-start gap-3 rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground border border-border/50">
            <HelpCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span>
              Once resolved with administrators, your account and listings will be restored immediately.
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            className="flex-1 gap-2 rounded-xl border-border text-foreground hover:bg-muted"
            onClick={() => setShowSupportModal(true)}
          >
            <Mail className="h-4 w-4" />
            Contact Support
          </Button>

          <Button
            variant="destructive"
            className="flex-1 gap-2 rounded-xl"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </Button>
        </div>
      </motion.div>

      {/* ── Contact Support Modal ────────────────────────────────────── */}
      <AnimatePresence>
        {showSupportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-card border border-gray-200 dark:border-border rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative text-left"
            >
              {/* Header with Close */}
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-border pb-4 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/50 text-[#0ea5e9] flex items-center justify-center">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-foreground">Contact Platform Support</h3>
                    <p className="text-xs text-gray-500">Reach TravelHub admin support team</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSupportModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-muted dark:hover:bg-muted/80 flex items-center justify-center text-gray-500 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Contact Info Cards */}
              <div className="space-y-3.5 mb-6">
                {/* Email Option */}
                <div className="p-4 rounded-2xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/50 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-card text-sky-600 flex items-center justify-center shrink-0 shadow-2xs border border-sky-100">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Official Email</span>
                      <a
                        href={`mailto:${supportEmail}?subject=${encodeURIComponent(`Agency Suspension Inquiry - ${agencyName || 'Agency'}`)}`}
                        className="text-sm font-bold text-sky-600 hover:underline truncate block"
                      >
                        {supportEmail}
                      </a>
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(supportEmail, 'email')}
                    className="p-2 rounded-xl bg-white dark:bg-card hover:bg-sky-100 text-gray-600 hover:text-sky-600 border border-sky-100 transition shrink-0 cursor-pointer"
                    title="Copy Email"
                  >
                    {copiedField === 'email' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Phone Option */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-card text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs border border-emerald-100">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Hotline & Phone</span>
                      <a
                        href={`tel:${supportPhone}`}
                        className="text-sm font-bold text-emerald-700 hover:underline truncate block"
                      >
                        {supportPhone}
                      </a>
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(supportPhone, 'phone')}
                    className="p-2 rounded-xl bg-white dark:bg-card hover:bg-emerald-100 text-gray-600 hover:text-emerald-600 border border-emerald-100 transition shrink-0 cursor-pointer"
                    title="Copy Phone Number"
                  >
                    {copiedField === 'phone' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5">
                <a
                  href={`mailto:${supportEmail}?subject=${encodeURIComponent(`Agency Suspension Inquiry - ${agencyName || 'Agency'}`)}`}
                  className="flex-1 py-2.5 px-4 bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <Mail className="w-4 h-4" />
                  Send Email
                </a>
                <a
                  href={`tel:${supportPhone}`}
                  className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <Phone className="w-4 h-4" />
                  Call Now
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
