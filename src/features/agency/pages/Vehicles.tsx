import { useState, useRef, useEffect } from 'react';
import {
  Car, Plus, Search, Edit, Trash2, User,
  CheckCircle, Clock, AlertTriangle, Upload, Star, Lock,
} from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/common/ui/alert-dialog';
import { DashboardLayout } from '@/features/agency/components/dashboard/DashboardLayout';
import { toast } from '@/components/common/ui/sonner';
import { Textarea } from '@/components/common/ui/textarea';
import { Checkbox } from '@/components/common/ui/checkbox';
import { Button } from '@/components/common/ui/button';
import { Input } from '@/components/common/ui/input';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/common/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/common/ui/dialog';
import { Label } from '@/components/common/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/common/ui/select';
import { cn } from '@/utils/utils';
import { api } from '@/features/agency/services/api';
import { Skeleton } from '@/components/common/ui/skeleton';

// ── Upload helper ──────────────────────────────────────────────
const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  const response = await fetch(`${apiBase}/api/upload/image`, {
    method: 'POST',
    body: formData,
  });
  const result = await response.json();
  if (result.success && result.data?.imageUrl) return result.data.imageUrl;
  throw new Error(result.message || 'Upload failed');
};

/* --- UI CONFIGURATION: Icons and Styles for Vehicle/Driver Status --- */
const statusConfig = {
  available: { icon: CheckCircle, class: 'badge-available', label: 'Available' },
  booked: { icon: Clock, class: 'badge-booked', label: 'Booked' },
  maintenance: { icon: AlertTriangle, class: 'badge-maintenance', label: 'Maintenance' },
  'on-trip': { icon: Clock, class: 'badge-active', label: 'On Trip' },
  'off-duty': { icon: AlertTriangle, class: 'badge-pending', label: 'Off Duty' },
};

/* --- FLEET CONFIGURATION: Predefined Vehicle Types, Brands, and Models --- */
const VEHICLE_TYPES = ['Tuk', 'Car', 'Minivan/VAN'];
const VEHICLE_BRANDS = {
  'Tuk': ['Bajaj', 'Piaggio', 'TVS'],
  'Car': ['Toyota', 'Honda', 'Suzuki', 'Nissan'],
  'Minivan/VAN': ['Toyota', 'Nissan', 'Mercedes'],
};
const VEHICLE_MODELS = {
  'Bajaj': ['RE 4S', 'Maxima'], 'Piaggio': ['Ape'], 'TVS': ['King'],
  'Toyota': ['Corolla', 'Prius', 'Aqua', 'Yaris', 'Hiace', 'Alphard'],
  'Honda': ['Civic', 'Fit', 'Vezel'], 'Suzuki': ['Wagon R', 'Alto 800', 'Swift'],
  'Nissan': ['Sunny', 'March', 'NV200', 'Caravan'], 'Mercedes': ['V-Class', 'Vito'],
};
const VEHICLE_COLORS = ['White', 'Black', 'Silver', 'Red', 'Blue', 'Grey', 'Yellow', 'Green'];

const defaultNewDriver = {
  firstName: '', lastName: '', email: '', license: '', nic: '',
  licenseExpiryDate: '', mobileNumber: '', secondaryMobileNumber: '',
  addressLine1: '', addressLine2: '', bloodGroup: '', vehicleTypes: [],
  status: 'available', lifecycleStatus: 'active', image: '',
  nicFront: null, nicRear: null, licenseFront: null, licenseRear: null,
};

const defaultNewVehicle = {
  ownerId: '',
  ownerFirstName: '', ownerLastName: '', nicNumber: '', nicFrontImage: null, nicRearImage: null,
  addressLine1: '', addressLine2: '', mobileNumber: '', secondaryMobileNumber: '', ownerEmail: '',
  vehicleType: '', brand: '', model: '', capacity: '', yearOfManufacture: '', color: '',
  registration: '', status: 'available', lifecycleStatus: 'active',
  insuranceCardFront: null, insuranceExpiryDate: '', revenueLicenseImage: null,
  vehicleImageFront: null, vehicleImageBack: null, vehicleImageSide: null, vehicleImageInside: null,
};

// ── ImageUploadField with folder support ───────────────────────
const ImageUploadField = ({ label, value, onChange, onRemove }) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
      toast.success('Image uploaded');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div
        className="relative h-32 w-full rounded-lg border-2 border-dashed border-input flex items-center justify-center overflow-hidden hover:bg-muted/50 transition-colors cursor-pointer"
        onClick={() => !value && !uploading && inputRef.current?.click()}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-xs">Uploading...</span>
          </div>
        ) : value ? (
          <>
            <img src={value} alt={label} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Button variant="destructive" size="sm"
                onClick={(e) => { e.stopPropagation(); onRemove(); }}>Remove</Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-muted-foreground p-4 text-center">
            <Upload className="h-6 w-6" />
            <span className="text-xs">Click to upload</span>
          </div>
        )}
        <input type="file" ref={inputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
      </div>
    </div>
  );
};

/* --- SUB-COMPONENT: READ-ONLY FIELD WITH LOCK ICON (For Admin-protected data) --- */
const LockedField = ({ label, value, isImage }) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    {isImage ? (
      <div className="h-20 w-32 rounded border border-dashed flex items-center justify-center bg-muted/50 overflow-hidden relative">
        {value ? <img src={value} alt={label} className="h-full w-full object-cover opacity-50 grayscale" /> : <span className="text-[10px] text-muted-foreground text-center">No image</span>}
        <Lock className="absolute h-4 w-4 text-foreground/70" />
      </div>
    ) : (
      <div className="relative">
        <Input value={value || ''} disabled className="pr-8 bg-muted text-muted-foreground cursor-not-allowed" />
        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>
    )}
  </div>
);

