import { useState, useRef, useCallback, useEffect } from 'react';
import {
  X, Plus, Trash2, Upload, ImageIcon,
  Calendar, MapPin, DollarSign, Tag,
  CheckCircle2, Pencil, Search, Loader2, Building2
} from 'lucide-react';
import { Button } from '@/components/common/ui/button';
import { Input } from '@/components/common/ui/input';
import { Textarea } from '@/components/common/ui/textarea';
import { Label } from '@/components/common/ui/label';
import { Switch } from '@/components/common/ui/switch';
import { Progress } from '@/components/common/ui/progress';
import { Checkbox } from '@/components/common/ui/checkbox';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/common/ui/select';
import { cn } from '@/utils/utils';
import { api } from '@/features/agency/services/api';
import { toast } from 'sonner';

const SRI_LANKA_DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
  'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
  'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar',
  'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya',
  'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya',
];

const CATEGORIES = ['CULTURE', 'BEACH', 'MOUNTAIN', 'CITY', 'WILDLIFE'];

const INCLUSIONS_LIST = [
  { id: 'ac_transport', label: 'AC Transport' },
  { id: 'local_guide', label: 'Local Guide' },
  { id: 'meals', label: 'Meals' },
  { id: 'entry_fees', label: 'Entry Fees' },
  { id: 'accommodation', label: 'Accommodation', multiHint: true },
];

const DEFAULT_BASIC = {
  packageName: '',
  category: '',
  packageType: 'SINGLE_DISTRICT',
  district: '',
  startPlace: '',
  endPlace: '',
  duration: '',
  priceFrom: '',
  priceTo: '',
  basePriceAdult: '',
  basePriceChild: '',
  description: '',
  isActive: true,
};

const pkgToFormState = (pkg) => ({
  packageName:    pkg.name        ?? '',
  category:       pkg.category    ?? '',
  packageType:    pkg.packageType ?? 'SINGLE_DISTRICT',
  district:       pkg.district    ?? '',
  startPlace:     pkg.startPlace  ?? '',
  endPlace:       pkg.endPlace    ?? '',
  duration:       pkg.duration    ?? '',
  priceFrom:      pkg.priceFrom   ?? '',
  priceTo:        pkg.priceTo     ?? '',
  basePriceAdult: pkg.basePriceAdult ?? '',
  basePriceChild: pkg.basePriceChild ?? '',
  description:    pkg.description ?? '',
  isActive:       pkg.isActive !== false,
});

const pkgToDays = (itineraryDays = []) =>
  itineraryDays.map((d) => ({
    id:          d.dayId ?? Date.now() + Math.random(),
    title:       d.title       ?? '',
    description: d.description ?? '',
    district:    d.district    ?? '',
    hotelId:     d.hotelId     ?? null,
    hotelNameCustom: d.hotelName ?? '',
    activities:  (d.activities?.length ? d.activities : [{ description: '', imageUrl: null }]).map(act => ({
      description: act.description ?? act, // handle both old string format and new object format
      imageUrl: act.imageUrl ?? null,
      isUploading: false
    })),
  }));

const pkgToImages = (imgs = [], coverUrl = null) => {
  if (imgs && imgs.length > 0) {
    return imgs.map((img, i) => ({
      id:   i + 1,
      url:  img.imageUrl,
      name: img.originalFileName || `Image ${i + 1}`,
      isExisting: true
    }));
  }
  if (coverUrl) {
    return [{ id: 1, url: coverUrl, name: 'Cover', isExisting: true }];
  }
  return [];
};

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

