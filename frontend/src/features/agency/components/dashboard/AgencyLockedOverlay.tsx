import React from 'react';
import { motion } from 'framer-motion';
import { Lock, ShieldAlert, AlertTriangle, LogOut, Mail, HelpCircle } from 'lucide-react';
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
            onClick={() => window.open('mailto:support@travelhub.com?subject=Agency%20Suspension%20Inquiry%20-%20' + encodeURIComponent(agencyName || 'Agency'), '_blank')}
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
    </motion.div>
  );
};
