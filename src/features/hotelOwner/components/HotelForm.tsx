import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ImagePlus, Star, X } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { DISTRICTS, type District, type Hotel } from "@/features/hotelOwner/services/hotels-store";

const schema = z.object({
  name: z.string().trim().min(2, "Hotel name is required").max(100),
  destination: z.string().trim().min(2, "Destination is required").max(100),
  address: z.string().trim().min(4, "Address is required").max(200),
  district: z.string().min(1, "District is required"),
  email: z.string().trim().email("Enter a valid email").max(120),
  phone: z
    .string()
    .trim()
    .min(6, "Phone number is required")
    .max(30)
    .regex(/^[0-9+\-\s()]+$/, "Use digits, spaces, +, -, ()"),
  description: z
    .string()
    .trim()
    .min(10, "Add at least a short description (10+ characters)")
    .max(2000, "Description is too long"),
  images: z
    .array(z.string().min(1))
    .min(3, "You must upload at least 3 images")
    .default([]),
});

export type HotelFormValues = z.infer<typeof schema>;

export function HotelForm({
  mode,
  initial,
  onSubmit,
  onCancel,
}: {
  mode: "create" | "edit";
  initial?: Partial<Hotel>;
  onSubmit: (values: HotelFormValues, files?: Record<string, File>) => void;
  onCancel: () => void;
}) {
  const navigate = useNavigate();
  const initialImages =
    initial?.images && initial.images.length > 0
      ? initial.images
      : [];

  const [values, setValues] = useState<HotelFormValues>({
    name: initial?.hotelName ?? "",
    destination: initial?.destination ?? "",
    address: initial?.location ?? "",
    district: initial?.district ?? "",
    email: initial?.hotelEmail ?? (initial as any)?.email ?? "",
    phone: initial?.hotelContactNumber ?? (initial as any)?.phone ?? "",
    description: initial?.description ?? "",
    images: initialImages,
  });
  const [rawFiles, setRawFiles] = useState<Record<string, File>>({});
  const [errors, setErrors] = useState<Partial<Record<keyof HotelFormValues, string>>>({});
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode === "create") {
      setValues({
        name: "",
        destination: "",
        address: "",
        district: "",
        email: "",
        phone: "",
        description: "",
        images: [],
      });
      setErrors({});
      return;
    }

    if (initial) {
      const imgs =
        initial.images && initial.images.length > 0
          ? initial.images
          : [];
      setValues({
        name: initial.hotelName ?? "",
        destination: initial.destination ?? "",
        address: initial.location ?? "",
        district: initial.district ?? "",
        email: initial.hotelEmail ?? (initial as any).email ?? "",
        phone: initial.hotelContactNumber ?? (initial as any).phone ?? "",
        description: initial.description ?? "",
        images: imgs,
      });
      setErrors({});
    }
  }, [initial, mode]);

  const setField = <K extends keyof HotelFormValues>(k: K, v: HotelFormValues[K]) => {
    setValues((prev) => ({ ...prev, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const handleFiles = (files: FileList | File[] | null | undefined) => {
    if (!files) return;
    const list = Array.from(files);
    if (list.length === 0) return;

    const accepted = list;

    const readers: Promise<{ src: string; file: File } | null>[] = accepted.map((file) => {
      return new Promise((resolve) => {
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image.`);
          resolve(null);
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is over 5MB.`);
          resolve(null);
          return;
        }
        const reader = new FileReader();
        reader.onload = () => resolve({ src: String(reader.result), file });
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((results) => {
      const valid = results.filter((r): r is { src: string; file: File } => !!r);
      if (valid.length > 0) {
        const newImages = valid.map(v => v.src);
        setField("images", [...values.images, ...newImages]);
        
        const newRawFiles = { ...rawFiles };
        valid.forEach(v => { newRawFiles[v.src] = v.file; });
        setRawFiles(newRawFiles);
      }
    });
  };

  const removeImage = (idx: number) => {
    setField(
      "images",
      values.images.filter((_, i) => i !== idx),
    );
  };

  const makeCover = (idx: number) => {
    if (idx === 0) return;
    const next = [...values.images];
    const [picked] = next.splice(idx, 1);
    next.unshift(picked);
    setField("images", next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(values);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof HotelFormValues, string>> = {};
      for (const issue of result.error.issues) {
        const k = issue.path[0] as keyof HotelFormValues;
        if (!fieldErrors[k]) fieldErrors[k] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error("Please fix the highlighted fields.");
      return;
    }
    onSubmit(result.data, rawFiles);
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate("/hotelowner")}
        className="group inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
        All Hotels
      </button>

      <div className="mt-5 mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {mode === "create" ? "Add a new hotel" : "Edit hotel details"}
        </h1>
        <p className="mt-2 text-[15px] text-muted-foreground">
          {mode === "create"
            ? "Tell us about your property. You can update these details anytime."
            : "Update your property details. Changes apply instantly across your dashboard."}
        </p>
      </div>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
        className="space-y-8"
      >
        {/* Basic Info */}
        <Section
          title="Basic Info"
          description="Core details that identify your property."
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Field label="Hotel Name" error={errors.name} required>
              <input
                type="text"
                value={values.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="The Grand Plaza"
                className={inputClass(!!errors.name)}
              />
            </Field>

            <Field label="Destination" error={errors.destination} required>
              <input
                type="text"
                value={values.destination}
                onChange={(e) => setField("destination", e.target.value)}
                placeholder="e.g. Colombo, Kandy, Galle"
                className={inputClass(!!errors.destination)}
              />
            </Field>

            <Field label="District" error={errors.district} required>
              <select
                value={values.district}
                onChange={(e) => setField("district", e.target.value as District)}
                className={
                  inputClass(!!errors.district) +
                  " appearance-none pr-9 bg-no-repeat bg-[right_0.75rem_center]"
                }
                style={{
                  backgroundImage:
                    'url("data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2364748B%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><polyline points=%226 9 12 15 18 9%22/></svg>")',
                }}
              >
                <option value="">Select a district</option>
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Address" error={errors.address} required className="md:col-span-2">
              <input
                type="text"
                value={values.address}
                onChange={(e) => setField("address", e.target.value)}
                placeholder="77 Galle Road, Colombo 03"
                className={inputClass(!!errors.address)}
              />
            </Field>
          </div>
        </Section>

        {/* Contact */}
        <Section title="Contact" description="How guests and TravelHUB can reach you.">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Field label="Email" error={errors.email} required>
              <input
                type="email"
                value={values.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="contact@yourhotel.com"
                className={inputClass(!!errors.email)}
              />
            </Field>

            <Field label="Phone" error={errors.phone} required>
              <input
                type="tel"
                value={values.phone}
                onChange={(e) => setField("phone", e.target.value)}
                placeholder="+94 11 234 5678"
                className={inputClass(!!errors.phone)}
              />
            </Field>
          </div>
        </Section>



        {/* Images */}
        <Section
          title="Hotel Images"
          description="Upload one or more images. The first image is shown as the cover."
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => handleFiles(e.target.files)}
          />

          {values.images.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {values.images.map((src, idx) => (
                  <div
                    key={idx}
                    className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted shadow-sm"
                  >
                    <img
                      src={src}
                      alt={`Hotel ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                    {idx === 0 && (
                      <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground shadow-sm">
                        <Star className="h-2.5 w-2.5 fill-current" /> Cover
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/30" />
                    <div className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => makeCover(idx)}
                          className="inline-flex h-8 items-center gap-1 rounded-[8px] bg-white/95 px-2 text-[11px] font-semibold text-foreground shadow-sm hover:bg-white"
                        >
                          <Star className="h-3 w-3" />
                          Set cover
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-[8px] bg-white/95 text-destructive shadow-sm hover:bg-white"
                        aria-label="Remove image"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex aspect-[4/3] flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border bg-secondary/40 text-muted-foreground transition hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                  >
                    <ImagePlus className="h-5 w-5" />
                    <span className="text-xs font-semibold">Add more</span>
                  </button>
              </div>
              <p className="text-xs text-muted-foreground">
                {values.images.length} image(s) · minimum 3 required · click a thumbnail's "Set cover" to change
                the main photo.
              </p>
              {errors.images && (
                <p className="text-xs font-medium text-destructive">{errors.images}</p>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFiles(e.dataTransfer.files);
              }}
              className={`flex min-h-[200px] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-all duration-200 ${
                dragOver
                  ? "border-primary bg-primary/5"
                  : errors.images
                    ? "border-destructive/40 bg-destructive/5"
                    : "border-border bg-secondary/40 hover:border-primary/50 hover:bg-primary/5"
              }`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ImagePlus className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                Drop images or click to upload
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG up to 5MB each · minimum 3 images required
              </p>
              {errors.images && (
                <p className="mt-1 text-xs font-medium text-destructive">{errors.images}</p>
              )}
            </button>
          )}
        </Section>

        {/* Details */}
        <Section title="Details" description="Tell guests what makes your property special.">
          <Field label="Description" error={errors.description} required>
            <textarea
              value={values.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Describe the location, ambience, amenities, and what guests will love."
              rows={5}
              className={
                inputClass(!!errors.description) +
                " min-h-[140px] resize-y py-3 leading-relaxed"
              }
              style={{ height: "auto" }}
            />
          </Field>
        </Section>

        <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-11 items-center justify-center rounded-[10px] border border-border bg-card px-5 text-sm font-semibold text-foreground shadow-sm transition hover:bg-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-[10px] bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition hover:bg-[var(--color-primary-hover)] hover:shadow-lg hover:shadow-primary/30 active:scale-[0.97]"
          >
            {mode === "create" ? "Add Hotel" : "Save Changes"}
          </button>
        </div>
      </motion.form>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-card p-6 shadow-md sm:p-8">
      <header className="mb-5">
        <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </header>
      {children}
    </section>
  );
}

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