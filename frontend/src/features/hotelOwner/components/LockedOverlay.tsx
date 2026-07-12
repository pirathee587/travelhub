import React from "react";
import { motion } from "framer-motion";
import { Lock, Clock, ShieldAlert, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LockedOverlayProps {
  reason?: "pending" | "suspended";
}

const LockedOverlay: React.FC<LockedOverlayProps> = ({ reason = "pending" }) => {
  const navigate = useNavigate();
  const pending = reason === "pending";
  const title = pending ? "Dashboard Locked" : "Hotel Suspended";
  const description = pending
    ? "Your hotel is currently under admin review. You can view your dashboard, but all actions are disabled until approval."
    : "Your hotel has been suspended by an administrator. All management actions are disabled until it is reactivated.";
  const actionLabel = pending ? "Waiting for Approval…" : "Suspended by Admin";
  const statusIcon = pending ? <Clock className="h-10 w-10 text-amber-600" /> : <Lock className="h-10 w-10 text-red-600" />;

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
            <div className={`absolute inset-0 animate-ping rounded-full ${pending ? "bg-amber-400/20" : "bg-red-400/20"}`} />
            <div className={`relative rounded-full p-4 ${pending ? "bg-amber-50" : "bg-red-50"}`}>
              {statusIcon}
            </div>
          </div>
        </div>

        <h2 className="mb-3 text-2xl font-bold text-foreground">
          Dashboard Locked
        </h2>

        <p className="mb-8 text-[15px] leading-relaxed text-muted-foreground">
          {description}
        </p>

        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-xl bg-amber-50 p-4 text-left">
            <Clock className="h-5 w-5 text-amber-600 shrink-0" />
            <p className="text-xs font-medium text-foreground">
              Reviews typically take 24–48 hours.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-amber-50 p-4 text-left">
            <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0" />
            <p className="text-xs font-medium text-foreground">
              Data entry is enabled automatically after approval.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <button
            disabled
            className="w-full rounded-xl bg-muted py-3 text-sm font-semibold text-muted-foreground cursor-not-allowed"
          >
            {actionLabel}
          </button>
          
          <button
            onClick={() => navigate("/hotelowner")}
            className="group flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-white py-3 text-sm font-semibold text-foreground shadow-sm transition hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Welcome Page
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LockedOverlay;
