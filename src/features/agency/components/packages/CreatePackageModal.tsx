import { useState, useRef, useCallback, useEffect } from 'react';
import {
  X, Plus, Trash2, Upload, ImageIcon,
  Calendar, MapPin, DollarSign, Tag,
  Flame, CheckCircle2, Pencil
} from 'lucide-react';
import { Button } from '@/components/common/ui/button';
import { Input } from '@/components/common/ui/input';
import { Textarea } from '@/components/common/ui/textarea';
import { Label } from '@/components/common/ui/label';
import { Switch } from '@/components/common/ui/switch';
import { Progress } from '@/components/common/ui/progress';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/common/ui/select';
import { cn } from '@/utils/utils';

const SRI_LANKA_DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
  'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
  'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar',
  'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya',
  'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya',
];

const CATEGORIES = ['culture', 'beach', 'mountain', 'city', 'wildlife'];

const DEFAULT_BASIC = {
  packageName: '', category: '', destination: '', district: '',
  startPlace: '', endPlace: '', duration: '', priceFrom: '',
  priceTo: '', festivalDetails: '', isActive: true, trending: false,
};

// Map a package record into form state
const pkgToFormState = (pkg) => ({
  packageName:    pkg.name        ?? '',
  category:       pkg.category    ?? '',
  destination:    pkg.destination ?? '',
  district:       pkg.district    ?? '',
  startPlace:     pkg.startPlace  ?? '',
  endPlace:       pkg.endPlace    ?? '',
  duration:       pkg.duration    ?? '',
  priceFrom:      pkg.priceFrom   ?? (pkg.price ?? ''),
  priceTo:        pkg.priceTo     ?? '',
  festivalDetails: pkg.festivalDetails ?? '',
  isActive:       pkg.available   ?? true,
  trending:       pkg.trending    ?? false,
});

// Map package activities array → day cards
const pkgToDays = (activities = []) =>
  activities.map((a) => ({
    id:          a.day ?? Date.now() + Math.random(),
    title:       a.title       ?? '',
    description: a.description ?? '',
    activities:  a.activities?.length ? a.activities : [''],
  }));

// Map package images array (URLs) → image card objects
const pkgToImages = (imgs = []) =>
  imgs.map((url, i) => ({
    id:   i + 1,
    url,
    name: `Image ${i + 1}`,
  }));

// ─── Sub-components ──────────────────────────────────────────────────────────

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/15">
      <Icon className="h-4 w-4 text-primary" />
    </div>
    <div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

const FormField = ({ label, required, children, className }) => (
  <div className={cn('flex flex-col gap-1.5', className)}>
    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
      {label}{required && <span className="text-destructive ml-1">*</span>}
    </Label>
    {children}
  </div>
);

const styledInput    = 'h-10 bg-muted/40 border-border/60 focus:border-primary/50 focus:bg-background transition-colors text-sm';
const styledTextarea = 'bg-muted/40 border-border/60 focus:border-primary/50 focus:bg-background transition-colors text-sm min-h-[90px]';

// ─── Main component ──────────────────────────────────────────────────────────

/**
 * Unified Create / Edit modal.
 * @param {boolean}  open
 * @param {function} onClose
 * @param {object|null} editData  – pass an existing package to enter edit mode
 * @param {function} onSave       – callback(updatedPkg) when editing; optional
 */
