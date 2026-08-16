import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ImagePlus, X, Loader2, ScanLine } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { createWorker } from "tesseract.js";
import { validateNIC } from "@/utils/nicValidation";
import { AppShell } from "@/features/hotelOwner/components/AppShell";
import { ChangePasswordCard } from "@/components/common/ChangePasswordCard";
import {
  getInitials,
  updateProfile,
  uploadAvatar,
  uploadNicImage,
  useProfile,
  mutateProfile,
} from "@/features/hotelOwner/services/profile-store";

// ── Validation schema ─────────────────────────────────────────────────────────
const schema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().max(120).optional(),
  phone: z
    .string()
    .trim()
    .min(6, "Phone number is required")
    .max(30)
    .regex(/^[0-9+\-\s()]+$/, "Use digits, spaces, +, -, ()"),
  nicNumber: z.string().trim().optional(),
});

type FormValues = z.infer<typeof schema> & { avatar: string; nicNumber: string; nicImage: string };

export default function SettingsPage() {
  const profile = useProfile();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const nicFileRef = useRef<HTMLInputElement>(null);

  const [values, setValues] = useState<FormValues>({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    avatar: profile.avatar,
    nicNumber: profile.nicNumber,
    nicImage: profile.nicImage,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Sync form when profile loads from API
  useEffect(() => {
    setValues({
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      avatar: profile.avatar,
      nicNumber: profile.nicNumber,
      nicImage: profile.nicImage,
    });
  }, [profile.name, profile.email, profile.phone, profile.avatar, profile.nicNumber, profile.nicImage]);

  const setField = <K extends keyof FormValues>(k: K, v: FormValues[K]) => {
    setValues((prev) => ({ ...prev, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  // ── Handle photo upload ─────────────────────────────────────────────────────
  const handleFile = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Image must be under 3 MB.");
      return;
    }

    setUploadingPhoto(true);
    try {
      const updated = await uploadAvatar(file);
      mutateProfile(updated);
      setField("avatar", updated.avatar);
      toast.success("Profile photo updated.");
    } catch {
      toast.error("Failed to upload photo. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  // ── Handle NIC scan ─────────────────────────────────────────────────────────
  const handleScanNIC = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    const toastId = toast.loading("Scanning NIC...");

    try {
      const worker = await createWorker("eng");
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();

      const oldNicMatch = text.match(/[0-9]{9}[vVxX]/);
      const newNicMatch = text.match(/[0-9]{12}/);
      const extractedNic = (newNicMatch ? newNicMatch[0] : (oldNicMatch ? oldNicMatch[0] : "")).toUpperCase();

      if (extractedNic) {
        const validation = validateNIC(extractedNic);
        if (validation.isValid) {
          toast.loading("NIC verified. Uploading image...", { id: toastId });
          const imageUrl = await uploadNicImage(file);
          setValues((prev) => ({
            ...prev,
            nicNumber: extractedNic,
            nicImage: imageUrl,
          }));
          toast.success("NIC scanned and uploaded successfully!", { id: toastId });
        } else {
          toast.error("NIC detected but format is invalid.", { id: toastId });
        }
      } else {
        toast.error("Could not detect NIC number. Please try a clearer photo or enter manually.", { id: toastId });
      }
    } catch {
      toast.error("Scanning failed. Please enter NIC manually.", { id: toastId });
    } finally {
      setIsScanning(false);
      if (nicFileRef.current) nicFileRef.current.value = "";
    }
  };

  // ── Handle form save ────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = schema.safeParse(values);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof FormValues, string>> = {};
      for (const issue of result.error.issues) {
        const k = issue.path[0] as keyof FormValues;
        if (!fieldErrors[k]) fieldErrors[k] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setSaving(true);
    try {
      const updated = await updateProfile({
        name: result.data.name,
        phone: result.data.phone,
        nicNumber: values.nicNumber || undefined,
        nicImage: values.nicImage || undefined,
      });
      mutateProfile(updated);
      toast.success("Profile updated successfully.");
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <button
        type="button"
        onClick={() => navigate("/hotelowner")}
        className="group inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
        Dashboard
      </button>

      <div className="mt-5 mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Profile Settings
        </h1>
        <p className="mt-2 text-[15px] text-muted-foreground">
          Update your account details. Changes are saved directly to TravelHUB.
        </p>
      </div>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
        className="rounded-2xl bg-card p-6 shadow-md sm:p-8"
      >
        {/* ── Avatar ─────────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-5 border-b border-border pb-6">
          <div className="relative">
            {values.avatar ? (
              <img
                src={values.avatar}
                alt="Profile"
                className="h-20 w-20 rounded-full object-cover ring-2 ring-border"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-xl font-semibold text-white ring-2 ring-border">
                {getInitials(values.name || "U")}
              </div>
            )}
            {uploadingPhoto && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Profile photo</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              PNG or JPG, up to 3 MB. Optional.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              <button
                type="button"
                disabled={uploadingPhoto}
                onClick={() => fileRef.current?.click()}
                className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-border bg-card px-3 text-xs font-semibold text-foreground shadow-sm transition hover:bg-secondary disabled:opacity-60"
              >
                <ImagePlus className="h-3.5 w-3.5" />
                {uploadingPhoto ? "Uploading…" : values.avatar ? "Change photo" : "Upload photo"}
              </button>
              {values.avatar && !uploadingPhoto && (
                <button
                  type="button"
                  onClick={() => setField("avatar", "")}
                  className="inline-flex h-9 items-center gap-1.5 rounded-[10px] px-3 text-xs font-semibold text-destructive transition hover:bg-destructive/10"
                >
                  <X className="h-3.5 w-3.5" />
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Fields ─────────────────────────────────────────────────────────── */}
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label="Full Name" error={errors.name} required>
            <input
              type="text"
              value={values.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="Your full name"
              className={inputClass(!!errors.name)}
            />
          </Field>

          <Field label="Phone Number" error={errors.phone} required>
            <input
              type="tel"
              value={values.phone}
              onChange={(e) => setField("phone", e.target.value)}
              placeholder="+94 77 123 4567"
              className={inputClass(!!errors.phone)}
            />
          </Field>

          <Field label="Email Address" error={errors.email} required className="md:col-span-2">
            <input
              type="email"
              value={values.email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="you@travelhub.lk"
              className={`${inputClass(!!errors.email)} bg-muted/50 cursor-not-allowed`}
              readOnly
              title="Email cannot be changed here."
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Email is managed by your account and cannot be edited here.
            </p>
          </Field>

          {/* ── NIC Number with Scan ────────────────────────────────────────── */}
          <Field label="NIC Number" error={errors.nicNumber} className="md:col-span-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={values.nicNumber}
                onChange={(e) => setField("nicNumber", e.target.value.toUpperCase())}
                placeholder="e.g. 199912345678 or 991234567V"
                className={`${inputClass(!!errors.nicNumber)} flex-1`}
              />
              <button
                type="button"
                onClick={() => nicFileRef.current?.click()}
                disabled={isScanning}
                className="inline-flex h-11 items-center gap-1.5 rounded-[10px] border border-border bg-slate-700 hover:bg-slate-800 px-4 text-sm font-semibold text-white shadow-sm transition disabled:opacity-60"
              >
                {isScanning ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ScanLine className="h-4 w-4" />
                )}
                {isScanning ? "Scanning..." : "Add NIC Image"}
              </button>
            </div>
            <input
              ref={nicFileRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleScanNIC}
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Format: 9 digits + V/X or 12 digits. Click Add NIC Image to auto-fill and upload.
            </p>
            {values.nicImage && (
              <div className="mt-3">
                <p className="text-[12px] font-medium text-muted-foreground mb-1">Uploaded NIC Image:</p>
                <img src={values.nicImage} alt="NIC" className="h-24 w-auto rounded-md border shadow-sm object-cover" />
              </div>
            )}
          </Field>
        </div>

        {/* ── Actions ────────────────────────────────────────────────────────── */}
        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate("/hotelowner")}
            className="inline-flex h-11 items-center justify-center rounded-[10px] border border-border bg-card px-5 text-sm font-semibold text-foreground shadow-sm transition hover:bg-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || uploadingPhoto}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition hover:bg-primary/90 hover:shadow-lg active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </motion.form>

      <div className="mt-8">
        <ChangePasswordCard />
      </div>
    </AppShell>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function inputClass(hasError: boolean) {
  return `block h-11 w-full rounded-[10px] border bg-card px-3.5 text-sm text-foreground placeholder:text-muted-foreground/70 shadow-sm outline-none transition-all duration-150 ${
    hasError
      ? "border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/15"
      : "border-border focus:border-primary focus:ring-[3px] focus:ring-primary/15"
  }`;
}

function Field({
  label,
  error,
  required,
  className = "",
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-[13px] font-medium tracking-wide text-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