export function CreatePackageModal({ open, onClose, editData = null, onSave, onCreate }) {
  const isEdit = !!editData;

  const [basicInfo, setBasicInfo] = useState(DEFAULT_BASIC);
  const [inclusions, setInclusions] = useState([]);
  const [images,    setImages]    = useState([]);
  const [days,      setDays]      = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (open && editData) {
      setBasicInfo(pkgToFormState(editData));
      setImages(pkgToImages(editData.images, editData.coverImageUrl));
      setDays(pkgToDays(editData.days));
      setInclusions(editData.inclusions || []);
    } else if (open && !editData) {
      setBasicInfo(DEFAULT_BASIC);
      setInclusions([]);
      setImages([]);
      setDays([]);
    }
  }, [open, editData]);

  const updateBasic = (key, val) => setBasicInfo(prev => ({ ...prev, [key]: val }));

  const toggleInclusion = (inc) => {
    setInclusions(prev => prev.includes(inc) ? prev.filter(i => i !== inc) : [...prev, inc]);
  };

  // ── Package Images Upload (Queued for Submit) ────────────────────────────
  const handleFileChange = (e) => { 
    if (e.target.files?.length) {
      const newImages = Array.from(e.target.files).map(f => ({
        id: Date.now() + Math.random(),
        file: f,
        url: URL.createObjectURL(f),
        name: f.name,
        isExisting: false
      }));
      setImages(prev => [...prev, ...newImages]);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files?.length) handleFileChange({ target: { files: e.dataTransfer.files } });
  };
  const removeImage = (id) => setImages(prev => prev.filter(img => img.id !== id));

  // ── Days & Activities ────────────────────────────────────────────────────
  const addDay       = () => setDays(prev => [...prev, { id: Date.now(), title: '', description: '', district: '', hotelId: null, hotelNameCustom: '', activities: [{ description: '', imageUrl: null, isUploading: false }] }]);
  const removeDay    = (id) => setDays(prev => prev.filter(d => d.id !== id));
  const updateDay    = (id, key, val) => setDays(prev => prev.map(d => d.id === id ? { ...d, [key]: val } : d));
  
  const addActivity  = (dayId) => setDays(prev => prev.map(d => d.id === dayId ? { ...d, activities: [...d.activities, { description: '', imageUrl: null, isUploading: false }] } : d));
  const updateActivity = (dayId, idx, key, val) => setDays(prev => prev.map(d => d.id === dayId ? { ...d, activities: d.activities.map((a, i) => i === idx ? { ...a, [key]: val } : a) } : d));
  const removeActivity = (dayId, idx) => setDays(prev => prev.map(d => d.id === dayId ? { ...d, activities: d.activities.filter((_, i) => i !== idx) } : d));

  const handleActivityImageUpload = async (dayId, actIdx, file) => {
    if (!file) return;
    try {
      updateActivity(dayId, actIdx, 'isUploading', true);
      const res = await api.uploadPackageImage(file);
      updateActivity(dayId, actIdx, 'imageUrl', res.imageUrl);
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload activity image');
    } finally {
      updateActivity(dayId, actIdx, 'isUploading', false);
    }
  };

  // ── Hotel Searching ──────────────────────────────────────────────────────
  const [hotelSearchQuery, setHotelSearchQuery] = useState({});
  const [hotelSearchResults, setHotelSearchResults] = useState({});
  
  const handleHotelSearch = async (dayId, district, query) => {
    setHotelSearchQuery(prev => ({ ...prev, [dayId]: query }));
    if (!query || query.length < 2) {
      setHotelSearchResults(prev => ({ ...prev, [dayId]: [] }));
      return;
    }
    try {
      const results = await api.searchHotels(query, district);
      setHotelSearchResults(prev => ({ ...prev, [dayId]: results }));
    } catch (err) {
      console.error('Hotel search failed', err);
    }
  };

  const selectHotel = (dayId, hotel) => {
    updateDay(dayId, 'hotelId', hotel.id);
    updateDay(dayId, 'hotelNameCustom', hotel.hotelName);
    setHotelSearchQuery(prev => ({ ...prev, [dayId]: '' }));
    setHotelSearchResults(prev => ({ ...prev, [dayId]: [] }));
  };

  const setCustomHotel = (dayId) => {
    updateDay(dayId, 'hotelId', null);
    updateDay(dayId, 'hotelNameCustom', hotelSearchQuery[dayId]);
    setHotelSearchQuery(prev => ({ ...prev, [dayId]: '' }));
    setHotelSearchResults(prev => ({ ...prev, [dayId]: [] }));
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!basicInfo.packageName || !basicInfo.category || !basicInfo.district) {
      toast.error("Please fill in all required basic fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Build Payload
      const payload = {
        name: basicInfo.packageName,
        category: basicInfo.category,
        packageType: basicInfo.packageType,
        district: basicInfo.district,
        startPlace: basicInfo.startPlace,
        endPlace: basicInfo.endPlace,
        duration: basicInfo.duration,
        basePriceAdult: parseFloat(basicInfo.basePriceAdult) || 0,
        basePriceChild: parseFloat(basicInfo.basePriceChild) || 0,
        description: basicInfo.description,
        inclusions: inclusions,
        isActive: basicInfo.isActive,
        days: days.map((d, i) => ({
          dayNumber: i + 1,
          title: d.title,
          description: d.description,
          district: d.district,
          hotelId: d.hotelId,
          hotelNameCustom: d.hotelNameCustom,
          activities: d.activities.map(a => ({
            description: a.description,
            imageUrl: a.imageUrl
          }))
        })),
        existingImageUrls: images.filter(img => img.isExisting).map(img => img.url)
      };

      const newFiles = images.filter(img => !img.isExisting).map(img => img.file);

      // 2. Submit
      let result;
      if (isEdit) {
        result = await api.updateAgentPackage(editData.packageId, JSON.stringify(payload), newFiles);
        toast.success("Package updated successfully!");
        if (onSave) onSave(result);
      } else {
        result = await api.createPackage(JSON.stringify(payload), newFiles);
        toast.success("Package created successfully!");
        if (onCreate) onCreate(result);
      }
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to save package");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

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
                {isEdit ? `Editing: ${editData?.name ?? ''}` : 'Fill in the details to publish a new travel package'}
              </p>
            </div>
          </div>
          <button onClick={onClose} disabled={isSubmitting} className="p-2 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors">
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
                <Input placeholder="e.g. Cultural Triangle Explorer" className={styledInput} value={basicInfo.packageName} onChange={e => updateBasic('packageName', e.target.value)} />
              </FormField>

              <FormField label="Package Type" required>
                <Select modal={false} value={basicInfo.packageType} onValueChange={val => updateBasic('packageType', val)}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SINGLE_DISTRICT">Single District</SelectItem>
                    <SelectItem value="MULTI_DISTRICT">Multi District</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Category" required>
                <Select modal={false} value={basicInfo.category} onValueChange={val => updateBasic('category', val)}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="District" required className="col-span-2">
                <Select modal={false} value={basicInfo.district} onValueChange={val => updateBasic('district', val)}>
                  <SelectTrigger><SelectValue placeholder="Select primary district" /></SelectTrigger>
                  <SelectContent>
                    {SRI_LANKA_DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
                {basicInfo.packageType === 'MULTI_DISTRICT' && (
                  <p className="text-[11px] text-muted-foreground mt-1">
                    *Hint: Select the <b>first district</b> of the journey here so it appears correctly when tourists filter by district.
                  </p>
                )}
              </FormField>

              <FormField label="Start Place" required>
                <Input placeholder="e.g. Colombo Airport" className={styledInput} value={basicInfo.startPlace} onChange={e => updateBasic('startPlace', e.target.value)} />
              </FormField>

              <FormField label="End Place" required>
                <Input placeholder="e.g. Galle Fort" className={styledInput} value={basicInfo.endPlace} onChange={e => updateBasic('endPlace', e.target.value)} />
              </FormField>

              <FormField label="Duration" required className="col-span-2">
                <Input placeholder="e.g. 3 Days / 2 Nights" className={styledInput} value={basicInfo.duration} onChange={e => updateBasic('duration', e.target.value)} />
              </FormField>

              <FormField label="Base Price (Adult) USD" required>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="number" placeholder="120" className={cn(styledInput, 'pl-9')} value={basicInfo.basePriceAdult} onChange={e => updateBasic('basePriceAdult', e.target.value)} />
                </div>
              </FormField>
              
              <FormField label="Base Price (Child) USD" required>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="number" placeholder="70" className={cn(styledInput, 'pl-9')} value={basicInfo.basePriceChild} onChange={e => updateBasic('basePriceChild', e.target.value)} />
                </div>
              </FormField>

              <FormField label="Description" className="col-span-2">
                <Textarea placeholder="Describe the package..." className={styledTextarea} value={basicInfo.description} onChange={e => updateBasic('description', e.target.value)} />
              </FormField>

              <FormField label="Inclusions" className="col-span-2">
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {INCLUSIONS_LIST.filter(inc => inc.id !== 'accommodation' || basicInfo.packageType === 'MULTI_DISTRICT').map(inc => (
                    <div key={inc.id} className="flex flex-row items-start space-x-3 space-y-0 p-3 rounded-md border border-border/40">
                      <Checkbox 
                        id={inc.id} 
                        checked={inclusions.includes(inc.label)} 
                        onCheckedChange={() => toggleInclusion(inc.label)} 
                      />
                      <div className="space-y-1 leading-none">
                        <Label htmlFor={inc.id} className="text-sm cursor-pointer">{inc.label}</Label>
                        {inc.multiHint && basicInfo.packageType === 'MULTI_DISTRICT' && (
                          <p className="text-[10px] text-muted-foreground italic">(Multi District — check this)</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </FormField>

              <div className="col-span-2 flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 px-4 py-3 mt-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="text-sm font-medium text-foreground">Is Active</span>
                  <span className="text-xs text-muted-foreground">Visible to customers</span>
                </div>
                <Switch checked={basicInfo.isActive} onCheckedChange={val => updateBasic('isActive', val)} />
              </div>
            </div>
          </section>

          {/* ═══ SECTION 2 — Image Upload ═══ */}
          <section>
            <SectionHeader icon={ImageIcon} title="Package Images" subtitle="Upload high-quality cover photos" />
            <div
              className={cn('relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200', isDragging ? 'border-primary bg-primary/10' : 'border-border/60 hover:border-primary/50 hover:bg-muted/30')}
              onClick={() => fileInputRef.current?.click()} onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop}
            >
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
              <div className="flex flex-col items-center gap-3">
                <div className={cn('flex items-center justify-center w-14 h-14 rounded-xl transition-colors', isDragging ? 'bg-primary/20' : 'bg-muted/60')}>
                  <Upload className={cn('h-6 w-6', isDragging ? 'text-primary' : 'text-muted-foreground')} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{isDragging ? 'Drop images here' : 'Click or drag to upload images'}</p>
                </div>
              </div>
            </div>

            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {images.map((img, i) => (
                  <div key={img.id} className="group relative aspect-video rounded-xl overflow-hidden border border-border/60">
                    <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                    {i === 0 && <span className="absolute top-2 left-2 text-[10px] font-semibold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Cover</span>}
                    <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(img.id); }} className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ═══ SECTION 3 — Day-by-Day Itinerary ═══ */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <SectionHeader icon={Calendar} title="Day-by-Day Itinerary" subtitle="Plan each day of the journey" />
              <Button type="button" size="sm" onClick={addDay} className="gap-2 shrink-0 -mt-6 bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4" /> Add Day
              </Button>
            </div>

            <div className="space-y-4">
              {days.map((day, dayIndex) => (
                <div key={day.id} className="rounded-xl border border-border/60 bg-muted/20 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-b border-border/40">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold">{dayIndex + 1}</div>
                      <span className="text-sm font-semibold text-foreground">Day {dayIndex + 1}</span>
                    </div>
                    <button type="button" onClick={() => removeDay(day.id)} className="p-1.5 rounded-lg hover:bg-destructive/15 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="p-4 space-y-4">
                    {/* Hotel selection only for MULTI_DISTRICT */}
                    {basicInfo.packageType === 'MULTI_DISTRICT' && (
                      <div className="grid grid-cols-2 gap-4 bg-background/50 p-3 rounded-lg border border-border/50">
                        <FormField label="Day District" required>
                          <Select modal={false} value={day.district} onValueChange={val => updateDay(day.id, 'district', val)}>
                            <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
                            <SelectContent>
                              {SRI_LANKA_DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </FormField>
                        
                        <FormField label="Hotel Assignment" required>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                              placeholder="Search or type custom hotel..." 
                              className={cn(styledInput, 'pl-9')}
                              value={day.hotelNameCustom || hotelSearchQuery[day.id] || ''}
                              onChange={(e) => {
                                updateDay(day.id, 'hotelNameCustom', '');
                                updateDay(day.id, 'hotelId', null);
                                handleHotelSearch(day.id, day.district, e.target.value);
                              }}
                            />
                            {hotelSearchQuery[day.id] && hotelSearchQuery[day.id].length >= 2 && !day.hotelNameCustom && (
                              <div className="absolute z-20 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-40 overflow-y-auto">
                                {hotelSearchResults[day.id] && hotelSearchResults[day.id].map(h => (
                                  <div key={h.id} className="p-2 text-sm hover:bg-muted cursor-pointer flex items-center gap-2" onClick={() => selectHotel(day.id, h)}>
                                    <Building2 className="h-4 w-4 text-primary" />
                                    {h.hotelName} <span className="text-xs text-muted-foreground">({h.city})</span>
                                  </div>
                                ))}
                                <div className="p-2 text-sm text-primary hover:bg-muted cursor-pointer border-t" onClick={() => setCustomHotel(day.id)}>
                                  Use "{hotelSearchQuery[day.id]}" as custom name
                                </div>
                              </div>
                            )}
                          </div>
                        </FormField>
                      </div>
                    )}

                    <FormField label="Day Title" required>
                      <Input placeholder="e.g. Arrival & Orientation" className={styledInput} value={day.title} onChange={e => updateDay(day.id, 'title', e.target.value)} />
                    </FormField>

                    <FormField label="Description">
                      <Textarea placeholder="Describe what happens this day..." className={styledTextarea} value={day.description} onChange={e => updateDay(day.id, 'description', e.target.value)} />
                    </FormField>

                    <div>
                      <div className="flex items-center justify-between mb-2 mt-4">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Activities</Label>
                        <button type="button" onClick={() => addActivity(day.id)} className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium">
                          <Plus className="h-3.5 w-3.5" /> Add Activity
                        </button>
                      </div>
                      <div className="space-y-3">
                        {day.activities.map((act, actIdx) => (
                          <div key={actIdx} className="flex gap-2 items-start bg-background p-2 rounded-md border border-border/40">
                            <div className="flex-1 space-y-2">
                              <Input placeholder="Activity description..." className={styledInput} value={act.description} onChange={e => updateActivity(day.id, actIdx, 'description', e.target.value)} />
                              
                              <div className="flex items-center gap-2">
                                {act.imageUrl ? (
                                  <div className="relative w-16 h-12 rounded overflow-hidden border">
                                    <img src={act.imageUrl} alt="activity" className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => updateActivity(day.id, actIdx, 'imageUrl', null)} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                      <X className="h-4 w-4 text-white" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="relative">
                                    <input 
                                      type="file" accept="image/*" className="hidden" id={`img-${day.id}-${actIdx}`}
                                      onChange={(e) => handleActivityImageUpload(day.id, actIdx, e.target.files[0])}
                                    />
                                    <Button type="button" variant="outline" size="sm" className="h-8 text-xs gap-1" disabled={act.isUploading} onClick={() => document.getElementById(`img-${day.id}-${actIdx}`)?.click()}>
                                      {act.isUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <ImageIcon className="h-3 w-3" />}
                                      Add Image
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                            {day.activities.length > 1 && (
                              <button type="button" onClick={() => removeActivity(day.id, actIdx)} className="p-1.5 text-muted-foreground hover:text-destructive">
                                <X className="h-4 w-4" />
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
          </section>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-7 py-4 border-t border-border/60 bg-muted/20 shrink-0">
          <p className="text-xs text-muted-foreground">
            {days.length} day(s) · {images.length} image(s)
          </p>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="px-5">Cancel</Button>
            <Button type="button" onClick={handleSubmit} disabled={isSubmitting} className="px-6 gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 text-primary-foreground shadow-md">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : isEdit ? <Pencil className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
              {isEdit ? 'Save Changes' : 'Create Package'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