export function CreatePackageModal({ open, onClose, editData = null, onSave }) {
  const isEdit = !!editData;

  // ── State ────────────────────────────────────────────────────────────────
  const [basicInfo, setBasicInfo] = useState(DEFAULT_BASIC);
  const [images,    setImages]    = useState([]);
  const [days,      setDays]      = useState([]);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading,    setIsUploading]    = useState(false);
  const [isDragging,     setIsDragging]     = useState(false);
  const fileInputRef = useRef(null);

  // Populate form when editData changes (or modal opens)
  useEffect(() => {
    if (open && editData) {
      setBasicInfo(pkgToFormState(editData));
      setImages(pkgToImages(editData.images));
      setDays(pkgToDays(editData.activities));
    } else if (open && !editData) {
      setBasicInfo(DEFAULT_BASIC);
      setImages([]);
      setDays([]);
    }
  }, [open, editData]);

  const updateBasic = (key, val) => setBasicInfo(prev => ({ ...prev, [key]: val }));

  // ── Image upload ─────────────────────────────────────────────────────────
  const simulateUpload = useCallback((files) => {
    setIsUploading(true);
    setUploadProgress(0);
    const newImages = Array.from(files).map(f => ({
      id:   Date.now() + Math.random(),
      file: f,
      url:  URL.createObjectURL(f),
      name: f.name,
    }));
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20 + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setImages(prev => [...prev, ...newImages]);
        setIsUploading(false);
      }
      setUploadProgress(Math.min(progress, 100));
    }, 120);
  }, []);

  const handleFileChange = (e) => { if (e.target.files?.length) simulateUpload(e.target.files); };
  const handleDrop = (e) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files?.length) simulateUpload(e.dataTransfer.files);
  };
  const removeImage = (id) => setImages(prev => prev.filter(img => img.id !== id));

  // ── Days ─────────────────────────────────────────────────────────────────
  const addDay       = () => setDays(prev => [...prev, { id: Date.now(), title: '', description: '', activities: [''] }]);
  const removeDay    = (id) => setDays(prev => prev.filter(d => d.id !== id));
  const updateDay    = (id, key, val) => setDays(prev => prev.map(d => d.id === id ? { ...d, [key]: val } : d));
  const addActivity  = (dayId) => setDays(prev => prev.map(d => d.id === dayId ? { ...d, activities: [...d.activities, ''] } : d));
  const updateActivity = (dayId, idx, val) => setDays(prev => prev.map(d => d.id === dayId ? { ...d, activities: d.activities.map((a, i) => i === idx ? val : a) } : d));
  const removeActivity = (dayId, idx) => setDays(prev => prev.map(d => d.id === dayId ? { ...d, activities: d.activities.filter((_, i) => i !== idx) } : d));

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    const payload = { ...basicInfo, images, days };
    if (isEdit && onSave) {
      onSave({ ...editData, ...payload, name: basicInfo.packageName, available: basicInfo.isActive });
    } else {
      console.log('New package payload:', payload);
    }
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl border border-border/60 bg-card shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-border/60 bg-gradient-to-r from-primary/8 to-transparent shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/15">
              {isEdit ? <Pencil className="h-4 w-4 text-primary" /> : <MapPin className="h-4 w-4 text-primary" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground tracking-tight">
                {isEdit ? `Edit Package` : 'Create Package'}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isEdit
                  ? `Editing: ${editData?.name ?? ''}`
                  : 'Fill in the details to publish a new travel package'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="overflow-y-auto flex-1 px-7 py-6 space-y-10">

          {/* ═══ SECTION 1 — Basic Info ═══ */}
          <section>
            <SectionHeader icon={Tag} title="Basic Information" subtitle="Core details about the package" />
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Package Name" required className="col-span-2">
                <Input id="pkg-name" placeholder="e.g. Cultural Triangle Explorer" className={styledInput}
                  value={basicInfo.packageName} onChange={e => updateBasic('packageName', e.target.value)} />
              </FormField>

              <FormField label="Category" required>
                <Select modal={false} value={basicInfo.category} onValueChange={val => updateBasic('category', val)}>
                  <SelectTrigger id="pkg-category"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => (
                      <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Destination" required>
                <Input id="pkg-destination" placeholder="e.g. Sigiriya, Sri Lanka" className={styledInput}
                  value={basicInfo.destination} onChange={e => updateBasic('destination', e.target.value)} />
              </FormField>

              <FormField label="District" required>
                <Select modal={false} value={basicInfo.district} onValueChange={val => updateBasic('district', val)}>
                  <SelectTrigger id="pkg-district"><SelectValue placeholder="Select district" /></SelectTrigger>
                  <SelectContent>
                    {SRI_LANKA_DISTRICTS.map(d => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Start Place" required>
                <Input id="pkg-start" placeholder="e.g. Colombo Airport" className={styledInput}
                  value={basicInfo.startPlace} onChange={e => updateBasic('startPlace', e.target.value)} />
              </FormField>

              <FormField label="End Place" required>
                <Input id="pkg-end" placeholder="e.g. Galle Fort" className={styledInput}
                  value={basicInfo.endPlace} onChange={e => updateBasic('endPlace', e.target.value)} />
              </FormField>

              <FormField label="Duration" required>
                <Input id="pkg-duration" placeholder="e.g. 3 Days" className={styledInput}
                  value={basicInfo.duration} onChange={e => updateBasic('duration', e.target.value)} />
              </FormField>

              <div className="col-span-2 grid grid-cols-2 gap-4">
                <FormField label="Price From (USD)" required>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="pkg-price-from" type="number" placeholder="0" className={cn(styledInput, 'pl-9')}
                      value={basicInfo.priceFrom} onChange={e => updateBasic('priceFrom', e.target.value)} />
                  </div>
                </FormField>
                <FormField label="Price To (USD)" required>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="pkg-price-to" type="number" placeholder="0" className={cn(styledInput, 'pl-9')}
                      value={basicInfo.priceTo} onChange={e => updateBasic('priceTo', e.target.value)} />
                  </div>
                </FormField>
              </div>

              <FormField label="Festival Details" className="col-span-2">
                <Textarea id="pkg-festival" placeholder="Describe any festival or cultural event included (optional)..."
                  className={styledTextarea}
                  value={basicInfo.festivalDetails} onChange={e => updateBasic('festivalDetails', e.target.value)} />
              </FormField>

              {/* Toggles */}
              <div className="col-span-2 flex gap-4">
                <div className="flex-1 flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span className="text-sm font-medium text-foreground">Is Active</span>
                    <span className="text-xs text-muted-foreground">Visible to customers</span>
                  </div>
                  <Switch id="pkg-active" checked={basicInfo.isActive} onCheckedChange={val => updateBasic('isActive', val)} />
                </div>
                <div className="flex-1 flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-warning" />
                    <span className="text-sm font-medium text-foreground">Trending</span>
                    <span className="text-xs text-muted-foreground">Feature on homepage</span>
                  </div>
                  <Switch id="pkg-trending" checked={basicInfo.trending} onCheckedChange={val => updateBasic('trending', val)} />
                </div>
              </div>
            </div>
          </section>

          {/* ═══ SECTION 2 — Image Upload ═══ */}
          <section>
            <SectionHeader icon={ImageIcon} title="Package Images" subtitle="Upload high-quality photos for the package" />

            <div
              className={cn(
                'relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
                isDragging ? 'border-primary bg-primary/10' : 'border-border/60 hover:border-primary/50 hover:bg-muted/30'
              )}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
              <div className="flex flex-col items-center gap-3">
                <div className={cn('flex items-center justify-center w-14 h-14 rounded-xl transition-colors', isDragging ? 'bg-primary/20' : 'bg-muted/60')}>
                  <Upload className={cn('h-6 w-6', isDragging ? 'text-primary' : 'text-muted-foreground')} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {isDragging ? 'Drop images here' : 'Click or drag to upload images'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP up to 10MB each</p>
                </div>
                <Button type="button" variant="outline" size="sm" className="gap-2 mt-1">
                  <Upload className="h-3.5 w-3.5" /> Browse Files
                </Button>
              </div>
            </div>

            {isUploading && (
              <div className="mt-4 rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-foreground">Uploading…</span>
                  <span className="text-xs text-primary font-semibold">{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="h-1.5" />
              </div>
            )}

            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {images.map((img, i) => (
                  <div key={img.id} className="group relative aspect-video rounded-xl overflow-hidden border border-border/60">
                    <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                    {i === 0 && (
                      <span className="absolute top-2 left-2 text-[10px] font-semibold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                        Cover
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                      className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                      <p className="text-[10px] text-white truncate">{img.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ═══ SECTION 3 — Day-by-Day Itinerary ═══ */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <SectionHeader icon={Calendar} title="Day-by-Day Itinerary" subtitle="Plan each day of the journey" />
              <Button type="button" size="sm" onClick={addDay}
                className="gap-2 shrink-0 -mt-6 bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4" /> Add Day
              </Button>
            </div>

            {days.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 rounded-xl border-2 border-dashed border-border/50 text-center">
                <Calendar className="h-8 w-8 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">No days added yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Click "Add Day" to start building the itinerary</p>
              </div>
            ) : (
              <div className="space-y-4">
                {days.map((day, dayIndex) => (
                  <div key={day.id} className="rounded-xl border border-border/60 bg-muted/20 overflow-hidden">
                    {/* Day Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-b border-border/40">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                          {dayIndex + 1}
                        </div>
                        <span className="text-sm font-semibold text-foreground">Day {dayIndex + 1}</span>
                        <span className="text-xs text-muted-foreground">
                          {day.activities.filter(Boolean).length} activities
                        </span>
                      </div>
                      <button type="button" onClick={() => removeDay(day.id)}
                        className="p-1.5 rounded-lg hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Day Body */}
                    <div className="p-4 space-y-4">
                      <FormField label="Day Title" required>
                        <Input placeholder="e.g. Arrival & Dambulla Cave Temple" className={styledInput}
                          value={day.title} onChange={e => updateDay(day.id, 'title', e.target.value)} />
                      </FormField>

                      <FormField label="Description">
                        <Textarea placeholder="Describe what happens this day..." className={styledTextarea}
                          value={day.description} onChange={e => updateDay(day.id, 'description', e.target.value)} />
                      </FormField>

                      {/* Activities */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Activities</Label>
                          <button type="button" onClick={() => addActivity(day.id)}
                            className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium transition-colors">
                            <Plus className="h-3.5 w-3.5" /> Add Activity
                          </button>
                        </div>
                        <div className="space-y-2">
                          {day.activities.map((act, actIdx) => (
                            <div key={actIdx} className="flex items-center gap-2">
                              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/15 shrink-0">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                              </div>
                              <Input
                                placeholder={`Activity ${actIdx + 1}…`}
                                className={cn(styledInput, 'flex-1')}
                                value={act}
                                onChange={e => updateActivity(day.id, actIdx, e.target.value)}
                              />
                              {day.activities.length > 1 && (
                                <button type="button" onClick={() => removeActivity(day.id, actIdx)}
                                  className="p-1.5 rounded-md hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition-colors shrink-0">
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-7 py-4 border-t border-border/60 bg-muted/20 shrink-0">
          <p className="text-xs text-muted-foreground">
            {days.length} day{days.length !== 1 ? 's' : ''} · {images.length} image{images.length !== 1 ? 's' : ''}
          </p>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="px-5">Cancel</Button>
            <Button
              type="button"
              onClick={handleSubmit}
              className="px-6 gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md"
            >
              {isEdit ? <Pencil className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
              {isEdit ? 'Save Changes' : 'Create Package'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