/* --- MAIN PAGE COMPONENT: FLEET & DRIVER MANAGEMENT --- */
const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [owners, setOwners] = useState([]);
  const [isNewOwner, setIsNewOwner] = useState(true);
  const [loading, setLoading] = useState(true);
  const [searchVehicle, setSearchVehicle] = useState('');
  const [searchDriver, setSearchDriver] = useState('');
  const [activeTab, setActiveTab] = useState('vehicles');
  const [vehicleFilter, setVehicleFilter] = useState('active');
  const [driverFilter, setDriverFilter] = useState('active');
  const [deleteActionDriver, setDeleteActionDriver] = useState(null);
  const [deleteActionVehicle, setDeleteActionVehicle] = useState(null);
  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [editingDriver, setEditingDriver] = useState(null);
  const [newVehicle, setNewVehicle] = useState(defaultNewVehicle);
  const [newDriver, setNewDriver] = useState(defaultNewDriver);
  const [changeRequestModalOpen, setChangeRequestModalOpen] = useState(false);
  const [changeRequestData, setChangeRequestData] = useState({ fieldName: '', currentValue: '', newValue: '', reason: '' });
  const [driverPhotoUploading, setDriverPhotoUploading] = useState(false);
  const fileInputRef = useRef(null);

  /* --- DATA FETCHING: Load Fleet and Drivers from API --- */
  useEffect(() => {
    fetchVehicles();
    fetchDrivers();
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      const data = await api.getOwners();
      setOwners(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to load owners');
    }
  };

  const fetchVehicles = async () => {
    try {
      const data = await api.getVehicles();
      setVehicles(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const data = await api.getDrivers();
      setDrivers(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to load drivers');
    }
  };

  // ── Vehicle handlers ───────────────────────────────────────
  const handleCreateVehicle = () => {
    setNewVehicle(defaultNewVehicle);
    setEditingVehicle(null);
    setIsNewOwner(true);
    setIsAddVehicleOpen(true);
  };

  const handleEditVehicle = (vehicle) => {
    setNewVehicle({
      ...defaultNewVehicle,
      ...vehicle,
      ownerId: vehicle.owner ? vehicle.owner.id : '',
      ownerFirstName: vehicle.owner ? vehicle.owner.firstName : (vehicle.ownerFirstName || ''),
      ownerLastName: vehicle.owner ? vehicle.owner.lastName : (vehicle.ownerLastName || ''),
      nicNumber: vehicle.owner ? vehicle.owner.nicNumber : (vehicle.nicNumber || ''),
      nicFrontImage: vehicle.owner ? vehicle.owner.nicFrontImage : (vehicle.nicFrontImage || null),
      nicRearImage: vehicle.owner ? vehicle.owner.nicRearImage : (vehicle.nicRearImage || null),
      addressLine1: vehicle.owner ? vehicle.owner.addressLine1 : (vehicle.addressLine1 || ''),
      addressLine2: vehicle.owner ? vehicle.owner.addressLine2 : (vehicle.addressLine2 || ''),
      mobileNumber: vehicle.owner ? vehicle.owner.mobileNumber : (vehicle.mobileNumber || ''),
      secondaryMobileNumber: vehicle.owner ? vehicle.owner.secondaryMobileNumber : (vehicle.secondaryMobileNumber || ''),
      ownerEmail: vehicle.owner ? vehicle.owner.email : (vehicle.ownerEmail || ''),
    });
    setEditingVehicle(vehicle);
    setIsNewOwner(false);
    setIsAddVehicleOpen(true);
  };

  const handleOwnerSelect = (ownerIdStr) => {
    const selected = owners.find(o => String(o.id) === ownerIdStr);
    if (selected) {
      setNewVehicle(prev => ({
        ...prev,
        ownerId: selected.id,
        ownerFirstName: selected.firstName,
        ownerLastName: selected.lastName,
        nicNumber: selected.nicNumber,
        nicFrontImage: selected.nicFrontImage,
        nicRearImage: selected.nicRearImage,
        addressLine1: selected.addressLine1,
        addressLine2: selected.addressLine2,
        mobileNumber: selected.mobileNumber,
        secondaryMobileNumber: selected.secondaryMobileNumber,
        ownerEmail: selected.email,
      }));
    }
  };

  const handleSaveVehicle = async () => {
    if (!newVehicle.registration) { toast.error('Registration number is required'); return; }
    try {
      const payload = {
        ownerId: isNewOwner ? null : (parseInt(newVehicle.ownerId) || null),
        ownerFirstName: newVehicle.ownerFirstName,
        ownerLastName: newVehicle.ownerLastName,
        nicNumber: newVehicle.nicNumber,
        nicFrontImage: newVehicle.nicFrontImage,
        nicRearImage: newVehicle.nicRearImage,
        addressLine1: newVehicle.addressLine1,
        addressLine2: newVehicle.addressLine2,
        mobileNumber: newVehicle.mobileNumber,
        secondaryMobileNumber: newVehicle.secondaryMobileNumber,
        ownerEmail: newVehicle.ownerEmail,
        vehicleType: newVehicle.vehicleType,
        brand: newVehicle.brand,
        model: newVehicle.model,
        color: newVehicle.color,
        capacity: parseInt(newVehicle.capacity) || 0,
        yearOfManufacture: String(newVehicle.yearOfManufacture),
        registration: newVehicle.registration,
        insuranceCardFront: newVehicle.insuranceCardFront,
        insuranceExpiryDate: newVehicle.insuranceExpiryDate,
        revenueLicenseImage: newVehicle.revenueLicenseImage,
        vehicleImageFront: newVehicle.vehicleImageFront,
        vehicleImageBack: newVehicle.vehicleImageBack,
        vehicleImageSide: newVehicle.vehicleImageSide,
        vehicleImageInside: newVehicle.vehicleImageInside,
      };
      if (editingVehicle) {
        const updated = await api.updateVehicle(editingVehicle.id, payload);
        if (updated.success === false || updated.error || (typeof updated.status === 'number' && updated.status >= 400)) throw new Error(updated.message || updated.error || 'Update failed');
        setVehicles(prev => prev.map(v => v.id === editingVehicle.id ? updated : v));
        toast.success('Vehicle updated successfully');
      } else {
        const created = await api.createVehicle(payload);
        if (created.success === false || created.error || (typeof created.status === 'number' && created.status >= 400)) throw new Error(created.message || created.error || 'Create failed');
        setVehicles(prev => [...prev, created]);
        toast.success('Vehicle registered successfully');
      }
      fetchOwners(); // Refresh inline owner listing options
      setIsAddVehicleOpen(false);
      setNewVehicle(defaultNewVehicle);
      setEditingVehicle(null);
    } catch (error) {
      toast.error(error.message || 'Failed to save vehicle');
    }
  };

  const handleVehicleStatusChange = async (id, newStatus) => {
    try {
      const updated = await api.updateVehicleStatus(id, newStatus);
      setVehicles(prev => prev.map(v => v.id === id ? updated : v));
    } catch (error) { toast.error('Failed to update vehicle status'); }
  };

  const handleSuspendVehicle = async (id) => {
    try {
      const updated = await api.updateVehicleLifecycle(id, 'suspended');
      setVehicles(prev => prev.map(v => v.id === id ? updated : v));
      toast.success('Vehicle suspended successfully');
      setDeleteActionVehicle(null);
    } catch (error) { toast.error('Failed to suspend vehicle'); }
  };

  const handleRestoreVehicle = async (id) => {
    try {
      const updated = await api.updateVehicleLifecycle(id, 'active');
      setVehicles(prev => prev.map(v => v.id === id ? updated : v));
      toast.success('Vehicle restored successfully');
    } catch (error) { toast.error('Failed to restore vehicle'); }
  };

  const handlePermanentDeleteVehicle = async (id) => {
    try {
      await api.deleteVehicle(id);
      setVehicles(prev => prev.filter(v => v.id !== id));
      toast.success('Vehicle permanently deleted');
      setDeleteActionVehicle(null);
    } catch (error) { toast.error('Cannot delete — vehicle may have active bookings'); }
  };

  // ── Driver handlers ────────────────────────────────────────
  const handleVehicleTypeToggle = (type) => {
    setNewDriver(prev => ({
      ...prev,
      vehicleTypes: prev.vehicleTypes.includes(type)
        ? prev.vehicleTypes.filter(t => t !== type)
        : [...prev.vehicleTypes, type]
    }));
  };

  const handleCreateDriver = () => {
    setEditingDriver(null);
    setNewDriver(defaultNewDriver);
    setIsAddDriverOpen(true);
  };

  const handleEditDriver = (driver) => {
    setEditingDriver(driver);
    setNewDriver({
      ...defaultNewDriver, ...driver,
      firstName: driver.firstName || (driver.name ? driver.name.split(' ')[0] : ''),
      lastName: driver.lastName || (driver.name ? driver.name.split(' ').slice(1).join(' ') : ''),
      mobileNumber: driver.mobileNumber || driver.contact || '',
      license: driver.licenseNumber || driver.license || '',
      vehicleTypes: driver.vehicleTypes ? driver.vehicleTypes.split(',') : [],
      image: driver.profileImage || driver.image || '',
    });
    setIsAddDriverOpen(true);
  };

  const handleSaveDriver = async () => {
    if (!newDriver.firstName || !newDriver.nic || !newDriver.mobileNumber || !newDriver.license || newDriver.vehicleTypes.length === 0) {
      toast.error('Please fill in all mandatory fields'); return;
    }
    try {
      const payload = {
        firstName: newDriver.firstName,
        lastName: newDriver.lastName,
        nic: newDriver.nic,
        bloodGroup: newDriver.bloodGroup,
        email: newDriver.email,
        mobileNumber: newDriver.mobileNumber,
        secondaryMobileNumber: newDriver.secondaryMobileNumber,
        addressLine1: newDriver.addressLine1,
        addressLine2: newDriver.addressLine2,
        licenseNumber: newDriver.license,
        licenseExpiryDate: newDriver.licenseExpiryDate,
        vehicleTypes: newDriver.vehicleTypes.join(','),
        profileImage: newDriver.image,
        nicFrontImage: newDriver.nicFront,
        nicRearImage: newDriver.nicRear,
        licenseFrontImage: newDriver.licenseFront,
        licenseRearImage: newDriver.licenseRear,
      };
      if (editingDriver) {
        const updated = await api.updateDriver(editingDriver.id, payload);
        if (updated.success === false || updated.error || (typeof updated.status === 'number' && updated.status >= 400)) throw new Error(updated.message || updated.error || 'Update failed');
        setDrivers(prev => prev.map(d => d.id === editingDriver.id ? updated : d));
        toast.success('Driver updated successfully');
      } else {
        const created = await api.createDriver(payload);
        if (created.success === false || created.error || (typeof created.status === 'number' && created.status >= 400)) throw new Error(created.message || created.error || 'Create failed');
        setDrivers(prev => [...prev, created]);
        toast.success('Driver added successfully');
      }
      setIsAddDriverOpen(false);
      setNewDriver(defaultNewDriver);
      setEditingDriver(null);
    } catch (error) {
      toast.error(error.message || 'Failed to save driver. Check NIC and license are unique.');
    }
  };

  const handleDriverStatusChange = async (id, newStatus) => {
    try {
      const updated = await api.updateDriverStatus(id, newStatus);
      setDrivers(prev => prev.map(d => d.id === id ? updated : d));
    } catch (error) { toast.error('Failed to update driver status'); }
  };

  const handleSuspendDriver = async (id) => {
    try {
      const updated = await api.updateDriverLifecycle(id, 'suspended');
      setDrivers(prev => prev.map(d => d.id === id ? updated : d));
      toast.success('Driver suspended successfully');
      setDeleteActionDriver(null);
    } catch (error) { toast.error('Failed to suspend driver'); }
  };

  const handleRestoreDriver = async (id) => {
    try {
      const updated = await api.updateDriverLifecycle(id, 'active');
      setDrivers(prev => prev.map(d => d.id === id ? updated : d));
      toast.success('Driver restored successfully');
    } catch (error) { toast.error('Failed to restore driver'); }
  };

  const handlePermanentDeleteDriver = async (id) => {
    try {
      await api.deleteDriver(id);
      setDrivers(prev => prev.filter(d => d.id !== id));
      toast.success('Driver permanently deleted');
      setDeleteActionDriver(null);
    } catch (error) { toast.error('Cannot delete — driver may be on an active trip'); }
  };

  // ── Driver photo upload → drivers/profile folder ───────────
  const handleDriverImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDriverPhotoUploading(true);
    try {
      const url = await uploadImage(file);
      setNewDriver(prev => ({ ...prev, image: url }));
      toast.success('Photo uploaded');
    } catch (error) {
      toast.error('Failed to upload photo');
    } finally {
      setDriverPhotoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeDriverImage = () => {
    setNewDriver(prev => ({ ...prev, image: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Change Request ─────────────────────────────────────────
  const handleRequestChange = (fieldName, currentValue) => {
    setChangeRequestData({ fieldName, currentValue: currentValue || '', newValue: '', reason: '' });
    setChangeRequestModalOpen(true);
  };

  const submitChangeRequest = () => {
    if (!changeRequestData.newValue || !changeRequestData.reason) {
      toast.error('Please provide both a new value and a reason.'); return;
    }
    toast.success('Your request has been submitted and is pending admin approval');
    setChangeRequestModalOpen(false);
  };

  // ── Locked Field ───────────────────────────────────────────
  const LockedField = ({ label, value, isImage }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      {isImage ? (
        <div className="h-20 w-32 rounded border border-dashed flex items-center justify-center bg-muted/50 overflow-hidden relative">
          {value ? <img src={value} alt={label} className="h-full w-full object-cover opacity-50 grayscale" /> : <span className="text-[10px] text-muted-foreground text-center">No image</span>}
          <Lock className="absolute h-4 w-4 text-foreground/70" />
        </div>
      ) : (
        <div className="relative">
          <Input value={value || ''} disabled className="pr-8 bg-muted text-muted-foreground cursor-not-allowed" />
          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );

  // ── Filter ─────────────────────────────────────────────────
  const filteredVehicles = vehicles.filter(v =>
    (v.lifecycleStatus === vehicleFilter || (!v.lifecycleStatus && vehicleFilter === 'active')) &&
    ((v.brand || v.name || '').toLowerCase().includes(searchVehicle.toLowerCase()) ||
      (v.registration || '').toLowerCase().includes(searchVehicle.toLowerCase()))
  );

  const filteredDrivers = drivers.filter(d =>
    (d.lifecycleStatus === driverFilter || (!d.lifecycleStatus && driverFilter === 'active')) &&
    ((d.firstName || d.name || '').toLowerCase().includes(searchDriver.toLowerCase()) ||
      (d.licenseNumber || d.license || '').toLowerCase().includes(searchDriver.toLowerCase()) ||
      (d.email || '').toLowerCase().includes(searchDriver.toLowerCase()) ||
      (d.mobileNumber || d.contact || '').includes(searchDriver))
  );

  return (
    <DashboardLayout title="Vehicles AND Drivers" subtitle="Manage your fleet and driver assignments" showSearch={false}>
      <div className="space-y-6">

        {/* 1. CHANGE REQUEST MODAL: For requesting edits to read-only fields */}
        {/* Change Request Modal */}
        <Dialog open={changeRequestModalOpen} onOpenChange={setChangeRequestModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader><DialogTitle>Request Change</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2"><Label>Field</Label><Input value={changeRequestData.fieldName} disabled className="bg-muted" /></div>
              <div className="space-y-2"><Label>Current Value</Label><Input value={changeRequestData.currentValue || ''} disabled className="bg-muted" /></div>
              <div className="space-y-2"><Label>New Value <span className="text-destructive">*</span></Label><Input placeholder="Enter new value" value={changeRequestData.newValue} onChange={(e) => setChangeRequestData({ ...changeRequestData, newValue: e.target.value })} /></div>
              <div className="space-y-2"><Label>Reason <span className="text-destructive">*</span></Label><Textarea placeholder="Why are you changing this field?" value={changeRequestData.reason} onChange={(e) => setChangeRequestData({ ...changeRequestData, reason: e.target.value })} /></div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setChangeRequestModalOpen(false)}>Cancel</Button>
              <Button onClick={submitChangeRequest}>Submit Request</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* 2. NAVIGATION TABS: Switch between Vehicles and Drivers view */}
        <div className="flex gap-2 border-b border-border pb-4">
          <Button variant={activeTab === 'vehicles' ? 'default' : 'ghost'} onClick={() => setActiveTab('vehicles')} className="gap-2">
            <Car className="h-4 w-4" />Vehicles
          </Button>
          <Button variant={activeTab === 'drivers' ? 'default' : 'ghost'} onClick={() => setActiveTab('drivers')} className="gap-2">
            <User className="h-4 w-4" />Drivers
          </Button>
        </div>

        {activeTab === 'vehicles' ? (
          <>
            {/* --- VEHICLE MANAGEMENT SECTION --- */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-4 w-full sm:w-auto">
                <div className="flex bg-muted p-1 rounded-lg">
                  <Button variant={vehicleFilter === 'active' ? 'secondary' : 'ghost'} size="sm" onClick={() => setVehicleFilter('active')}>Active</Button>
                  <Button variant={vehicleFilter === 'suspended' ? 'secondary' : 'ghost'} size="sm" onClick={() => setVehicleFilter('suspended')}>Suspended</Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search vehicles..." value={searchVehicle} onChange={(e) => setSearchVehicle(e.target.value)} className="w-full sm:w-64 pl-9" />
                </div>
              </div>
              <Button className="gap-2" onClick={handleCreateVehicle}><Plus className="h-4 w-4" />Add Vehicle</Button>

              {/* Add/Edit Vehicle Dialog */}
              <Dialog open={isAddVehicleOpen} onOpenChange={setIsAddVehicleOpen}>
                <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[700px]">
                  <DialogHeader><DialogTitle>{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle></DialogHeader>
                  <div className="space-y-8 py-4">

                    {/* Section 1: Owner Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold border-b pb-2">1. Owner Information</h3>
                      
                      {!editingVehicle && (
                        <div className="flex bg-muted p-1 rounded-lg w-full max-w-sm mb-4">
                          <Button 
                            type="button" 
                            variant={isNewOwner ? 'secondary' : 'ghost'} 
                            className="flex-1 text-xs" 
                            onClick={() => {
                              setIsNewOwner(true);
                              setNewVehicle(prev => ({
                                ...prev,
                                ownerId: '',
                                ownerFirstName: '', ownerLastName: '', nicNumber: '', nicFrontImage: null, nicRearImage: null,
                                addressLine1: '', addressLine2: '', mobileNumber: '', secondaryMobileNumber: '', ownerEmail: '',
                              }));
                            }}
                          >
                            Register New Owner
                          </Button>
                          <Button 
                            type="button" 
                            variant={!isNewOwner ? 'secondary' : 'ghost'} 
                            className="flex-1 text-xs" 
                            onClick={() => setIsNewOwner(false)}
                            disabled={owners.length === 0}
                          >
                            Select Existing Owner ({owners.length})
                          </Button>
                        </div>
                      )}

                      {!editingVehicle && !isNewOwner ? (
                        <div className="space-y-2">
                          <Label>Select Owner</Label>
                          <Select value={String(newVehicle.ownerId || '')} onValueChange={handleOwnerSelect}>
                            <SelectTrigger><SelectValue placeholder="Choose an owner..." /></SelectTrigger>
                            <SelectContent>
                              {owners.map(o => (
                                <SelectItem key={o.id} value={String(o.id)}>
                                  {o.firstName} {o.lastName} ({o.nicNumber})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          {/* Visual summary of selected owner */}
                          {newVehicle.ownerId && (
                            <div className="mt-4 p-4 rounded-lg bg-muted/40 border text-sm space-y-2">
                              <div><strong>Name:</strong> {newVehicle.ownerFirstName} {newVehicle.ownerLastName}</div>
                              <div><strong>NIC Number:</strong> {newVehicle.nicNumber}</div>
                              <div><strong>Mobile:</strong> {newVehicle.mobileNumber}</div>
                              <div><strong>Email:</strong> {newVehicle.ownerEmail || 'N/A'}</div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>First Name</Label><Input value={newVehicle.ownerFirstName} onChange={(e) => setNewVehicle({ ...newVehicle, ownerFirstName: e.target.value })} /></div>
                            <div className="space-y-2"><Label>Last Name</Label><Input value={newVehicle.ownerLastName} onChange={(e) => setNewVehicle({ ...newVehicle, ownerLastName: e.target.value })} /></div>
                          </div>
                          {editingVehicle
                            ? <LockedField label="NIC Number" value={newVehicle.nicNumber} />
                            : <div className="space-y-2"><Label>NIC Number</Label><Input value={newVehicle.nicNumber} onChange={(e) => setNewVehicle({ ...newVehicle, nicNumber: e.target.value })} /></div>}
                          <div className="grid grid-cols-2 gap-4">
                            {editingVehicle
                              ? <LockedField label="NIC Front Image" value={newVehicle.nicFrontImage} isImage />
                              : <ImageUploadField label="NIC Front Image" folder="vehicles/documents" value={newVehicle.nicFrontImage} onChange={(val) => setNewVehicle({ ...newVehicle, nicFrontImage: val })} onRemove={() => setNewVehicle({ ...newVehicle, nicFrontImage: null })} />}
                            {editingVehicle
                              ? <LockedField label="NIC Rear Image" value={newVehicle.nicRearImage} isImage />
                              : <ImageUploadField label="NIC Rear Image" folder="vehicles/documents" value={newVehicle.nicRearImage} onChange={(val) => setNewVehicle({ ...newVehicle, nicRearImage: val })} onRemove={() => setNewVehicle({ ...newVehicle, nicRearImage: null })} />}
                          </div>
                          <div className="space-y-2"><Label>Address Line 1</Label><Input value={newVehicle.addressLine1} onChange={(e) => setNewVehicle({ ...newVehicle, addressLine1: e.target.value })} /></div>
                          <div className="space-y-2"><Label>Address Line 2</Label><Input value={newVehicle.addressLine2} onChange={(e) => setNewVehicle({ ...newVehicle, addressLine2: e.target.value })} /></div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Mobile Number</Label><Input value={newVehicle.mobileNumber} onChange={(e) => setNewVehicle({ ...newVehicle, mobileNumber: e.target.value })} /></div>
                            <div className="space-y-2"><Label>Secondary Mobile</Label><Input value={newVehicle.secondaryMobileNumber} onChange={(e) => setNewVehicle({ ...newVehicle, secondaryMobileNumber: e.target.value })} /></div>
                          </div>
                          <div className="space-y-2"><Label>Email (Optional)</Label><Input type="email" value={newVehicle.ownerEmail} onChange={(e) => setNewVehicle({ ...newVehicle, ownerEmail: e.target.value })} /></div>
                        </>
                      )}
                    </div>

                    {/* Section 2: Vehicle Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold border-b pb-2">2. Vehicle Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Vehicle Type</Label>
                          <Select value={newVehicle.vehicleType} onValueChange={(value) => setNewVehicle({ ...newVehicle, vehicleType: value, brand: '', model: '' })}>
                            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                            <SelectContent>{VEHICLE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2"><Label>Brand</Label>
                          <Select value={newVehicle.brand} onValueChange={(value) => setNewVehicle({ ...newVehicle, brand: value, model: '' })} disabled={!newVehicle.vehicleType}>
                            <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
                            <SelectContent>{(VEHICLE_BRANDS[newVehicle.vehicleType] || []).map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2"><Label>Model</Label>
                          <Select value={newVehicle.model} onValueChange={(value) => setNewVehicle({ ...newVehicle, model: value })} disabled={!newVehicle.brand}>
                            <SelectTrigger><SelectValue placeholder="Select model" /></SelectTrigger>
                            <SelectContent>{(VEHICLE_MODELS[newVehicle.brand] || []).map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2"><Label>Color</Label>
                          <Select value={newVehicle.color} onValueChange={(value) => setNewVehicle({ ...newVehicle, color: value })}>
                            <SelectTrigger><SelectValue placeholder="Select color" /></SelectTrigger>
                            <SelectContent>{VEHICLE_COLORS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2"><Label>Passenger Capacity</Label><Input type="number" value={newVehicle.capacity} onChange={(e) => setNewVehicle({ ...newVehicle, capacity: parseInt(e.target.value) || 0 })} /></div>
                        {editingVehicle
                          ? <LockedField label="Year of Manufacture" value={newVehicle.yearOfManufacture} />
                          : <div className="space-y-2"><Label>Year of Manufacture</Label><Input type="number" value={newVehicle.yearOfManufacture} onChange={(e) => setNewVehicle({ ...newVehicle, yearOfManufacture: e.target.value })} /></div>}
                      </div>
                      {editingVehicle
                        ? <LockedField label="Registration Number" value={newVehicle.registration} />
                        : <div className="space-y-2"><Label>License Plate Number</Label><Input placeholder="e.g., KA-01-AB-1234" value={newVehicle.registration} onChange={(e) => setNewVehicle({ ...newVehicle, registration: e.target.value })} /></div>}
                    </div>

                    {/* Section 3: Documents and Photos */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold border-b pb-2">3. Documents and Photos</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <ImageUploadField label="Insurance Card (Front)" folder="vehicles/documents" value={newVehicle.insuranceCardFront} onChange={(val) => setNewVehicle({ ...newVehicle, insuranceCardFront: val })} onRemove={() => setNewVehicle({ ...newVehicle, insuranceCardFront: null })} />
                        <div className="space-y-2"><Label>Insurance Expiry Date</Label><Input type="date" value={newVehicle.insuranceExpiryDate} onChange={(e) => setNewVehicle({ ...newVehicle, insuranceExpiryDate: e.target.value })} /></div>
                      </div>
                      <ImageUploadField label="Revenue License" folder="vehicles/documents" value={newVehicle.revenueLicenseImage} onChange={(val) => setNewVehicle({ ...newVehicle, revenueLicenseImage: val })} onRemove={() => setNewVehicle({ ...newVehicle, revenueLicenseImage: null })} />
                      <Label className="block mt-4">Vehicle Photos</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <ImageUploadField label="Front View" folder="vehicles/photos" value={newVehicle.vehicleImageFront} onChange={(val) => setNewVehicle({ ...newVehicle, vehicleImageFront: val })} onRemove={() => setNewVehicle({ ...newVehicle, vehicleImageFront: null })} />
                        <ImageUploadField label="Back View" folder="vehicles/photos" value={newVehicle.vehicleImageBack} onChange={(val) => setNewVehicle({ ...newVehicle, vehicleImageBack: val })} onRemove={() => setNewVehicle({ ...newVehicle, vehicleImageBack: null })} />
                        <ImageUploadField label="Side View" folder="vehicles/photos" value={newVehicle.vehicleImageSide} onChange={(val) => setNewVehicle({ ...newVehicle, vehicleImageSide: val })} onRemove={() => setNewVehicle({ ...newVehicle, vehicleImageSide: null })} />
                        <ImageUploadField label="Interior View" folder="vehicles/photos" value={newVehicle.vehicleImageInside} onChange={(val) => setNewVehicle({ ...newVehicle, vehicleImageInside: val })} onRemove={() => setNewVehicle({ ...newVehicle, vehicleImageInside: null })} />
                      </div>
                    </div>

                    <Button className="w-full mt-8" onClick={handleSaveVehicle}>
                      {editingVehicle ? 'Update Vehicle' : 'Register Vehicle'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Vehicles Grid */}
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-4">
                    <Skeleton className="aspect-video w-full rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Skeleton className="h-9 flex-1" />
                      <Skeleton className="h-9 flex-1" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredVehicles.length === 0 ? (
              <p className="text-muted-foreground">No vehicles found.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredVehicles.map((vehicle) => {
                  const status = statusConfig[vehicle.status] || statusConfig['available'];
                  const StatusIcon = status.icon;
                  const vehicleName = vehicle.brand && vehicle.model ? `${vehicle.brand} ${vehicle.model}` : vehicle.registration;
                  return (
                    <div key={vehicle.id} className="overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/30 hover:shadow-md">
                      <div className="aspect-video w-full bg-muted/30 relative">
                        {vehicle.vehicleImageFront ? (
                          <img src={vehicle.vehicleImageFront} alt={vehicleName} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-muted/50">
                            <Car className="h-12 w-12 text-muted-foreground/30" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="focus:outline-none">
                              <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium shadow-sm backdrop-blur-md bg-background/80 hover:bg-background/90 transition-colors cursor-pointer', status.class)}>
                                <StatusIcon className="h-3 w-3" />{status.label}
                              </span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleVehicleStatusChange(vehicle.id, 'available')}>Available</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleVehicleStatusChange(vehicle.id, 'booked')}>Booked</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleVehicleStatusChange(vehicle.id, 'maintenance')}>Maintenance</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-semibold text-foreground text-lg">{vehicleName}</h3>
                        <p className="text-sm text-muted-foreground">{vehicle.vehicleType}</p>
                        <div className="mt-4 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Registration</span>
                            <span className="font-medium">{vehicle.registration}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Capacity</span>
                            <span className="font-medium">{vehicle.capacity} seats</span>
                          </div>
                          {vehicle.assignedDriverName && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Driver</span>
                              <span className="font-medium">{vehicle.assignedDriverName}</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-4 flex gap-2">
                          {vehicleFilter === 'suspended' ? (
                            <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleRestoreVehicle(vehicle.id)}>Restore</Button>
                          ) : (
                            <>
                              <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => handleEditVehicle(vehicle)}>
                                <Edit className="h-3 w-3" />Edit
                              </Button>
                              <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => setDeleteActionVehicle(vehicle)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {deleteActionVehicle && (
              <AlertDialog open={!!deleteActionVehicle} onOpenChange={(open) => !open && setDeleteActionVehicle(null)}>
                <AlertDialogContent>
                  {deleteActionVehicle.status === 'booked' ? (
                    <>
                      <AlertDialogHeader><AlertDialogTitle>Cannot Delete Vehicle</AlertDialogTitle><AlertDialogDescription>This vehicle cannot be deleted because it has an active booking.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter><AlertDialogCancel>Close</AlertDialogCancel></AlertDialogFooter>
                    </>
                  ) : (
                    <>
                      <AlertDialogHeader><AlertDialogTitle>Delete Vehicle</AlertDialogTitle><AlertDialogDescription>This action will permanently remove the vehicle.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <Button variant="outline" className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20" onClick={() => handleSuspendVehicle(deleteActionVehicle.id)}>Suspend Vehicle</Button>
                        <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => handlePermanentDeleteVehicle(deleteActionVehicle.id)}>Delete Vehicle</AlertDialogAction>
                      </AlertDialogFooter>
                    </>
                  )}
                </AlertDialogContent>
              </AlertDialog>
            )}
          </>
        ) : (
          <>
            {/* --- DRIVER MANAGEMENT SECTION --- */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-4 w-full sm:w-auto">
                <div className="flex bg-muted p-1 rounded-lg">
                  <Button variant={driverFilter === 'active' ? 'secondary' : 'ghost'} size="sm" onClick={() => setDriverFilter('active')}>Active</Button>
                  <Button variant={driverFilter === 'suspended' ? 'secondary' : 'ghost'} size="sm" onClick={() => setDriverFilter('suspended')}>Suspended</Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search drivers..." value={searchDriver} onChange={(e) => setSearchDriver(e.target.value)} className="w-full sm:w-64 pl-9" />
                </div>
              </div>
              <Button className="gap-2" onClick={handleCreateDriver}><Plus className="h-4 w-4" />Add Driver</Button>

              {/* Add/Edit Driver Dialog */}
              <Dialog open={isAddDriverOpen} onOpenChange={setIsAddDriverOpen}>
                <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[700px]">
                  <DialogHeader><DialogTitle>{editingDriver ? 'Edit Driver' : 'Add New Driver'}</DialogTitle></DialogHeader>
                  <div className="space-y-8 py-4">

                    {/* Driver Photo */}
                    <div className="space-y-2">
                      <Label>Driver Photo</Label>
                      <div className="flex flex-col items-center gap-4 mb-4">
                        <div className="relative h-24 w-24 rounded-full border-2 border-dashed border-input flex items-center justify-center overflow-hidden hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                          {driverPhotoUploading ? (
                            <div className="flex flex-col items-center gap-1">
                              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                              <span className="text-[10px] text-muted-foreground">Uploading...</span>
                            </div>
                          ) : newDriver.image ? (
                            <><img src={newDriver.image} alt="Preview" className="h-full w-full object-cover" /><div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"><span className="text-xs text-white">Change</span></div></>
                          ) : (
                            <div className="text-center p-2"><Upload className="h-6 w-6 mx-auto text-muted-foreground mb-1" /><span className="text-[10px] text-muted-foreground">Upload Photo</span></div>
                          )}
                          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleDriverImageUpload} />
                        </div>
                        {newDriver.image && <Button variant="ghost" size="sm" onClick={removeDriverImage} className="text-xs text-destructive h-6">Remove Photo</Button>}
                      </div>
                    </div>

                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold border-b pb-2">1. Personal Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>First Name <span className="text-destructive">*</span></Label><Input placeholder="e.g., John" value={newDriver.firstName} onChange={(e) => setNewDriver({ ...newDriver, firstName: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Last Name</Label><Input placeholder="e.g., Smith" value={newDriver.lastName} onChange={(e) => setNewDriver({ ...newDriver, lastName: e.target.value })} /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {editingDriver
                          ? <LockedField label="NIC Number" value={newDriver.nic} />
                          : <div className="space-y-2"><Label>NIC Number <span className="text-destructive">*</span></Label><Input value={newDriver.nic} onChange={(e) => setNewDriver({ ...newDriver, nic: e.target.value })} /></div>}
                        <div className="space-y-2"><Label>Blood Group</Label>
                          <Select value={newDriver.bloodGroup} onValueChange={(val) => setNewDriver({ ...newDriver, bloodGroup: val })}>
                            <SelectTrigger><SelectValue placeholder="Select Blood Group" /></SelectTrigger>
                            <SelectContent>{['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {editingDriver
                          ? <LockedField label="NIC Front Image" value={newDriver.nicFront} isImage />
                          : <ImageUploadField label="NIC Front Image" folder="drivers/nic" value={newDriver.nicFront} onChange={(v) => setNewDriver({ ...newDriver, nicFront: v })} onRemove={() => setNewDriver({ ...newDriver, nicFront: null })} />}
                        {editingDriver
                          ? <LockedField label="NIC Rear Image" value={newDriver.nicRear} isImage />
                          : <ImageUploadField label="NIC Rear Image" folder="drivers/nic" value={newDriver.nicRear} onChange={(v) => setNewDriver({ ...newDriver, nicRear: v })} onRemove={() => setNewDriver({ ...newDriver, nicRear: null })} />}
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold border-b pb-2">2. Contact Information</h3>
                      <div className="space-y-2"><Label>Address Line 1</Label><Input placeholder="123 Street Name" value={newDriver.addressLine1} onChange={(e) => setNewDriver({ ...newDriver, addressLine1: e.target.value })} /></div>
                      <div className="space-y-2"><Label>Address Line 2</Label><Input placeholder="City, State" value={newDriver.addressLine2} onChange={(e) => setNewDriver({ ...newDriver, addressLine2: e.target.value })} /></div>
                      <div className="space-y-2"><Label>Email (Optional)</Label><Input type="email" value={newDriver.email} onChange={(e) => setNewDriver({ ...newDriver, email: e.target.value })} /></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Mobile Number <span className="text-destructive">*</span></Label><Input value={newDriver.mobileNumber} onChange={(e) => setNewDriver({ ...newDriver, mobileNumber: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Second Mobile</Label><Input value={newDriver.secondaryMobileNumber} onChange={(e) => setNewDriver({ ...newDriver, secondaryMobileNumber: e.target.value })} /></div>
                      </div>
                    </div>

                    {/* Driving Credentials */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold border-b pb-2">3. Driving Credentials</h3>
                      <div className="space-y-2">
                        <Label>Vehicle types this driver can drive <span className="text-destructive">*</span></Label>
                        <div className="flex gap-6 mt-2">
                          {['Tuk', 'Car', 'Minivan/VAN'].map(type => (
                            <div key={type} className="flex items-center space-x-2 bg-muted/30 px-3 py-2 rounded-md border">
                              <Checkbox id={`check-${type}`} checked={newDriver.vehicleTypes.includes(type)} onCheckedChange={() => handleVehicleTypeToggle(type)} />
                              <label htmlFor={`check-${type}`} className="text-sm font-medium cursor-pointer">{type}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {editingDriver
                          ? <LockedField label="License Number" value={newDriver.license} />
                          : <div className="space-y-2"><Label>License Number <span className="text-destructive">*</span></Label><Input value={newDriver.license} onChange={(e) => setNewDriver({ ...newDriver, license: e.target.value })} /></div>}
                        <div className="space-y-2"><Label>License Expiry Date</Label><Input type="date" value={newDriver.licenseExpiryDate} onChange={(e) => setNewDriver({ ...newDriver, licenseExpiryDate: e.target.value })} /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {editingDriver
                          ? <LockedField label="License Front Image" value={newDriver.licenseFront} isImage />
                          : <ImageUploadField label="License Front Image" folder="drivers/license" value={newDriver.licenseFront} onChange={(v) => setNewDriver({ ...newDriver, licenseFront: v })} onRemove={() => setNewDriver({ ...newDriver, licenseFront: null })} />}
                        {editingDriver
                          ? <LockedField label="License Rear Image" value={newDriver.licenseRear} isImage />
                          : <ImageUploadField label="License Rear Image" folder="drivers/license" value={newDriver.licenseRear} onChange={(v) => setNewDriver({ ...newDriver, licenseRear: v })} onRemove={() => setNewDriver({ ...newDriver, licenseRear: null })} />}
                      </div>
                    </div>

                    <Button className="w-full mt-6" onClick={handleSaveDriver}>{editingDriver ? 'Update Driver' : 'Add Driver'}</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Drivers Table */}
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex justify-between items-center p-4 border border-border rounded-xl bg-card">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                ))}
              </div>
            ) : filteredDrivers.length === 0 ? (
              <p className="text-muted-foreground">No drivers found.</p>
            ) : (
              <div className="overflow-hidden rounded-xl border border-border bg-card">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Driver</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">License</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contact</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rating</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Vehicle</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredDrivers.map((driver) => {
                      const status = statusConfig[driver.status] || statusConfig['available'];
                      const StatusIcon = status.icon;
                      const fullName = driver.firstName && driver.lastName
                        ? `${driver.firstName} ${driver.lastName}`
                        : driver.firstName || driver.name || 'Unknown';
                      return (
                        <tr key={driver.id} className="table-row-hover">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="relative h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-primary to-accent overflow-hidden">
                                {driver.profileImage || driver.image ? (
                                  <img src={driver.profileImage || driver.image} alt={fullName} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center text-sm font-semibold text-primary-foreground">
                                    {fullName.split(' ').map(n => n[0]).join('')}
                                  </div>
                                )}
                              </div>
                              <div>
                                <span className="font-medium text-foreground">{fullName}</span>
                                <p className="text-xs text-muted-foreground">{driver.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-foreground">{driver.licenseNumber || driver.license}</td>
                          <td className="px-6 py-4 text-foreground">{driver.mobileNumber || driver.contact}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{driver.rating ?? '-'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-foreground">{driver.assignedVehicle || '-'}</td>
                          <td className="px-6 py-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger className="focus:outline-none">
                                <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium cursor-pointer hover:opacity-80', status.class)}>
                                  <StatusIcon className="h-3 w-3" />{status.label}
                                </span>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleDriverStatusChange(driver.id, 'available')}>Available</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDriverStatusChange(driver.id, 'on-trip')}>On Trip</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDriverStatusChange(driver.id, 'off-duty')}>Off Duty</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {driver.lifecycleStatus === 'suspended' ? (
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleRestoreDriver(driver.id)}>Restore</Button>
                              ) : (
                                <>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEditDriver(driver)}><Edit className="h-4 w-4" /></Button>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10" onClick={() => setDeleteActionDriver(driver)}><Trash2 className="h-4 w-4" /></Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {deleteActionDriver && (
              <AlertDialog open={!!deleteActionDriver} onOpenChange={(open) => !open && setDeleteActionDriver(null)}>
                <AlertDialogContent>
                  {deleteActionDriver.status === 'on-trip' ? (
                    <>
                      <AlertDialogHeader><AlertDialogTitle>Cannot Delete Driver</AlertDialogTitle><AlertDialogDescription>This driver cannot be deleted because they are currently on an active trip.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter><AlertDialogCancel>Close</AlertDialogCancel></AlertDialogFooter>
                    </>
                  ) : (
                    <>
                      <AlertDialogHeader><AlertDialogTitle>Delete Driver</AlertDialogTitle><AlertDialogDescription>This action will permanently remove the driver.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <Button variant="outline" className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20" onClick={() => handleSuspendDriver(deleteActionDriver.id)}>Suspend Driver</Button>
                        <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => handlePermanentDeleteDriver(deleteActionDriver.id)}>Delete Driver</AlertDialogAction>
                      </AlertDialogFooter>
                    </>
                  )}
                </AlertDialogContent>
              </AlertDialog>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Vehicles;
