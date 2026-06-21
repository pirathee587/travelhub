import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Clock, ShieldAlert } from 'lucide-react';

const LockedOverlay: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 text-center backdrop-blur-[8px] bg-white/40"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className="max-w-md w-full rounded-3xl bg-white p-8 shadow-2xl border border-border/50"
      >
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-amber-400/20" />
            <div className="relative rounded-full bg-amber-50 p-4">
              <Lock className="h-10 w-10 text-amber-600" />
            </div>
          </div>
        </div>

        <h2 className="mb-3 font-display text-2xl font-bold text-foreground">
          Dashboard Locked
        </h2>
        
        <p className="mb-8 text-[15px] leading-relaxed text-muted-foreground">
          Your hotel is currently <span className="font-semibold text-amber-600 italic">under admin review</span>. 
          You can view your dashboard, but you cannot perform any actions until it is approved.
        </p>

        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-xl bg-secondary/50 p-4 text-left">
            <Clock className="h-5 w-5 text-amber-600 shrink-0" />
            <p className="text-xs font-medium text-foreground">
              Reviews typically take 24-48 hours.
            </p>
          </div>
          
          <div className="flex items-center gap-3 rounded-xl bg-secondary/50 p-4 text-left">
            <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0" />
            <p className="text-xs font-medium text-foreground">
              Data entry will be enabled automatically after approval.
            </p>
          </div>
        </div>

        <button 
          disabled
          className="mt-8 w-full rounded-xl bg-muted py-3 text-sm font-semibold text-muted-foreground cursor-not-allowed"
        >
          Waiting for Approval
        </button>
      </motion.div>
    </motion.div>
  );
};

export default LockedOverlay;
