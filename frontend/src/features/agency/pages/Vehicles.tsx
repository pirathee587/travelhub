import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createWorker } from 'tesseract.js';
import {
  Car, Plus, Search, Edit, Trash2, User,
  CheckCircle, Clock, AlertTriangle, Upload, Star, Lock, SearchX, Loader2, AlertCircle,
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
  const token = localStorage.getItem('travelhub_token') || localStorage.getItem('token') || sessionStorage.getItem('token');
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  }
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  const response = await fetch(`${apiBase}/api/upload/image`, {
    method: 'POST',
    headers,
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
const ImageUploadField = ({ label, value, onChange, onRemove, onFileSelect }) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (onFileSelect) {
      onFileSelect(file);
    }
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
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const filterParam = searchParams.get('filter');

  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [owners, setOwners] = useState([]);
  const [isNewOwner, setIsNewOwner] = useState(true);
  const [loading, setLoading] = useState(true);
  const [searchVehicle, setSearchVehicle] = useState('');
  const [searchDriver, setSearchDriver] = useState('');
  const [activeTab, setActiveTab] = useState(tabParam === 'drivers' ? 'drivers' : 'vehicles');
  const [vehicleFilter, setVehicleFilter] = useState(tabParam === 'vehicles' && filterParam ? filterParam : 'active');
  const [driverFilter, setDriverFilter] = useState(tabParam === 'drivers' && filterParam ? filterParam : 'active');
  const [deleteActionDriver, setDeleteActionDriver] = useState(null);
  const [deleteActionVehicle, setDeleteActionVehicle] = useState(null);
  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [editingDriver, setEditingDriver] = useState(null);
  const [newVehicle, setNewVehicle] = useState(defaultNewVehicle);
  const [newDriver, setNewDriver] = useState(defaultNewDriver);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSavingVehicle, setIsSavingVehicle] = useState(false);
  const [vehicleSubmitError, setVehicleSubmitError] = useState<string | null>(null);
  const vehicleModalScrollRef = useRef<HTMLDivElement>(null);
  const [changeRequestModalOpen, setChangeRequestModalOpen] = useState(false);
  const [changeRequestData, setChangeRequestData] = useState({ fieldName: '', currentValue: '', newValue: '', reason: '' });
  const [driverPhotoUploading, setDriverPhotoUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (tabParam === 'drivers') {
      setActiveTab('drivers');
      if (filterParam) setDriverFilter(filterParam);
    } else if (tabParam === 'vehicles') {
      setActiveTab('vehicles');
      if (filterParam) setVehicleFilter(filterParam);
    }
  }, [tabParam, filterParam]);

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
    setErrors({});
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
    setErrors({});
    setIsAddVehicleOpen(true);
  };

  const updateVehicleField = (key: string, val: any) => {
    setNewVehicle(prev => ({ ...prev, [key]: val }));
    if (errors[key]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  const handleNicFrontOcrScan = async (file: File) => {
    const toastId = toast.loading('Scanning NIC Front Image for number...');
    try {
      const worker = await createWorker('eng');
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();

      const oldNicMatch = text.match(/[0-9]{9}[vVxX]/);
      const newNicMatch = text.match(/[0-9]{12}/);
      const extractedNic = (newNicMatch ? newNicMatch[0] : (oldNicMatch ? oldNicMatch[0] : '')).toUpperCase();

      if (extractedNic) {
        if (newVehicle.nicNumber && newVehicle.nicNumber.trim() !== '' && newVehicle.nicNumber.trim().toUpperCase() !== extractedNic) {
          toast.warning(`Scanned NIC (${extractedNic}) does not match the entered NIC (${newVehicle.nicNumber}). Please check for typos.`, { id: toastId, duration: 6000 });
        } else {
          updateVehicleField('nicNumber', extractedNic);
          toast.success(`NIC scanned successfully! Detected NIC: ${extractedNic}`, { id: toastId });
        }
      } else {
        toast.warning('Could not auto-detect NIC number from image. Please ensure NIC number is clearly visible or enter it manually.', { id: toastId, duration: 6000 });
      }
    } catch (err) {
      console.error('OCR Error:', err);
      toast.error('Error scanning NIC image. Please enter NIC number manually.', { id: toastId });
    }
  };

  const updateDriverField = (key: string, val: any) => {
    setNewDriver(prev => ({ ...prev, [key]: val }));
    if (errors[key]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  const handleDriverNicOcrScan = async (file: File) => {
    const toastId = toast.loading('Scanning Driver NIC Front Image for number...');
    try {
      const worker = await createWorker('eng');
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();

      const oldNicMatch = text.match(/[0-9]{9}[vVxX]/);
      const newNicMatch = text.match(/[0-9]{12}/);
      const extractedNic = (newNicMatch ? newNicMatch[0] : (oldNicMatch ? oldNicMatch[0] : '')).toUpperCase();

      if (extractedNic) {
        if (newDriver.nic && newDriver.nic.trim() !== '' && newDriver.nic.trim().toUpperCase() !== extractedNic) {
          toast.warning(`Scanned NIC (${extractedNic}) does not match the entered NIC (${newDriver.nic}). Please check for typos.`, { id: toastId, duration: 6000 });
        } else {
          updateDriverField('nic', extractedNic);
          toast.success(`NIC scanned successfully! Detected NIC: ${extractedNic}`, { id: toastId });
        }
      } else {
        toast.warning('Could not auto-detect NIC number from image. Please ensure NIC number is clearly visible or enter it manually.', { id: toastId, duration: 6000 });
      }
    } catch (err) {
      console.error('OCR Error:', err);
      toast.error('Error scanning NIC image. Please enter NIC number manually.', { id: toastId });
    }
  };

  const validateDriverForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!newDriver.firstName?.trim()) {
      newErrors.firstName = 'First name is required';
      isValid = false;
    } else if (newDriver.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
      isValid = false;
    }

    const srilankanNicRegex = /^[0-9]{9}[vVxX]$|^[0-9]{12}$/;
    if (!newDriver.nic?.trim()) {
      newErrors.nic = 'NIC number is required';
      isValid = false;
    } else if (!srilankanNicRegex.test(newDriver.nic.trim())) {
      newErrors.nic = 'Invalid Sri Lankan NIC format (9 digits + V/X or 12 digits)';
      isValid = false;
    }

    const srilankanMobileRegex = /^(?:0\d{9}|\+94\d{9})$/;
    if (!newDriver.mobileNumber?.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
      isValid = false;
    } else if (!srilankanMobileRegex.test(newDriver.mobileNumber.trim())) {
      newErrors.mobileNumber = 'Invalid Sri Lankan mobile (e.g. 0712345678 or +94712345678)';
      isValid = false;
    }

    if (newDriver.secondaryMobileNumber?.trim() && !srilankanMobileRegex.test(newDriver.secondaryMobileNumber.trim())) {
      newErrors.secondaryMobileNumber = 'Invalid Sri Lankan mobile (e.g. 0712345678 or +94712345678)';
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (newDriver.email?.trim() && !emailRegex.test(newDriver.email.trim())) {
      newErrors.email = 'Invalid email address';
      isValid = false;
    }

    if (!newDriver.license?.trim()) {
      newErrors.license = 'License number is required';
      isValid = false;
    } else if (newDriver.license.trim().length < 5 || newDriver.license.trim().length > 30) {
      newErrors.license = 'License number must be between 5 and 30 characters';
      isValid = false;
    }

    if (!newDriver.licenseExpiryDate) {
      newErrors.licenseExpiryDate = 'License expiry date is required';
      isValid = false;
    } else {
      const expiry = new Date(newDriver.licenseExpiryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (expiry <= today) {
        newErrors.licenseExpiryDate = 'License expiry date must be in the future';
        isValid = false;
      }
    }

    if (newDriver.vehicleTypes.length === 0) {
      newErrors.vehicleTypes = 'Please select at least one vehicle type';
      isValid = false;
    }

    if (!newDriver.image) {
      newErrors.image = 'Driver photo is required';
      isValid = false;
    }

    if (!newDriver.nicFront) {
      newErrors.nicFront = 'NIC Front image is required';
      isValid = false;
    }

    if (!newDriver.nicRear) {
      newErrors.nicRear = 'NIC Rear image is required';
      isValid = false;
    }

    if (!newDriver.licenseFront) {
      newErrors.licenseFront = 'License Front image is required';
      isValid = false;
    }

    if (!newDriver.licenseRear) {
      newErrors.licenseRear = 'License Rear image is required';
      isValid = false;
    }

    if (!newDriver.addressLine1?.trim()) {
      newErrors.addressLine1 = 'Address line 1 is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleOwnerSelect = (ownerIdStr) => {
    const selected = owners.find(o => String(o.id) === ownerIdStr);
    if (selected) {
      if (errors.ownerId) {
        setErrors(prev => {
          const copy = { ...prev };
          delete copy.ownerId;
          return copy;
        });
      }
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

  const validateVehicleForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    const shouldValidateOwner = isNewOwner || !!editingVehicle;

    if (shouldValidateOwner) {
      if (!newVehicle.ownerFirstName?.trim()) {
        newErrors.ownerFirstName = 'First name is required';
        isValid = false;
      }
      if (!newVehicle.ownerLastName?.trim()) {
        newErrors.ownerLastName = 'Last name is required';
        isValid = false;
      }

      if (!editingVehicle) {
        const nic = newVehicle.nicNumber?.trim();
        const nicPattern = /^[0-9]{9}[vVxX]$|^[0-9]{12}$/;
        if (!nic) {
          newErrors.nicNumber = 'NIC number is required';
          isValid = false;
        } else if (!nicPattern.test(nic)) {
          newErrors.nicNumber = 'Invalid Sri Lankan NIC format (9 digits + V/X or 12 digits)';
          isValid = false;
        }

        if (!newVehicle.nicFrontImage) {
          newErrors.nicFrontImage = 'NIC front image is required';
          isValid = false;
        }
        if (!newVehicle.nicRearImage) {
          newErrors.nicRearImage = 'NIC rear image is required';
          isValid = false;
        }
      }

      if (!newVehicle.addressLine1?.trim()) {
        newErrors.addressLine1 = 'Address Line 1 is required';
        isValid = false;
      }

      const mobile = newVehicle.mobileNumber?.trim();
      const mobilePattern = /^(?:0\d{9}|\+94\d{9})$/;
      if (!mobile) {
        newErrors.mobileNumber = 'Mobile number is required';
        isValid = false;
      } else if (!mobilePattern.test(mobile)) {
        newErrors.mobileNumber = 'Invalid Sri Lankan mobile (e.g. 0712345678 or +94712345678)';
        isValid = false;
      }

      if (newVehicle.secondaryMobileNumber?.trim()) {
        const secMobile = newVehicle.secondaryMobileNumber.trim();
        if (!mobilePattern.test(secMobile)) {
          newErrors.secondaryMobileNumber = 'Invalid Sri Lankan mobile (e.g. 0712345678 or +94712345678)';
          isValid = false;
        }
      }

      if (newVehicle.ownerEmail?.trim()) {
        const email = newVehicle.ownerEmail.trim();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
          newErrors.ownerEmail = 'Invalid email address format';
          isValid = false;
        }
      }
    } else {
      if (!newVehicle.ownerId) {
        newErrors.ownerId = 'Please select a vehicle owner';
        isValid = false;
      }
    }

    if (!newVehicle.vehicleType) {
      newErrors.vehicleType = 'Vehicle type is required';
      isValid = false;
    }
    if (!newVehicle.brand) {
      newErrors.brand = 'Brand is required';
      isValid = false;
    }
    if (!newVehicle.model) {
      newErrors.model = 'Model is required';
      isValid = false;
    }
    if (!newVehicle.color) {
      newErrors.color = 'Color is required';
      isValid = false;
    }

    const capacity = parseInt(newVehicle.capacity);
    if (newVehicle.capacity === '' || isNaN(capacity)) {
      newErrors.capacity = 'Capacity is required';
      isValid = false;
    } else if (capacity <= 0 || capacity > 100) {
      newErrors.capacity = 'Capacity must be between 1 and 100';
      isValid = false;
    }

    if (!editingVehicle) {
      const year = parseInt(newVehicle.yearOfManufacture);
      const currentYear = new Date().getFullYear();
      if (!newVehicle.yearOfManufacture) {
        newErrors.yearOfManufacture = 'Year of manufacture is required';
        isValid = false;
      } else if (isNaN(year) || year < 1980 || year > currentYear + 1) {
        newErrors.yearOfManufacture = `Year must be between 1980 and ${currentYear + 1}`;
        isValid = false;
      }
    }

    if (!editingVehicle) {
      if (!newVehicle.registration?.trim()) {
        newErrors.registration = 'Registration number is required';
        isValid = false;
      }
    }

    if (!newVehicle.insuranceCardFront) {
      newErrors.insuranceCardFront = 'Insurance card image is required';
      isValid = false;
    }

    if (!newVehicle.insuranceExpiryDate) {
      newErrors.insuranceExpiryDate = 'Insurance expiry date is required';
      isValid = false;
    }

    if (!newVehicle.revenueLicenseImage) {
      newErrors.revenueLicenseImage = 'Revenue license image is required';
      isValid = false;
    }

    if (!newVehicle.vehicleImageFront) {
      newErrors.vehicleImageFront = 'Front view photo is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSaveVehicle = async () => {
    setVehicleSubmitError(null);
    if (!validateVehicleForm()) {
      toast.error('Please correct the highlighted errors in the form before saving.');
      setVehicleSubmitError('Validation failed: Please check the highlighted fields above.');
      vehicleModalScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setIsSavingVehicle(true);
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
        if (updated.lifecycleStatus === 'pending' && editingVehicle.lifecycleStatus === 'active') {
          toast.success('Vehicle updated! Document changes sent to admin for re-verification.');
        } else {
          toast.success('Vehicle updated successfully');
        }
      } else {
        const created = await api.createVehicle(payload);
        if (created.success === false || created.error || (typeof created.status === 'number' && created.status >= 400)) throw new Error(created.message || created.error || 'Create failed');
        setVehicles(prev => [...prev, created]);
        setActiveTab('vehicles');
        setVehicleFilter('pending');
        toast.success('Vehicle registered successfully! Sent to admin for verification.');
      }
      fetchOwners(); // Refresh inline owner listing options
      setIsAddVehicleOpen(false);
      setNewVehicle(defaultNewVehicle);
      setEditingVehicle(null);
    } catch (error: any) {
      console.error('Save vehicle failed:', error);
      const errMsg = error.message || 'Failed to save vehicle';
      setVehicleSubmitError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsSavingVehicle(false);
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
    } catch (error: any) {
      console.error('Delete vehicle error:', error);
      toast.error(error.message || 'Cannot delete — vehicle may have active bookings');
    }
  };

  // ── Driver handlers ────────────────────────────────────────
  const handleVehicleTypeToggle = (type) => {
    setNewDriver(prev => {
      const nextTypes = prev.vehicleTypes.includes(type)
        ? prev.vehicleTypes.filter(t => t !== type)
        : [...prev.vehicleTypes, type];
      
      if (nextTypes.length > 0 && errors.vehicleTypes) {
        setErrors(errs => {
          const copy = { ...errs };
          delete copy.vehicleTypes;
          return copy;
        });
      }
      return { ...prev, vehicleTypes: nextTypes };
    });
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
      nicFront: driver.nicFrontImage || null,
      nicRear: driver.nicRearImage || null,
      licenseFront: driver.licenseFrontImage || null,
      licenseRear: driver.licenseRearImage || null,
    });
    setErrors({});
    setIsAddDriverOpen(true);
  };

  const handleSaveDriver = async () => {
    if (!validateDriverForm()) {
      toast.error('Please correct the errors in the form before saving.');
      return;
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
        if (updated.lifecycleStatus === 'pending' && editingDriver.lifecycleStatus === 'active') {
          toast.success('Driver updated! Document changes sent to admin for re-verification.');
        } else {
          toast.success('Driver updated successfully');
        }
      } else {
        const created = await api.createDriver(payload);
        if (created.success === false || created.error || (typeof created.status === 'number' && created.status >= 400)) throw new Error(created.message || created.error || 'Create failed');
        setDrivers(prev => [...prev, created]);
        setActiveTab('drivers');
        setDriverFilter('pending');
        toast.success('Driver registered successfully! Sent to admin for verification.');
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
    } catch (error: any) {
      console.error('Delete driver error:', error);
      toast.error(error.message || 'Cannot delete — driver may be on an active trip');
    }
  };

  // ── Driver photo upload → drivers/profile folder ───────────
  const handleDriverImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDriverPhotoUploading(true);
    try {
      const url = await uploadImage(file);
      setNewDriver(prev => ({ ...prev, image: url }));
      if (errors.image) {
        setErrors(errs => {
          const copy = { ...errs };
          delete copy.image;
          return copy;
        });
      }
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
                  <Button variant={vehicleFilter === 'pending' ? 'secondary' : 'ghost'} size="sm" onClick={() => setVehicleFilter('pending')}>Pending</Button>
                  <Button variant={vehicleFilter === 'suspended' ? 'secondary' : 'ghost'} size="sm" onClick={() => setVehicleFilter('suspended')}>Suspended</Button>
                  <Button variant={vehicleFilter === 'rejected' ? 'secondary' : 'ghost'} size="sm" onClick={() => setVehicleFilter('rejected')}>Rejected</Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search vehicles..." value={searchVehicle} onChange={(e) => setSearchVehicle(e.target.value)} className="w-full sm:w-64 pl-9" />
                </div>
              </div>
              <Button className="gap-2" onClick={handleCreateVehicle}><Plus className="h-4 w-4" />Add Vehicle</Button>

              {/* Add/Edit Vehicle Dialog */}
              <Dialog open={isAddVehicleOpen} onOpenChange={setIsAddVehicleOpen}>
                <DialogContent ref={vehicleModalScrollRef} className="max-h-[85vh] overflow-y-auto sm:max-w-[700px]">
                  <DialogHeader><DialogTitle>{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle></DialogHeader>
                  <div className="space-y-8 py-4">
                    {vehicleSubmitError && (
                      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-2.5 text-xs font-medium animate-in fade-in">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{vehicleSubmitError}</span>
                      </div>
                    )}

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
                          {errors.ownerId && <span className="text-xs font-medium text-destructive mt-1 block">{errors.ownerId}</span>}
                          
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
                            <div className="space-y-2">
                              <Label>First Name</Label>
                              <Input value={newVehicle.ownerFirstName} onChange={(e) => updateVehicleField('ownerFirstName', e.target.value)} />
                              {errors.ownerFirstName && <span className="text-xs font-medium text-destructive mt-1 block">{errors.ownerFirstName}</span>}
                            </div>
                            <div className="space-y-2">
                              <Label>Last Name</Label>
                              <Input value={newVehicle.ownerLastName} onChange={(e) => updateVehicleField('ownerLastName', e.target.value)} />
                              {errors.ownerLastName && <span className="text-xs font-medium text-destructive mt-1 block">{errors.ownerLastName}</span>}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>NIC Number</Label>
                            <Input value={newVehicle.nicNumber} onChange={(e) => updateVehicleField('nicNumber', e.target.value)} />
                            {errors.nicNumber && <span className="text-xs font-medium text-destructive mt-1 block">{errors.nicNumber}</span>}
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <ImageUploadField label="NIC Front Image" folder="vehicles/documents" value={newVehicle.nicFrontImage} onChange={(val) => updateVehicleField('nicFrontImage', val)} onRemove={() => updateVehicleField('nicFrontImage', null)} onFileSelect={handleNicFrontOcrScan} />
                              {errors.nicFrontImage && <span className="text-xs font-medium text-destructive mt-1 block">{errors.nicFrontImage}</span>}
                            </div>
                            <div className="space-y-2">
                              <ImageUploadField label="NIC Rear Image" folder="vehicles/documents" value={newVehicle.nicRearImage} onChange={(val) => updateVehicleField('nicRearImage', val)} onRemove={() => updateVehicleField('nicRearImage', null)} />
                              {errors.nicRearImage && <span className="text-xs font-medium text-destructive mt-1 block">{errors.nicRearImage}</span>}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Address Line 1</Label>
                            <Input value={newVehicle.addressLine1} onChange={(e) => updateVehicleField('addressLine1', e.target.value)} />
                            {errors.addressLine1 && <span className="text-xs font-medium text-destructive mt-1 block">{errors.addressLine1}</span>}
                          </div>
                          <div className="space-y-2">
                            <Label>Address Line 2 (Optional)</Label>
                            <Input value={newVehicle.addressLine2} onChange={(e) => updateVehicleField('addressLine2', e.target.value)} />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Mobile Number</Label>
                              <Input value={newVehicle.mobileNumber} onChange={(e) => updateVehicleField('mobileNumber', e.target.value)} />
                              {errors.mobileNumber && <span className="text-xs font-medium text-destructive mt-1 block">{errors.mobileNumber}</span>}
                            </div>
                            <div className="space-y-2">
                              <Label>Secondary Mobile (Optional)</Label>
                              <Input value={newVehicle.secondaryMobileNumber} onChange={(e) => updateVehicleField('secondaryMobileNumber', e.target.value)} />
                              {errors.secondaryMobileNumber && <span className="text-xs font-medium text-destructive mt-1 block">{errors.secondaryMobileNumber}</span>}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Email (Optional)</Label>
                            <Input type="email" value={newVehicle.ownerEmail} onChange={(e) => updateVehicleField('ownerEmail', e.target.value)} />
                            {errors.ownerEmail && <span className="text-xs font-medium text-destructive mt-1 block">{errors.ownerEmail}</span>}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Section 2: Vehicle Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold border-b pb-2">2. Vehicle Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Vehicle Type</Label>
                          <Select value={newVehicle.vehicleType} onValueChange={(value) => { updateVehicleField('vehicleType', value); updateVehicleField('brand', ''); updateVehicleField('model', ''); }}>
                            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                            <SelectContent>{VEHICLE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                          </Select>
                          {errors.vehicleType && <span className="text-xs font-medium text-destructive mt-1 block">{errors.vehicleType}</span>}
                        </div>
                        <div className="space-y-2">
                          <Label>Brand</Label>
                          <Select value={newVehicle.brand} onValueChange={(value) => { updateVehicleField('brand', value); updateVehicleField('model', ''); }} disabled={!newVehicle.vehicleType}>
                            <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
                            <SelectContent>{(VEHICLE_BRANDS[newVehicle.vehicleType] || []).map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                          </Select>
                          {errors.brand && <span className="text-xs font-medium text-destructive mt-1 block">{errors.brand}</span>}
                        </div>
                        <div className="space-y-2">
                          <Label>Model</Label>
                          <Select value={newVehicle.model} onValueChange={(value) => updateVehicleField('model', value)} disabled={!newVehicle.brand}>
                            <SelectTrigger><SelectValue placeholder="Select model" /></SelectTrigger>
                            <SelectContent>{(VEHICLE_MODELS[newVehicle.brand] || []).map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                          </Select>
                          {errors.model && <span className="text-xs font-medium text-destructive mt-1 block">{errors.model}</span>}
                        </div>
                        <div className="space-y-2">
                          <Label>Color</Label>
                          <Select value={newVehicle.color} onValueChange={(value) => updateVehicleField('color', value)}>
                            <SelectTrigger><SelectValue placeholder="Select color" /></SelectTrigger>
                            <SelectContent>{VEHICLE_COLORS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                          </Select>
                          {errors.color && <span className="text-xs font-medium text-destructive mt-1 block">{errors.color}</span>}
                        </div>
                        <div className="space-y-2">
                          <Label>Passenger Capacity</Label>
                          <Input type="number" value={newVehicle.capacity} onChange={(e) => updateVehicleField('capacity', e.target.value)} />
                          {errors.capacity && <span className="text-xs font-medium text-destructive mt-1 block">{errors.capacity}</span>}
                        </div>
                        <div className="space-y-2">
                          <Label>Year of Manufacture</Label>
                          <Input type="number" value={newVehicle.yearOfManufacture} onChange={(e) => updateVehicleField('yearOfManufacture', e.target.value)} />
                          {errors.yearOfManufacture && <span className="text-xs font-medium text-destructive mt-1 block">{errors.yearOfManufacture}</span>}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>License Plate Number</Label>
                        <Input placeholder="e.g., KA-01-AB-1234" value={newVehicle.registration} onChange={(e) => updateVehicleField('registration', e.target.value)} />
                        {errors.registration && <span className="text-xs font-medium text-destructive mt-1 block">{errors.registration}</span>}
                      </div>
                    </div>

                    {/* Section 3: Documents and Photos */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold border-b pb-2">3. Documents and Photos</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <ImageUploadField label="Insurance Card (Front)" folder="vehicles/documents" value={newVehicle.insuranceCardFront} onChange={(val) => updateVehicleField('insuranceCardFront', val)} onRemove={() => updateVehicleField('insuranceCardFront', null)} />
                          {errors.insuranceCardFront && <span className="text-xs font-medium text-destructive mt-1 block">{errors.insuranceCardFront}</span>}
                        </div>
                        <div className="space-y-2">
                          <Label>Insurance Expiry Date</Label>
                          <Input type="date" value={newVehicle.insuranceExpiryDate} onChange={(e) => updateVehicleField('insuranceExpiryDate', e.target.value)} />
                          {errors.insuranceExpiryDate && <span className="text-xs font-medium text-destructive mt-1 block">{errors.insuranceExpiryDate}</span>}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <ImageUploadField label="Revenue License" folder="vehicles/documents" value={newVehicle.revenueLicenseImage} onChange={(val) => updateVehicleField('revenueLicenseImage', val)} onRemove={() => updateVehicleField('revenueLicenseImage', null)} />
                        {errors.revenueLicenseImage && <span className="text-xs font-medium text-destructive mt-1 block">{errors.revenueLicenseImage}</span>}
                      </div>
                      <Label className="block mt-4">Vehicle Photos</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <ImageUploadField label="Front View" folder="vehicles/photos" value={newVehicle.vehicleImageFront} onChange={(val) => updateVehicleField('vehicleImageFront', val)} onRemove={() => updateVehicleField('vehicleImageFront', null)} />
                          {errors.vehicleImageFront && <span className="text-xs font-medium text-destructive mt-1 block">{errors.vehicleImageFront}</span>}
                        </div>
                        <ImageUploadField label="Back View" folder="vehicles/photos" value={newVehicle.vehicleImageBack} onChange={(val) => updateVehicleField('vehicleImageBack', val)} onRemove={() => updateVehicleField('vehicleImageBack', null)} />
                        <ImageUploadField label="Side View" folder="vehicles/photos" value={newVehicle.vehicleImageSide} onChange={(val) => updateVehicleField('vehicleImageSide', val)} onRemove={() => updateVehicleField('vehicleImageSide', null)} />
                        <ImageUploadField label="Interior View" folder="vehicles/photos" value={newVehicle.vehicleImageInside} onChange={(val) => updateVehicleField('vehicleImageInside', val)} onRemove={() => updateVehicleField('vehicleImageInside', null)} />
                      </div>
                    </div>

                    <Button className="w-full mt-8" onClick={handleSaveVehicle} disabled={isSavingVehicle}>
                      {isSavingVehicle ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
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
              <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                  {searchVehicle ? <SearchX className="h-8 w-8 text-primary" /> : <Car className="h-8 w-8 text-primary" />}
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  {searchVehicle
                    ? 'No vehicles match your search'
                    : vehicleFilter === 'active' && vehicles.some(v => v.lifecycleStatus === 'pending')
                    ? 'No active vehicles yet'
                    : `No ${vehicleFilter} vehicles found`}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-md">
                  {searchVehicle
                    ? 'Try adjusting your search query or vehicle status filter.'
                    : vehicleFilter === 'active' && vehicles.some(v => v.lifecycleStatus === 'pending')
                    ? 'You have registered vehicles currently awaiting admin verification approval.'
                    : 'Add your fleet of cars, vans, or buses to allocate them to confirmed tourist bookings.'}
                </p>
                {searchVehicle ? (
                  <div className="mt-6 flex gap-3">
                    <Button variant="outline" onClick={() => setSearchVehicle('')} className="rounded-xl">
                      Clear Search
                    </Button>
                  </div>
                ) : vehicleFilter === 'active' && vehicles.some(v => v.lifecycleStatus === 'pending') ? (
                  <div className="mt-6 flex gap-3">
                    <Button variant="outline" onClick={() => setVehicleFilter('pending')} className="rounded-xl gap-2">
                      <Clock className="h-4 w-4 text-amber-500" /> View Pending Vehicles
                    </Button>
                  </div>
                ) : null}
              </div>
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
                          {vehicle.lifecycleStatus === 'pending' ? (
                            <span className="inline-flex items-center justify-center rounded-full px-3 py-0.5 text-xs font-semibold bg-amber-50/95 text-amber-800 border border-amber-300/90 backdrop-blur-md shadow-sm select-none">
                              Pending Verification
                            </span>
                          ) : vehicle.lifecycleStatus === 'rejected' ? (
                            <span className="inline-flex items-center justify-center rounded-full px-3 py-0.5 text-xs font-semibold bg-rose-50/95 text-rose-700 border border-rose-300/90 backdrop-blur-md shadow-sm select-none">
                              Verification Rejected
                            </span>
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger className="focus:outline-none">
                                <span className={cn('inline-flex items-center justify-center rounded-full px-3 py-0.5 text-xs font-semibold cursor-pointer hover:opacity-90 shadow-sm backdrop-blur-md', status.class)}>
                                  {status.label}
                                </span>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleVehicleStatusChange(vehicle.id, 'available')}>Available</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleVehicleStatusChange(vehicle.id, 'booked')}>Booked</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleVehicleStatusChange(vehicle.id, 'maintenance')}>Maintenance</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-semibold text-foreground text-lg">{vehicleName}</h3>
                        <p className="text-sm text-muted-foreground">{vehicle.vehicleType}</p>
                        {vehicle.lifecycleStatus === 'rejected' && vehicle.rejectionReason && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded-lg text-xs text-destructive font-medium">
                            ⚠️ Reason: {vehicle.rejectionReason}
                          </div>
                        )}
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
                  <Button variant={driverFilter === 'pending' ? 'secondary' : 'ghost'} size="sm" onClick={() => setDriverFilter('pending')}>Pending</Button>
                  <Button variant={driverFilter === 'suspended' ? 'secondary' : 'ghost'} size="sm" onClick={() => setDriverFilter('suspended')}>Suspended</Button>
                  <Button variant={driverFilter === 'rejected' ? 'secondary' : 'ghost'} size="sm" onClick={() => setDriverFilter('rejected')}>Rejected</Button>
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
                      <Label>Driver Photo <span className="text-destructive">*</span></Label>
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
                        {errors.image && <span className="text-xs font-medium text-destructive block text-center">{errors.image}</span>}
                        {newDriver.image && <Button variant="ghost" size="sm" onClick={removeDriverImage} className="text-xs text-destructive h-6">Remove Photo</Button>}
                      </div>
                    </div>

                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold border-b pb-2">1. Personal Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>First Name <span className="text-destructive">*</span></Label>
                          <Input placeholder="e.g., John" value={newDriver.firstName} onChange={(e) => updateDriverField('firstName', e.target.value)} />
                          {errors.firstName && <span className="text-xs font-medium text-destructive mt-1 block">{errors.firstName}</span>}
                        </div>
                        <div className="space-y-2">
                          <Label>Last Name</Label>
                          <Input placeholder="e.g., Smith" value={newDriver.lastName} onChange={(e) => updateDriverField('lastName', e.target.value)} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>NIC Number <span className="text-destructive">*</span></Label>
                          <Input value={newDriver.nic} onChange={(e) => updateDriverField('nic', e.target.value)} />
                          {errors.nic && <span className="text-xs font-medium text-destructive mt-1 block">{errors.nic}</span>}
                        </div>
                        <div className="space-y-2"><Label>Blood Group</Label>
                          <Select value={newDriver.bloodGroup} onValueChange={(val) => updateDriverField('bloodGroup', val)}>
                            <SelectTrigger><SelectValue placeholder="Select Blood Group" /></SelectTrigger>
                            <SelectContent>{['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <ImageUploadField label="NIC Front Image" folder="drivers/nic" value={newDriver.nicFront} onChange={(v) => updateDriverField('nicFront', v)} onRemove={() => updateDriverField('nicFront', null)} onFileSelect={handleDriverNicOcrScan} />
                          {errors.nicFront && <span className="text-xs font-medium text-destructive mt-1 block">{errors.nicFront}</span>}
                        </div>
                        <div className="space-y-2">
                          <ImageUploadField label="NIC Rear Image" folder="drivers/nic" value={newDriver.nicRear} onChange={(v) => updateDriverField('nicRear', v)} onRemove={() => updateDriverField('nicRear', null)} />
                          {errors.nicRear && <span className="text-xs font-medium text-destructive mt-1 block">{errors.nicRear}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold border-b pb-2">2. Contact Information</h3>
                      <div className="space-y-2">
                        <Label>Address Line 1 <span className="text-destructive">*</span></Label>
                        <Input placeholder="123 Street Name" value={newDriver.addressLine1} onChange={(e) => updateDriverField('addressLine1', e.target.value)} />
                        {errors.addressLine1 && <span className="text-xs font-medium text-destructive mt-1 block">{errors.addressLine1}</span>}
                      </div>
                      <div className="space-y-2">
                        <Label>Address Line 2</Label>
                        <Input placeholder="City, State" value={newDriver.addressLine2} onChange={(e) => updateDriverField('addressLine2', e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Email (Optional)</Label>
                        <Input type="email" value={newDriver.email} onChange={(e) => updateDriverField('email', e.target.value)} />
                        {errors.email && <span className="text-xs font-medium text-destructive mt-1 block">{errors.email}</span>}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Mobile Number <span className="text-destructive">*</span></Label>
                          <Input value={newDriver.mobileNumber} onChange={(e) => updateDriverField('mobileNumber', e.target.value)} />
                          {errors.mobileNumber && <span className="text-xs font-medium text-destructive mt-1 block">{errors.mobileNumber}</span>}
                        </div>
                        <div className="space-y-2">
                          <Label>Second Mobile</Label>
                          <Input value={newDriver.secondaryMobileNumber} onChange={(e) => updateDriverField('secondaryMobileNumber', e.target.value)} />
                          {errors.secondaryMobileNumber && <span className="text-xs font-medium text-destructive mt-1 block">{errors.secondaryMobileNumber}</span>}
                        </div>
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
                        {errors.vehicleTypes && <span className="text-xs font-medium text-destructive mt-1 block">{errors.vehicleTypes}</span>}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>License Number <span className="text-destructive">*</span></Label>
                          <Input value={newDriver.license} onChange={(e) => updateDriverField('license', e.target.value)} />
                          {errors.license && <span className="text-xs font-medium text-destructive mt-1 block">{errors.license}</span>}
                        </div>
                        <div className="space-y-2">
                          <Label>License Expiry Date <span className="text-destructive">*</span></Label>
                          <Input type="date" value={newDriver.licenseExpiryDate} onChange={(e) => updateDriverField('licenseExpiryDate', e.target.value)} />
                          {errors.licenseExpiryDate && <span className="text-xs font-medium text-destructive mt-1 block">{errors.licenseExpiryDate}</span>}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <ImageUploadField label="License Front Image" folder="drivers/license" value={newDriver.licenseFront} onChange={(v) => updateDriverField('licenseFront', v)} onRemove={() => updateDriverField('licenseFront', null)} />
                          {errors.licenseFront && <span className="text-xs font-medium text-destructive mt-1 block">{errors.licenseFront}</span>}
                        </div>
                        <div className="space-y-2">
                          <ImageUploadField label="License Rear Image" folder="drivers/license" value={newDriver.licenseRear} onChange={(v) => updateDriverField('licenseRear', v)} onRemove={() => updateDriverField('licenseRear', null)} />
                          {errors.licenseRear && <span className="text-xs font-medium text-destructive mt-1 block">{errors.licenseRear}</span>}
                        </div>
                      </div>
                    </div>

                    <Button className="w-full mt-6" onClick={handleSaveDriver}>{editingDriver ? 'Update Driver' : 'Add Driver'}</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Drivers Grid (Rectangular Cards) */}
            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-border bg-card overflow-hidden p-5 space-y-4">
                    <Skeleton className="h-48 w-full rounded-lg" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="space-y-2 pt-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredDrivers.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                  {searchDriver ? <SearchX className="h-8 w-8 text-primary" /> : <User className="h-8 w-8 text-primary" />}
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  {searchDriver
                    ? 'No drivers match your search'
                    : driverFilter === 'active' && drivers.some(d => d.lifecycleStatus === 'pending')
                    ? 'No active drivers yet'
                    : `No ${driverFilter} drivers found`}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-md">
                  {searchDriver
                    ? 'Try adjusting your search query or driver status filter.'
                    : driverFilter === 'active' && drivers.some(d => d.lifecycleStatus === 'pending')
                    ? 'You have registered drivers currently awaiting admin verification approval.'
                    : 'Register your team of professional drivers to assign them to upcoming tourist trips.'}
                </p>
                {searchDriver ? (
                  <div className="mt-6 flex gap-3">
                    <Button variant="outline" onClick={() => setSearchDriver('')} className="rounded-xl">
                      Clear Search
                    </Button>
                  </div>
                ) : driverFilter === 'active' && drivers.some(d => d.lifecycleStatus === 'pending') ? (
                  <div className="mt-6 flex gap-3">
                    <Button variant="outline" onClick={() => setDriverFilter('pending')} className="rounded-xl gap-2">
                      <Clock className="h-4 w-4 text-amber-500" /> View Pending Drivers
                    </Button>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredDrivers.map((driver) => {
                  const status = statusConfig[driver.status] || statusConfig['available'];
                  const StatusIcon = status.icon;
                  const fullName = driver.firstName && driver.lastName
                    ? `${driver.firstName} ${driver.lastName}`
                    : driver.firstName || driver.name || 'Unknown';
                  const driverPhoto = driver.profileImage || driver.image;

                  return (
                    <div key={driver.id} className="rounded-xl border border-border bg-card overflow-hidden transition-all hover:shadow-md flex flex-col justify-between">
                      <div>
                        {/* Rectangular Header Image */}
                        <div className="relative h-48 w-full bg-muted">
                          {driverPhoto ? (
                            <img src={driverPhoto} alt={fullName} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/20 via-accent/10 to-primary/10 text-muted-foreground">
                              <User className="h-16 w-16 opacity-40 text-primary" />
                            </div>
                          )}

                          {/* Status Badge in top right */}
                          <div className="absolute top-3 right-3">
                            {driver.lifecycleStatus === 'pending' ? (
                              <span className="inline-flex items-center justify-center rounded-full px-3 py-0.5 text-xs font-semibold bg-amber-50/95 text-amber-800 border border-amber-300/90 backdrop-blur-md shadow-sm select-none">
                                Pending Verification
                              </span>
                            ) : driver.lifecycleStatus === 'rejected' ? (
                              <span className="inline-flex items-center justify-center rounded-full px-3 py-0.5 text-xs font-semibold bg-rose-50/95 text-rose-700 border border-rose-300/90 backdrop-blur-md shadow-sm select-none">
                                Rejected
                              </span>
                            ) : (
                              <DropdownMenu>
                                <DropdownMenuTrigger className="focus:outline-none">
                                  <span className={cn('inline-flex items-center justify-center rounded-full px-3 py-0.5 text-xs font-semibold cursor-pointer hover:opacity-90 shadow-sm backdrop-blur-md', status.class)}>
                                    {status.label}
                                  </span>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleDriverStatusChange(driver.id, 'available')}>Available</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDriverStatusChange(driver.id, 'on-trip')}>On Trip</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDriverStatusChange(driver.id, 'off-duty')}>Off Duty</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </div>

                        {/* Card Details Body */}
                        <div className="p-5">
                          <h3 className="font-semibold text-foreground text-lg">{fullName}</h3>
                          <p className="text-sm text-muted-foreground">{driver.email || 'No email provided'}</p>

                          {driver.lifecycleStatus === 'rejected' && driver.rejectionReason && (
                            <div className="mt-3 p-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-lg text-xs text-destructive font-medium">
                              ⚠️ Reason: {driver.rejectionReason}
                            </div>
                          )}

                          <div className="mt-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">License</span>
                              <span className="font-medium">{driver.licenseNumber || driver.license || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Contact</span>
                              <span className="font-medium">{driver.mobileNumber || driver.contact || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Rating</span>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">{driver.rating != null ? driver.rating : '0'}</span>
                              </div>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Vehicle</span>
                              <span className="font-medium">{driver.assignedVehicle || 'Unassigned'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="px-5 pb-5 pt-0 flex gap-2">
                        {driver.lifecycleStatus === 'suspended' ? (
                          <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleRestoreDriver(driver.id)}>Restore</Button>
                        ) : (
                          <>
                            <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => handleEditDriver(driver)}>
                              <Edit className="h-3.5 w-3.5" />Edit
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => setDeleteActionDriver(driver)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
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
