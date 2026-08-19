import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Clock, ShieldAlert, ArrowLeft, Mail, Phone, Copy, Check, Headphones } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface LockedOverlayProps {
  reason?: "pending" | "suspended";
  adminReason?: string | null;
}

const LockedOverlay: React.FC<LockedOverlayProps> = ({ reason = "pending", adminReason }) => {
  const navigate = useNavigate();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const supportEmail = "support@travelhub.com";
  const supportPhone = "077345689348";

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`Copied ${field} to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const pending = reason === "pending";
  const title = pending ? "Dashboard Locked" : "Hotel Suspended";
  const description = pending
    ? "Your hotel is currently under admin review. You can view your dashboard, but all actions are disabled until approval."
    : "Your hotel has been suspended by an administrator. All management actions are disabled until it is reactivated.";
  const statusIcon = pending ? <Clock className="h-10 w-10 text-amber-600" /> : <Lock className="h-10 w-10 text-red-600" />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 sm:p-6 text-center backdrop-blur-[8px] bg-white/40 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className="max-w-md w-full rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-border/50 text-center my-auto"
      >
        <div className="mb-5 flex justify-center">
          <div className="relative">
            <div className={`absolute inset-0 animate-ping rounded-full ${pending ? "bg-amber-400/20" : "bg-red-400/20"}`} />
            <div className={`relative rounded-full p-4 ${pending ? "bg-amber-50" : "bg-red-50"}`}>
              {statusIcon}
            </div>
          </div>
        </div>

        <h2 className="mb-2 text-2xl font-bold text-foreground tracking-tight">
          {title}
        </h2>

        <p className="mb-5 text-[14px] leading-relaxed text-muted-foreground">
          {description}
        </p>

        {adminReason && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50/90 p-4 text-left">
            <p className="text-[11px] font-bold uppercase tracking-wider text-red-700 mb-1">
              {pending ? "Admin Feedback" : "Suspension Reason"}
            </p>
            <p className="text-xs text-red-900 leading-relaxed font-medium">
              {adminReason}
            </p>
          </div>
        )}

        <div className="space-y-2.5 mb-5 text-left">
          <div className="flex items-center gap-3 rounded-xl bg-amber-50/80 border border-amber-100 p-3 text-left">
            <Clock className="h-4 w-4 text-amber-600 shrink-0" />
            <p className="text-xs font-medium text-foreground">
              {pending ? "Reviews typically take 24–48 hours." : "Contact admin support to resolve suspension."}
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-amber-50/80 border border-amber-100 p-3 text-left">
            <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
            <p className="text-xs font-medium text-foreground">
              {pending ? "Data entry is enabled automatically after approval." : "Data entry & bookings will resume upon reactivation."}
            </p>
          </div>
        </div>

        {/* Contact Info Box */}
        <div className="mb-6 rounded-2xl border border-sky-100 bg-sky-50/60 p-4 text-left">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <Headphones className="h-4 w-4 text-sky-600" />
              <span className="text-xs font-bold text-sky-950">Support & Inquiries</span>
            </div>
            <span className="text-[10px] font-semibold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
              Help Center
            </span>
          </div>

          <div className="space-y-2">
            {/* Email link */}
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white border border-sky-100 hover:border-sky-200 transition">
              <a
                href={`mailto:${supportEmail}?subject=${encodeURIComponent("Hotel Suspension Inquiry")}`}
                className="flex items-center gap-2 min-w-0 flex-1 hover:text-sky-600 transition"
              >
                <Mail className="h-4 w-4 text-sky-500 shrink-0" />
                <span className="text-xs font-semibold text-slate-800 truncate">{supportEmail}</span>
              </a>
              <button
                type="button"
                onClick={() => copyToClipboard(supportEmail, "Email")}
                className="p-1.5 rounded-lg hover:bg-sky-50 text-slate-400 hover:text-sky-600 transition"
                title="Copy Email"
              >
                {copiedField === "Email" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>

            {/* Phone link */}
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white border border-emerald-100 hover:border-emerald-200 transition">
              <a
                href={`tel:${supportPhone}`}
                className="flex items-center gap-2 min-w-0 flex-1 hover:text-emerald-600 transition"
              >
                <Phone className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-xs font-semibold text-slate-800 truncate">{supportPhone}</span>
              </a>
              <button
                type="button"
                onClick={() => copyToClipboard(supportPhone, "Phone")}
                className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition"
                title="Copy Phone Number"
              >
                {copiedField === "Phone" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
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
