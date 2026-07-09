import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { packages } from '@/features/agency/services/packages';
import { DashboardLayout } from '@/features/agency/components/dashboard/DashboardLayout';
import { Button } from '@/components/common/ui/button';
import { Input } from '@/components/common/ui/input';
import { Textarea } from '@/components/common/ui/textarea';
import { Label } from '@/components/common/ui/label';
import {
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  CheckCircle,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Upload,
  Info
} from 'lucide-react';
import { Badge } from '@/components/common/ui/badge';
import { api } from '@/features/agency/services/api';
import { toast } from 'sonner';
import { useCurrency } from '@/features/agency/hooks/CurrencyContext';
import { cn } from '@/utils/utils';
import { Switch } from '@/components/common/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/common/ui/select';

const SRI_LANKA_DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
  'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
  'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar',
  'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya',
  'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya',
];

const styledInput = 'h-10 bg-muted/40 border-border/60 focus:border-primary/50 focus:bg-background transition-colors text-sm w-full';

function HotelSearchInput({ district, hotelId, hotelNameCustom, onChange }: { district: string; hotelId: any; hotelNameCustom: string; onChange: (id: any, name: string) => void }) {
  const [query, setQuery] = useState(hotelNameCustom || '');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setQuery(hotelNameCustom || '');
  }, [hotelNameCustom]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    if (hotelId && query === hotelNameCustom) {
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.searchHotels(query, district);
        setResults(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, district, hotelId, hotelNameCustom]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (hotel: any) => {
    onChange(hotel.id, hotel.hotelName);
    setQuery(hotel.hotelName);
    setIsOpen(false);
  };

  const handleTextChange = (val: string) => {
    setQuery(val);
    onChange(null, val);
    setIsOpen(true);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <Input
        placeholder={district ? "Type to search hotels..." : "Select district first"}
        className={styledInput}
        value={query}
        disabled={!district}
        onChange={e => handleTextChange(e.target.value)}
        onFocus={() => district && setIsOpen(true)}
      />
      {hotelId && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
          From DB
        </span>
      )}
      {!hotelId && query && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold bg-muted text-muted-foreground px-2 py-0.5 rounded-full border border-border">
          Custom
        </span>
      )}

      {isOpen && district && query.trim() !== '' && (
        <div className="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-lg border border-border/80 bg-popover text-popover-foreground shadow-lg animate-in fade-in slide-in-from-top-1">
          {loading ? (
            <div className="p-3 text-xs text-muted-foreground flex items-center justify-center gap-2">
              <div className="h-3 w-3 animate-spin rounded-full border border-primary border-t-transparent" />
              Searching approved hotels...
            </div>
          ) : results.length > 0 ? (
            <div className="p-1">
              {results.map((hotel) => (
                <button
                  key={hotel.id}
                  type="button"
                  className="w-full text-left px-3 py-2 text-xs rounded-md hover:bg-accent hover:text-accent-foreground flex items-center gap-2 transition-colors"
                  onClick={() => handleSelect(hotel)}
                >
                  {hotel.imageUrl ? (
                    <img src={hotel.imageUrl} className="h-6 w-8 object-cover rounded border" />
                  ) : (
                    <div className="h-6 w-8 bg-muted rounded border flex items-center justify-center text-[8px]">🏨</div>
                  )}
                  <div>
                    <p className="font-medium text-foreground">{hotel.hotelName}</p>
                    <p className="text-[10px] text-muted-foreground">{hotel.starRating}-Star · {hotel.district}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-3 text-xs text-muted-foreground text-center">
              No matching hotels found. Will save as custom name.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const PackageDetails = () => {
  const { id } = useParams();
  const { formatPrice } = useCurrency();
  const [pkg, setPkg] = useState<any>(undefined);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [blobToFileMap, setBlobToFileMap] = useState<Record<string, File>>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPackage = async () => {
    try {
      setLoading(true);
      const data = await api.getAgentPackage(id);
      if (data && !data.error && data.packageId) {
        const normalized = {
          ...data,
          id: data.packageId,

          description: data.description || '',

          images: (data.images || []).map(img => typeof img === 'string' ? img : img.imageUrl),
          packageType: data.packageType || 'SINGLE_DISTRICT',
          basePriceAdult: data.basePriceAdult || '',
          basePriceChild: data.basePriceChild || '',
          days: (data.days || []).map((day, idx) => ({
            dayNumber: day.dayNumber || idx + 1,
            title: day.title || '',
            description: day.description || '',
            district: day.district || '',
            hotelId: day.hotelId || null,
            hotelNameCustom: day.hotelNameCustom || (day.hotelName || ''),
            activities: (day.activities && day.activities.length) ? day.activities.map(act => (typeof act === 'string' ? { description: act, imageUrl: '' } : { description: act.description || '', imageUrl: act.imageUrl || '' })) : [{ description: '', imageUrl: '' }]
          })),
          inclusions: Array.isArray(data.inclusions) ? data.inclusions : [],
          available: data.isActive !== false,
          bookings: data.bookings || 0
        };
        setPkg(normalized);
      } else {
        const foundPkg = packages.find((p) => p.id === id);
        if (foundPkg) {
          setPkg(JSON.parse(JSON.stringify(foundPkg)));
        } else {
          setPkg(null);
        }
      }
    } catch (error) {
      console.error('Failed to load package details from API, trying mock:', error);
      const foundPkg = packages.find((p) => p.id === id);
      if (foundPkg) {
        setPkg(JSON.parse(JSON.stringify(foundPkg)));
      } else {
        setPkg(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchPackage();
  }, [id]);

  const handleSave = async () => {
    if (!pkg) return;
    
    // Check if it's a database package (e.g. numeric ID, or not PKG-style ID string)
    const isDbPackage = typeof pkg.id === 'number' || !pkg.id.toString().startsWith('PKG');
    
    if (isDbPackage) {
      try {
        const daysPayload = (pkg.days || []).map((d, idx) => ({
          dayNumber: idx + 1,
          title: d.title,
          description: d.description,
          district: pkg.packageType === 'MULTI_DISTRICT' ? (d.district || null) : null,
          hotelId: pkg.packageType === 'MULTI_DISTRICT' ? (d.hotelId || null) : null,
          hotelNameCustom: pkg.packageType === 'MULTI_DISTRICT' ? (d.hotelNameCustom || null) : null,
          activities: d.activities.filter(a => a.description && a.description.trim() !== '').map(a => ({
            description: a.description,
            imageUrl: a.imageUrl || null
          })),
        }));

        const existingImageUrls = (pkg.images || []).filter(url => !url.startsWith('blob:'));
        const newFiles = (pkg.images || [])
          .filter(url => url.startsWith('blob:'))
          .map(url => blobToFileMap[url])
          .filter(Boolean);

        const dataJson = JSON.stringify({
          name: pkg.name,
          category: pkg.category || 'culture',
          district: pkg.district || 'Colombo',
          startPlace: pkg.startPlace,
          endPlace: pkg.endPlace,
          duration: pkg.duration,

          description: pkg.description || '',
          inclusions: Array.isArray(pkg.inclusions) ? pkg.inclusions : [],
          isActive: pkg.available !== false,

          packageType: pkg.packageType || 'SINGLE_DISTRICT',
          basePriceAdult: pkg.basePriceAdult ? Number(pkg.basePriceAdult) : null,
          basePriceChild: pkg.basePriceChild ? Number(pkg.basePriceChild) : null,
          existingImageUrls,
          days: daysPayload,
        });

        const result = await api.updateAgentPackage(pkg.id, dataJson, newFiles);
        if (result.status && result.status >= 400) throw new Error(result.message || result.error || 'Update failed');
        if (result?.success === false) throw new Error(result.message || 'Update failed');
        
        toast.success('Package updated successfully!');
        setIsEditing(false);
        setBlobToFileMap({});
        fetchPackage(); // Reload updated data
      } catch (err) {
        console.error(err);
        toast.error(err.message || 'Failed to save package changes. Please try again.');
      }
    } else {
      // Mock package local update
      setIsEditing(false);
      toast.success('Mock package updated locally!');
    }
  };

  const handleCancel = () => {
    setBlobToFileMap({});
    fetchPackage();
    setIsEditing(false);
  };

  const handleToggleActive = async (checked: boolean) => {
    if (!pkg) return;
    const isDbPackage = typeof pkg.id === 'number' || !pkg.id.toString().startsWith('PKG');
    const updatedPkg = { ...pkg, available: checked };
    setPkg(updatedPkg);
    
    if (isDbPackage) {
      try {
        const daysPayload = (pkg.days || []).map((d, idx) => ({
          dayNumber: idx + 1,
          title: d.title,
          description: d.description,
          district: pkg.packageType === 'MULTI_DISTRICT' ? (d.district || null) : null,
          hotelId: pkg.packageType === 'MULTI_DISTRICT' ? (d.hotelId || null) : null,
          hotelNameCustom: pkg.packageType === 'MULTI_DISTRICT' ? (d.hotelNameCustom || null) : null,
          activities: d.activities.filter(a => a.description && a.description.trim() !== '').map(a => ({
            description: a.description,
            imageUrl: a.imageUrl || null
          })),
        }));
        const existingImageUrls = (pkg.images || []).filter(url => !url.startsWith('blob:'));
        
        const dataJson = JSON.stringify({
          name: pkg.name,
          category: pkg.category || 'culture',
          district: pkg.district || 'Colombo',
          startPlace: pkg.startPlace,
          endPlace: pkg.endPlace,
          duration: pkg.duration,

          description: pkg.description || '',
          inclusions: Array.isArray(pkg.inclusions) ? pkg.inclusions : [],
          isActive: checked,

          packageType: pkg.packageType || 'SINGLE_DISTRICT',
          basePriceAdult: pkg.basePriceAdult ? Number(pkg.basePriceAdult) : null,
          basePriceChild: pkg.basePriceChild ? Number(pkg.basePriceChild) : null,
          existingImageUrls,
          days: daysPayload,
        });

        await api.updateAgentPackage(pkg.id, dataJson, []);
        toast.success(`Package set to ${checked ? 'Active' : 'Inactive'}`);
      } catch (err) {
        console.error(err);
        toast.error('Failed to update package status');
        setPkg({ ...pkg, available: !checked });
      }
    } else {
      toast.success(`Mock package set to ${checked ? 'Active' : 'Inactive'} locally`);
    }
  };


  // Field Updaters
  const updateField = (field: string, value: any) => {
    if (pkg) {
      setPkg({ ...pkg, [field]: value });
    }
  };

  const updateArrayField = (field: string, index: number, value: any) => {
    if (pkg && pkg[field]) {
      const newArray = [...pkg[field]];
      newArray[index] = value; // Direct update if editable, but we might just replace whole array for includes
      // For includes, we'll parse a text block
    }
  };

  const handleIncludesChange = (text: string) => {
    if (pkg) {
      setPkg({ ...pkg, includes: text.split(',').map((i) => i.trim()) });
    }
  };

  // Activity Management
  const addDay = () => {
    if (pkg) {
      const days = pkg.days || [];
      setPkg({
        ...pkg,
        days: [
          ...days,
          { dayNumber: days.length + 1, title: '', description: '', activities: [{ description: '', imageUrl: '' }] },
        ],
      });
    }
  };

  const removeDay = (index: number) => {
    if (pkg && pkg.days) {
      const newDays = pkg.days.filter((_, i) => i !== index);
      // Re-index days
      setPkg({
        ...pkg,
        days: newDays.map((d, i) => ({ ...d, dayNumber: i + 1 })),
      });
    }
  };

  const updateDay = (index: number, field: string, value: any) => {
    if (pkg && pkg.days) {
      const newDays = [...pkg.days];
      newDays[index][field] = value;
      setPkg({ ...pkg, days: newDays });
    }
  };

  const addActivity = (dayIndex: number) => {
    if (pkg && pkg.days) {
      const newDays = [...pkg.days];
      newDays[dayIndex].activities.push({ description: '', imageUrl: '' });
      setPkg({ ...pkg, days: newDays });
    }
  };

  const removeActivity = (dayIndex: number, actIndex: number) => {
    if (pkg && pkg.days) {
      const newDays = [...pkg.days];
      newDays[dayIndex].activities = newDays[dayIndex].activities.filter((_, i) => i !== actIndex);
      setPkg({ ...pkg, days: newDays });
    }
  };

  const updateActivity = (dayIndex: number, actIndex: number, field: string, value: any) => {
    if (pkg && pkg.days) {
      const newDays = [...pkg.days];
      newDays[dayIndex].activities[actIndex][field] = value;
      setPkg({ ...pkg, days: newDays });
    }
  };

  // Image Management
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && pkg) {
      const filesArray = Array.from(files);
      const newMap = { ...blobToFileMap };
      const newImages = filesArray.map((file) => {
        const url = URL.createObjectURL(file);
        newMap[url] = file;
        return url;
      });
      setBlobToFileMap(newMap);
      setPkg({ ...pkg, images: [...(pkg.images || []), ...newImages] });
    }
  };

  const removeImage = (index: number) => {
    if (pkg && pkg.images) {
      setPkg({ ...pkg, images: pkg.images.filter((_, i) => i !== index) });
    }
  };

  const handleActivityImageUpload = async (dayIndex: number, actIndex: number, file: File) => {
    if (!file || !pkg || !pkg.days) return;
    try {
      updateActivity(dayIndex, actIndex, 'isUploading', true);
      const res = await api.uploadPackageImage(file);
      if (res && res.imageUrl) {
        updateActivity(dayIndex, actIndex, 'imageUrl', res.imageUrl);
      } else {
        toast.error('Failed to upload image.');
      }
    } catch (err) {
      toast.error('Failed to upload image.');
    } finally {
      updateActivity(dayIndex, actIndex, 'isUploading', false);
    }
  };

  const removeActivityImage = (dayIndex: number, actIndex: number) => {
    if (pkg && pkg.days) {
      updateActivity(dayIndex, actIndex, 'imageUrl', '');
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Loading..." subtitle="Fetching package details">
        <div className="flex flex-col items-center justify-center p-8">
          <p className="text-muted-foreground">Loading package details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!pkg) {
    return (
      <DashboardLayout
        title="Package Not Found"
        subtitle="Returns to packages list"
      >
        <div className="flex flex-col items-center justify-center p-8">
          <h2 className="text-2xl font-bold mb-4">Package not found</h2>
          <Button asChild>
            <Link to="/agency/packages">Back to Packages</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={pkg.name} subtitle="Package Details" showSearch={false}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild className="-ml-2">
            <Link to="/agency/packages">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Link>
          </Button>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCancel}>
                  <X className="h-4 w-4" /> Cancel Edit
                </Button>
                <Button size="sm" className="gap-1.5" onClick={handleSave}>
                  <Save className="h-4 w-4" /> Save Changes
                </Button>
              </>
            ) : (
              <Button className="h-10 w-10 rounded-lg" variant="outline" size="icon" onClick={() => setIsEditing(true)} title="Edit Package">
                <Edit className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Hero Image Section */}
        <div className="relative h-64 md:h-96 w-full rounded-xl overflow-hidden bg-muted group">
          {pkg.images && pkg.images.length > 0 ? (
            <img
              src={pkg.images[0]}
              alt={pkg.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary via-primary to-accent/80 flex items-center justify-center text-primary-foreground/50 text-4xl font-bold">
              {pkg.name.substring(0, 2).toUpperCase()}
            </div>
          )}

          {isEditing && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" /> Change Cover Image
              </Button>
              {/* Hidden global file input for simplicity, though mapped to main images */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
          )}

          <div className="absolute top-4 right-4 flex gap-2">
            <Badge
              variant={pkg.available ? 'default' : 'destructive'}
              className="text-sm shadow-sm animate-in fade-in"
            >
              {pkg.available ? 'Active' : 'Inactive'}
            </Badge>
            {pkg.applicationStatus && (
              <Badge
                variant="outline"
                className={cn(
                  'text-sm shadow-sm animate-in fade-in flex items-center gap-1.5 backdrop-blur-md bg-background/80',
                  pkg.applicationStatus.trim().toLowerCase() === 'approved' ? 'text-green-600 border-green-500/30' :
                  pkg.applicationStatus.trim().toLowerCase() === 'rejected' ? 'text-destructive border-destructive/30' :
                  'text-warning-foreground border-warning/30'
                )}
              >
                {pkg.applicationStatus.trim().toLowerCase() === 'approved' ? <CheckCircle className="h-3.5 w-3.5" /> :
                 pkg.applicationStatus.trim().toLowerCase() === 'rejected' ? <X className="h-3.5 w-3.5" /> :
                 <Clock className="h-3.5 w-3.5" />}
                {pkg.applicationStatus.trim().toLowerCase() === 'pending' ? 'Pending Approval' : pkg.applicationStatus.trim()}
              </Badge>
            )}
          </div>
        </div>

        {/* Gallery Management in Edit Mode */}
        {isEditing && (
          <div className="space-y-2">
            <Label>Gallery Images</Label>
            <div className="grid grid-cols-4 gap-4">
              {pkg.images?.map((img, idx) => (
                <div
                  key={idx}
                  className="relative aspect-video rounded-md overflow-hidden bg-muted border group/img"
                >
                  <img
                    src={img}
                    alt="Gallery"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-destructive text-white p-1 rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <div
                className="aspect-video rounded-md border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50"
                onClick={() => fileInputRef.current?.click()}
              >
                <Plus className="h-6 w-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground mt-1">
                  Add Image
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Key Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <div>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Package Name</Label>
                    <Input
                      value={pkg.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      className="text-xl font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Package Type</Label>
                    <Select modal={false} value={pkg.packageType || 'SINGLE_DISTRICT'} onValueChange={val => updateField('packageType', val)}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SINGLE_DISTRICT">Single District — Trip within one district</SelectItem>
                        <SelectItem value="MULTI_DISTRICT">Multi District — Trip spanning multiple districts</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1">
                      <Info className="h-3 w-3 shrink-0 mt-0.5" />
                      {pkg.packageType === 'SINGLE_DISTRICT'
                        ? "Tourist selects their preferred hotel at the time of booking."
                        : "You will assign a specific hotel for each day in the itinerary."}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>{pkg.packageType === 'MULTI_DISTRICT' ? "Starting District" : "District"}</Label>
                    <Select modal={false} value={pkg.district || ''} onValueChange={val => updateField('district', val)}>
                      <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
                      <SelectContent>
                        {SRI_LANKA_DISTRICTS.map(d => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {pkg.packageType === 'MULTI_DISTRICT' && (
                      <p className="text-xs text-muted-foreground">
                        This is the starting district. Each day's district is defined in the itinerary.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-bold">{pkg.name}</h2>
                    <Badge variant="secondary">
                      {pkg.packageType === 'MULTI_DISTRICT' ? 'Multi District' : 'Single District'}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="text-base">{pkg.district}</span>
                    </div>
                    {pkg.startPlace && pkg.endPlace && (
                      <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {pkg.startPlace} → {pkg.endPlace}
                      </span>
                    )}
                    {pkg.category && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize font-medium">
                        {pkg.category.toLowerCase()}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4 border rounded-lg bg-card">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Duration
                </p>
                {isEditing ? (
                  <Input
                    value={pkg.duration}
                    onChange={(e) => updateField('duration', e.target.value)}
                    className="h-8"
                  />
                ) : (
                  <p className="font-semibold">{pkg.duration}</p>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-3 w-3" /> Base Adult
                </p>
                {isEditing ? (
                  <Input
                    type="number"
                    value={pkg.basePriceAdult || ''}
                    onChange={(e) =>
                      updateField('basePriceAdult', Number(e.target.value))
                    }
                    className="h-8 w-20 px-1.5 text-xs"
                  />
                ) : (
                  <p className="font-semibold">{formatPrice(pkg.basePriceAdult || 0)}</p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-3 w-3" /> Base Child
                </p>
                {isEditing ? (
                  <Input
                    type="number"
                    value={pkg.basePriceChild || ''}
                    onChange={(e) =>
                      updateField('basePriceChild', Number(e.target.value))
                    }
                    className="h-8 w-20 px-1.5 text-xs"
                  />
                ) : (
                  <p className="font-semibold">{formatPrice(pkg.basePriceChild || 0)}</p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Bookings
                </p>
                <p className="font-semibold">{pkg.bookings}</p>
              </div>
              {!isEditing && (
                <div className="col-span-2 md:col-span-1 flex flex-col gap-2 justify-center border-t md:border-t-0 md:border-l pl-0 md:pl-4 pt-3 md:pt-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Active</span>
                    <Switch
                      checked={pkg.available}
                      onCheckedChange={handleToggleActive}
                    />
                  </div>

                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              {isEditing ? (
                <Textarea
                  value={pkg.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={5}
                />
              ) : (
                <p className="text-muted-foreground leading-relaxed">
                  {pkg.description}
                </p>
              )}
            </div>

            {/* Activities Timeline */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Itinerary</h3>
                {isEditing && (
                  <Button size="sm" variant="outline" onClick={addDay}>
                    <Plus className="h-3 w-3 mr-1" /> Add Day
                  </Button>
                )}
              </div>

              <div className="space-y-6 pl-4 border-l-2 border-muted relative">
                {pkg.days?.map((day, dayIdx) => (
                  <div key={dayIdx} className="relative pl-6 pb-2 group/day">
                    <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-primary border-4 border-background" />

                    {isEditing ? (
                      <div className="space-y-4 p-4 border rounded-lg bg-muted/20 relative">
                        <button
                          onClick={() => removeDay(dayIdx)}
                          className="absolute top-2 right-2 text-destructive hover:bg-destructive/10 p-1 rounded transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <div className="grid grid-cols-4 gap-2">
                          <div className="col-span-1">
                            <Label className="text-xs">Day</Label>
                            <Input
                              type="number"
                              value={day.dayNumber}
                              disabled
                              className="bg-muted"
                            />
                          </div>
                          <div className="col-span-3">
                            <Label className="text-xs">Title</Label>
                            <Input
                              value={day.title}
                              onChange={(e) =>
                                updateDay(dayIdx, 'title', e.target.value)
                              }
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Description</Label>
                          <Textarea
                            value={day.description}
                            onChange={(e) =>
                              updateDay(dayIdx, 'description', e.target.value)
                            }
                          />
                        </div>
                        
                        {pkg.packageType === 'MULTI_DISTRICT' && (
                          <div className="grid grid-cols-2 gap-4 border-t border-border/40 pt-4 mt-2">
                            <div className="space-y-1">
                              <Label className="text-xs">District</Label>
                              <Select modal={false} value={day.district || ''} onValueChange={val => updateDay(dayIdx, 'district', val)}>
                                <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
                                <SelectContent>
                                  {SRI_LANKA_DISTRICTS.map(d => (
                                    <SelectItem key={d} value={d}>{d}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-1">
                              <Label className="text-xs">Hotel</Label>
                              <HotelSearchInput
                                district={day.district}
                                hotelId={day.hotelId}
                                hotelNameCustom={day.hotelNameCustom}
                                onChange={(hotelId, hotelName) => {
                                  updateDay(dayIdx, 'hotelId', hotelId);
                                  updateDay(dayIdx, 'hotelNameCustom', hotelName);
                                }}
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* Activities within Day */}
                        <div className="pt-2 border-t border-border/40 space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold uppercase tracking-wide">Activities</Label>
                            <Button size="sm" variant="ghost" onClick={() => addActivity(dayIdx)} className="h-6 px-2 text-xs">
                              <Plus className="h-3 w-3 mr-1" /> Add Activity
                            </Button>
                          </div>
                          <div className="space-y-3">
                            {day.activities.map((act, actIdx) => (
                              <div key={actIdx} className="flex gap-2 items-start">
                                <div className="flex-1 space-y-2">
                                  <Input
                                    placeholder={`Activity ${actIdx + 1} description...`}
                                    value={act.description || ''}
                                    onChange={(e) => updateActivity(dayIdx, actIdx, 'description', e.target.value)}
                                  />
                                </div>
                                <div className="shrink-0">
                                  {act.isUploading ? (
                                    <div className="h-10 w-10 flex items-center justify-center border rounded-md bg-muted/40">
                                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                    </div>
                                  ) : act.imageUrl ? (
                                    <div className="relative h-10 w-16 group rounded-md overflow-hidden border">
                                      <img src={act.imageUrl} className="w-full h-full object-cover" />
                                      <button type="button" onClick={() => removeActivityImage(dayIdx, actIdx)} className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white"><X className="h-3 w-3" /></button>
                                    </div>
                                  ) : (
                                    <label className="h-10 w-10 flex items-center justify-center border border-dashed hover:border-primary/50 hover:bg-muted/30 rounded-md cursor-pointer transition-colors text-muted-foreground hover:text-primary">
                                      <Upload className="h-4 w-4" />
                                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleActivityImageUpload(dayIdx, actIdx, e.target.files[0])} />
                                    </label>
                                  )}
                                </div>
                                {day.activities.length > 1 && (
                                  <button type="button" onClick={() => removeActivity(dayIdx, actIdx)} className="p-2 text-muted-foreground hover:text-destructive">
                                    <X className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <span className="text-sm font-bold text-primary px-2 py-0.5 rounded bg-primary/10 w-fit">
                            Day {day.dayNumber}
                          </span>
                          <h4 className="font-semibold text-base">{day.title}</h4>
                        </div>
                        <p className="text-muted-foreground text-sm">
                          {day.description}
                        </p>

                        {pkg.packageType === 'MULTI_DISTRICT' && (
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                            {day.district && (
                              <span className="flex items-center gap-1 text-muted-foreground bg-muted/60 px-2 py-1 rounded-md text-xs border">
                                <MapPin className="h-3 w-3" />
                                {day.district}
                              </span>
                            )}
                            {day.hotelName && (
                              <span className="flex items-center gap-1 text-primary bg-primary/5 px-2 py-1 rounded-md text-xs border border-primary/10">
                                🏨 {day.hotelName}
                                {day.hotelId ? (
                                  <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.2 rounded-full font-medium ml-1">Approved</span>
                                ) : (
                                  <span className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.2 rounded-full font-medium ml-1">Custom</span>
                                )}
                              </span>
                            )}
                          </div>
                        )}
                        
                        {/* Render nested activities */}
                        {day.activities && day.activities.some(a => a.description) && (
                          <div className="mt-4 space-y-4">
                            {day.activities.filter(a => a.description).map((act, actIdx) => (
                              <div key={actIdx} className="flex gap-3 items-start p-3 rounded-lg border bg-muted/10">
                                <div className="h-6 w-6 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold mt-0.5">
                                  {actIdx + 1}
                                </div>
                                <div className="flex-1 space-y-2">
                                  <p className="text-sm text-foreground">{act.description}</p>
                                  {act.imageUrl && (
                                    <div 
                                      className="rounded-lg overflow-hidden h-32 w-48 border cursor-pointer group/actimg"
                                      onClick={() => setSelectedImage(act.imageUrl)}
                                    >
                                      <img src={act.imageUrl} alt={`Activity ${actIdx + 1}`} className="w-full h-full object-cover group-hover/actimg:scale-105 transition-transform duration-300" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Gallery View (Read-only mode) */}
            {!isEditing && pkg.images && pkg.images.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Gallery</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {pkg.images.map((img, i) => (
                    <div
                      key={i}
                      className="aspect-video rounded-lg overflow-hidden border bg-muted cursor-pointer"
                      onClick={() => setSelectedImage(img)}
                    >
                      <img
                        src={img}
                        alt={`Gallery ${i + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="p-6 border rounded-xl bg-card shadow-sm space-y-4">
              <h3 className="font-semibold text-xl">What's Included</h3>
              {isEditing ? (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Edit inclusions from the Create/Edit package form. These are saved as a list.</p>
                  <div className="flex flex-wrap gap-2">
                    {(pkg.inclusions || []).map((item, i) => (
                      <span key={i} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-muted border">
                        {item}
                        <button type="button" onClick={() => setPkg({ ...pkg, inclusions: pkg.inclusions.filter((_, idx) => idx !== i) })} className="text-muted-foreground hover:text-destructive ml-1">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ) : pkg.inclusions && pkg.inclusions.length > 0 ? (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {pkg.inclusions.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-foreground/80"
                    >
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground italic">No inclusions specified.</p>
              )}
              {/* "Book This Package" button removed as requested */}
            </div>
          </div>
        </div>
      </div>

      {/* Image Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative w-[65%] max-h-[90vh] bg-transparent flex items-center justify-center animate-in fade-in zoom-in-95 duration-200">
            <button 
              className="absolute -top-10 right-0 text-white hover:text-gray-300 bg-black/50 hover:bg-black/80 rounded-full p-2 transition-colors"
              onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
            >
              <X className="h-6 w-6" />
            </button>
            <img 
              src={selectedImage} 
              alt="Expanded view" 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default PackageDetails;
