import { useState, useRef } from 'react';
import {
  Car,
  Plus,
  Search,
  Edit,
  Trash2,
  User,
  CheckCircle,
  Clock,
  AlertTriangle,
  Upload,
  X,
  Star,
  Lock,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { toast } from '@/components/ui/sonner';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const initialVehicles = [
  {
    id: 'V001',
    name: 'Bajaj RE 4S',
    type: 'Tuk-tuk',
    registration: 'KA-01-AB-1234',
    capacity: 3,
    status: 'available', lifecycleStatus: 'active',
    images: [
      'https://images.unsplash.com/photo-1549557404-399a91873173?q=80&w=2671&auto=format&fit=crop',
    ],
  },
  {
    id: 'V002',
    name: 'Mercedes V-Class',
    type: 'Van',
    registration: 'KA-01-CD-5678',
    capacity: 8,
    status: 'booked', lifecycleStatus: 'active',
    driver: 'Kavindu Jayasinghe',
    images: [
      'https://images.unsplash.com/photo-1549643981-22920253fce3?q=80&w=2671&auto=format&fit=crop',
    ],
  },
  {
    id: 'V003',
    name: 'Maruti Suzuki Wagon R',
    type: 'Hatchback',
    registration: 'KA-01-EF-9012',
    capacity: 4,
    status: 'maintenance', lifecycleStatus: 'active',
    images: [
      'https://images.unsplash.com/photo-1626322997193-4a1618063073?q=80&w=2671&auto=format&fit=crop',
    ],
  },
  {
    id: 'V004',
    name: 'Toyota Alphard',
    type: 'Van',
    registration: 'KA-01-GH-3456',
    capacity: 7,
    status: 'booked', lifecycleStatus: 'active',
    driver: 'Tharushi Fernando',
    images: [
      'https://images.unsplash.com/photo-1621689252328-98e821014168?q=80&w=2670&auto=format&fit=crop',
    ],
  },
  {
    id: 'V005',
    name: 'Suzuki Alto 800',
    type: 'Hatchback',
    registration: 'KA-01-IJ-7890',
    capacity: 4,
    status: 'available', lifecycleStatus: 'active',
    images: [
      'https://images.unsplash.com/photo-1596726225381-80410656a5c1?q=80&w=2670&auto=format&fit=crop',
    ],
  },
];

const initialDrivers = [
  {
    id: 'D001',
    name: 'Nimal Perera',
    email: 'nimal.perera@gmail.com',
    license: 'KA-DL-123456',
    nic: 'NIC123456789',
    licenseIssuedDate: '2020-01-01',
    licenseExpiryDate: '2030-01-01',
    contact: '+94 77 123 4567',
    rating: 4.8,
    status: 'available', lifecycleStatus: 'active',
    image:
      'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&auto=format&fit=crop&q=60',
  },
  {
    id: 'D002',
    name: 'Kavindu Jayasinghe',
    email: 'kavindu.j@gmail.com',
    license: 'FR-DL-789012',
    contact: '+94 71 234 5678',
    rating: 4.5,
    vehicle: 'Mercedes V-Class',
    status: 'on-trip', lifecycleStatus: 'active',
    image:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60',
  },
  {
    id: 'D003',
    name: 'Tharushi Fernando',
    email: 'tharushi.f@gmail.com',
    license: 'JP-DL-345678',
    contact: '+94 76 345 6789',
    rating: 4.9,
    vehicle: 'Toyota Alphard',
    status: 'on-trip', lifecycleStatus: 'active',
    image:
      'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&auto=format&fit=crop&q=60',
  },
  {
    id: 'D004',
    name: 'Saman Kumara',
    email: 'saman.kumara@gmail.com',
    license: 'CH-DL-901234',
    contact: '+94 70 456 7890',
    rating: 4.7,
    status: 'off-duty', lifecycleStatus: 'active',
  },
];

const statusConfig = {
  available: {
    icon: CheckCircle,
    class: 'badge-available',
    label: 'Available',
  },
  booked: { icon: Clock, class: 'badge-booked', label: 'Booked' },
  maintenance: {
    icon: AlertTriangle,
    class: 'badge-maintenance',
    label: 'Maintenance',
  },
  'on-trip': { icon: Clock, class: 'badge-active', label: 'On Trip' },
  'off-duty': {
    icon: AlertTriangle,
    class: 'badge-pending',
    label: 'Off Duty',
  },
};

const VEHICLE_TYPES = ['Tuk', 'Car', 'Minivan/VAN'];

const VEHICLE_BRANDS = {
  'Tuk': ['Bajaj', 'Piaggio', 'TVS'],
  'Car': ['Toyota', 'Honda', 'Suzuki', 'Nissan'],
  'Minivan/VAN': ['Toyota', 'Nissan', 'Mercedes'],
};

const VEHICLE_MODELS = {
  'Bajaj': ['RE 4S', 'Maxima'],
  'Piaggio': ['Ape'],
  'TVS': ['King'],
  'Toyota': ['Corolla', 'Prius', 'Aqua', 'Yaris', 'Hiace', 'Alphard'],
  'Honda': ['Civic', 'Fit', 'Vezel'],
  'Suzuki': ['Wagon R', 'Alto 800', 'Swift'],
  'Nissan': ['Sunny', 'March', 'NV200', 'Caravan'],
  'Mercedes': ['V-Class', 'Vito'],
};

const VEHICLE_COLORS = ['White', 'Black', 'Silver', 'Red', 'Blue', 'Grey', 'Yellow', 'Green'];

const defaultNewDriver = {
  firstName: '',
  lastName: '',
  email: '',
  license: '',
  nic: '',
  licenseExpiryDate: '',
  mobileNumber: '',
  secondaryMobileNumber: '',
  addressLine1: '',
  addressLine2: '',
  bloodGroup: '',
  vehicleTypes: [],
  rating: 5.0,
  status: 'available', 
  lifecycleStatus: 'active',
  image: '',
  nicFront: null,
  nicRear: null,
  licenseFront: null,
  licenseRear: null,
};

const defaultNewVehicle = {
  ownerFirstName: '', ownerLastName: '', nicNumber: '', nicFrontImage: null, nicRearImage: null,
  addressLine1: '', addressLine2: '', mobileNumber: '', secondaryMobileNumber: '', email: '',
  type: '', brand: '', model: '', capacity: '', yearOfManufacture: '', color: '', registration: '', status: 'available', lifecycleStatus: 'active',
  insuranceCardFront: null, insuranceExpiryDate: '', revenueLicenseImage: null,
  vehicleImageFront: null, vehicleImageBack: null, vehicleImageSide: null, vehicleImageInside: null,
};

const ImageUploadField = ({ label, value, onChange, onRemove }) => {
  const inputRef = useRef(null);
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div 
        className="relative h-32 w-full rounded-lg border-2 border-dashed border-input flex items-center justify-center overflow-hidden hover:bg-muted/50 transition-colors cursor-pointer"
        onClick={() => !value && inputRef.current?.click()}
      >
        {value ? (
          <>
            <img src={value} alt={label} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
               <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); onRemove(); }}>Remove</Button>
            </div>
            
          </>
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-muted-foreground p-4 text-center">
            <Upload className="h-6 w-6" />
            <span className="text-xs">Click to upload</span>
          </div>
        )}
        <input type="file" ref={inputRef} className="hidden" accept="image/*" onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) { onChange(URL.createObjectURL(file)); }
          e.target.value = '';
        }} />
      </div>
    </div>
  );
};

const Vehicles = () => {
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [drivers, setDrivers] = useState(initialDrivers); // Made mutable
  const [searchVehicle, setSearchVehicle] = useState('');
  const [searchDriver, setSearchDriver] = useState('');
  const [activeTab, setActiveTab] = useState('vehicles');
  const [vehicleFilter, setVehicleFilter] = useState('active');
  const [driverFilter, setDriverFilter] = useState('active');
  const [deleteActionDriver, setDeleteActionDriver] = useState(null);
  const [deleteActionVehicle, setDeleteActionVehicle] = useState(null);
  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);

  // New Driver State
  const [newDriver, setNewDriver] = useState(defaultNewDriver);
  const handleVehicleTypeToggle = (type) => {
    setNewDriver(prev => ({
      ...prev,
      vehicleTypes: prev.vehicleTypes.includes(type)
        ? prev.vehicleTypes.filter(t => t !== type)
        : [...prev.vehicleTypes, type]
    }));
  };

  const [editingDriver, setEditingDriver] = useState(null);
    
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [newVehicle, setNewVehicle] = useState(defaultNewVehicle);
  const fileInputRef = useRef(null);

  const [changeRequestModalOpen, setChangeRequestModalOpen] = useState(false);
  const [changeRequestData, setChangeRequestData] = useState({ fieldName: '', currentValue: '', newValue: '', reason: '' });

  const handleRequestChange = (fieldName, currentValue) => {
    setChangeRequestData({ fieldName, currentValue: currentValue || '', newValue: '', reason: '' });
    setChangeRequestModalOpen(true);
  };

  const submitChangeRequest = () => {
    if (!changeRequestData.newValue || !changeRequestData.reason) {
       toast.error('Please provide both a new value and a reason.');
       return;
    }
    toast.success('Your request has been submitted and is pending admin approval');
    setChangeRequestModalOpen(false);
  };

  const LockedField = ({ label, value, isImage }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        {isImage ? (
          <div className="h-20 w-32 rounded border border-dashed flex items-center justify-center bg-muted/50 overflow-hidden relative">
            {value ? <img src={value} alt={label} className="h-full w-full object-cover opacity-50 grayscale" /> : <span className="text-[10px] text-muted-foreground text-center">No image</span>}
            <Lock className="absolute h-4 w-4 text-foreground/70" />
          </div>
        ) : (
          <div className="relative flex-1">
            <Input value={value || ''} disabled className="pr-8 bg-muted text-muted-foreground cursor-not-allowed" />
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        )}
        <Button variant="outline" size="sm" type="button" onClick={() => handleRequestChange(label, value)}>
          Request Change
        </Button>
      </div>
    </div>
  );

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.lifecycleStatus === vehicleFilter &&
      ((v.name || '').toLowerCase().includes(searchVehicle.toLowerCase()) ||
       (v.registration || '').toLowerCase().includes(searchVehicle.toLowerCase()))
  );

  const handleSuspendVehicle = (id) => {
    setVehicles((prev) => prev.map((v) => v.id === id ? { ...v, lifecycleStatus: 'suspended' } : v));
    toast.success('Vehicle suspended successfully');
    setDeleteActionVehicle(null);
  };

  const handlePermanentDeleteVehicle = (id) => {
    setVehicles((prev) => prev.filter((v) => v.id !== id));
    toast.success('Vehicle permanently deleted');
    setDeleteActionVehicle(null);
  };

  const handleRestoreVehicle = (id) => {
    setVehicles((prev) => prev.map((v) => v.id === id ? { ...v, lifecycleStatus: 'active' } : v));
    toast.success('Vehicle restored successfully');
  };

  const filteredDrivers = drivers.filter(
    (d) =>
      d.lifecycleStatus === driverFilter &&
      ((d.name || '').toLowerCase().includes((searchDriver || '').toLowerCase()) ||
      (d.license || '').toLowerCase().includes((searchDriver || '').toLowerCase()) ||
      (d.email || '').toLowerCase().includes((searchDriver || '').toLowerCase()) ||
      (d.contact || '').includes(searchDriver || ''))
  );

  const handleDriverImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setNewDriver({ ...newDriver, image: imageUrl });
    }
  };

  const removeDriverImage = () => {
    setNewDriver({ ...newDriver, image: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };



  const handleEditVehicle = (vehicle) => {
    setNewVehicle({ ...defaultNewVehicle, ...vehicle });
    setEditingVehicle(vehicle);
    setIsAddVehicleOpen(true);
  };

  const handleCreateVehicle = () => {
    setNewVehicle(defaultNewVehicle);
    setEditingVehicle(null);
    setIsAddVehicleOpen(true);
  };

  const handleSaveVehicle = () => {
    if (newVehicle.registration) {
      const computedName = (newVehicle.brand && newVehicle.model) ? `${newVehicle.brand} ${newVehicle.model}` : newVehicle.registration;
      if (editingVehicle) {
        setVehicles((prev) =>
          prev.map((v) =>
            v.id === editingVehicle.id
              ? {
                  ...v,
                  ...newVehicle,
                  name: computedName,
                  images: newVehicle.vehicleImageFront ? [newVehicle.vehicleImageFront] : v.images,
                }
              : v
          )
        );
      } else {
        setVehicles([
          ...vehicles,
          {
            ...newVehicle,
            id: `V${String(vehicles.length + 1).padStart(3, '0')}`,
            name: computedName,
            images: newVehicle.vehicleImageFront ? [newVehicle.vehicleImageFront] : [],
            status: 'available', lifecycleStatus: 'active',
          },
        ]);
      }
      setIsAddVehicleOpen(false);
      setNewVehicle(defaultNewVehicle);
      setEditingVehicle(null);
    }
  };

    const handleSaveDriver = () => {
    if (
      newDriver.firstName &&
      newDriver.nic &&
      newDriver.mobileNumber &&
      newDriver.vehicleTypes.length > 0 &&
      newDriver.license
    ) {
      if (editingDriver) {
         setDrivers(drivers.map((d) => d.id === editingDriver.id ? {
            ...d,
            ...newDriver,
            name: `${newDriver.firstName} ${newDriver.lastName}`.trim(),
            contact: newDriver.mobileNumber,
         } : d));
         toast.success('Driver updated successfully');
      } else {
         setDrivers([
           ...drivers,
           {
             ...newDriver,
             id: `D${String(drivers.length + 1).padStart(3, '0')}`,
             name: `${newDriver.firstName} ${newDriver.lastName}`.trim(),
             contact: newDriver.mobileNumber,
             status: 'available', lifecycleStatus: 'active',
           },
         ]);
         toast.success('Driver added successfully');
      }
      setNewDriver(defaultNewDriver);
      setEditingDriver(null);
      setIsAddDriverOpen(false);
    } else {
      toast.error('Please fill in all mandatory fields');
    }
  };

    const handleEditDriver = (driver) => {
    setEditingDriver(driver);
    const firstName = driver.name ? driver.name.split(' ')[0] : '';
    const lastName = driver.name && driver.name.split(' ').length > 1 ? driver.name.split(' ').slice(1).join(' ') : '';
    
    setNewDriver({
      ...defaultNewDriver,
      ...driver,
      firstName,
      lastName,
      mobileNumber: driver.contact || '',
    });
    setIsAddDriverOpen(true);
  };

  const handleCreateDriver = () => {
    setEditingDriver(null);
    setNewDriver(defaultNewDriver);
    setIsAddDriverOpen(true);
  };

  
  const handleDeleteVehicle = (id) => {
    setVehicles((prev) => prev.filter((v) => v.id !== id));
  };

  const handleVehicleStatusChange = (id, newStatus) => {
    setVehicles((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: newStatus } : v))
    );
  };

  const handleDriverStatusChange = (id, newStatus) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: newStatus } : d))
    );
  };

  
  const handleSuspendDriver = (id) => {
    setDrivers((prev) => prev.map((d) => d.id === id ? { ...d, lifecycleStatus: 'suspended' } : d));
    toast.success('Driver suspended successfully');
    setDeleteActionDriver(null);
  };

  const handlePermanentDeleteDriver = (id) => {
    setDrivers((prev) => prev.filter((d) => d.id !== id));
    toast.success('Driver permanently deleted');
    setDeleteActionDriver(null);
  };

  const handleRestoreDriver = (id) => {
    setDrivers((prev) => prev.map((d) => d.id === id ? { ...d, lifecycleStatus: 'active' } : d));
    toast.success('Driver restored successfully');
  };


  return (
    <DashboardLayout
      title="Vehicles & Drivers"
      subtitle="Manage your fleet and driver assignments"
      showSearch={false}
    >
      <div className="space-y-6">

      {/* Change Request Modal */}
      <Dialog open={changeRequestModalOpen} onOpenChange={setChangeRequestModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Request Change</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Field</Label>
              <Input value={changeRequestData.fieldName} disabled className="bg-muted text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <Label>Current Value</Label>
              <Input value={changeRequestData.currentValue || ''} disabled className="bg-muted text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <Label>New Value <span className="text-destructive">*</span></Label>
              <Input 
                 placeholder="Enter new value" 
                 value={changeRequestData.newValue} 
                 onChange={(e) => setChangeRequestData({...changeRequestData, newValue: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label>Reason <span className="text-destructive">*</span></Label>
              <Textarea 
                placeholder="Why are you changing this field?"
                value={changeRequestData.reason}
                onChange={(e) => setChangeRequestData({...changeRequestData, reason: e.target.value})}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setChangeRequestModalOpen(false)}>Cancel</Button>
            <Button onClick={submitChangeRequest}>Submit Request</Button>
          </div>
        </DialogContent>
      </Dialog>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-border pb-4">
          <Button
            variant={activeTab === 'vehicles' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('vehicles')}
            className="gap-2"
          >
            <Car className="h-4 w-4" />
            Vehicles
          </Button>
          <Button
            variant={activeTab === 'drivers' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('drivers')}
            className="gap-2"
          >
            <User className="h-4 w-4" />
            Drivers
          </Button>
        </div>

        {activeTab === 'vehicles' ? (
          <>
            {/* Vehicles Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-4 w-full sm:w-auto">
                <div className="flex bg-muted p-1 rounded-lg">
                  <Button variant={vehicleFilter === 'active' ? 'secondary' : 'ghost'} size="sm" onClick={() => setVehicleFilter('active')} className="text-sm">Active</Button>
                  <Button variant={vehicleFilter === 'suspended' ? 'secondary' : 'ghost'} size="sm" onClick={() => setVehicleFilter('suspended')} className="text-sm">Suspended</Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search vehicles..."
                    value={searchVehicle}
                    onChange={(e) => setSearchVehicle(e.target.value)}
                    className="input-search w-full sm:w-64 pl-9"
                  />
                </div>
              </div>
                  <Button className="gap-2" onClick={handleCreateVehicle}>
                    <Plus className="h-4 w-4" />
                    Add Vehicle
                  </Button>
              <Dialog
                open={isAddVehicleOpen}
                onOpenChange={setIsAddVehicleOpen}
              >
                <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[700px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-8 py-4">
                    {/* Section 1: Owner Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-foreground border-b pb-2">1. Owner Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {editingVehicle ? <LockedField label="First Name" value={newVehicle.ownerFirstName} /> : <div className="space-y-2"><Label>First Name</Label><Input value={newVehicle.ownerFirstName} onChange={(e) => setNewVehicle({ ...newVehicle, ownerFirstName: e.target.value })} /></div>}
                        {editingVehicle ? <LockedField label="Last Name" value={newVehicle.ownerLastName} /> : <div className="space-y-2"><Label>Last Name</Label><Input value={newVehicle.ownerLastName} onChange={(e) => setNewVehicle({ ...newVehicle, ownerLastName: e.target.value })} /></div>}
                      </div>
                      {editingVehicle ? <LockedField label="NIC Number" value={newVehicle.nicNumber} /> : <div className="space-y-2"><Label>NIC Number</Label><Input value={newVehicle.nicNumber} onChange={(e) => setNewVehicle({ ...newVehicle, nicNumber: e.target.value })} /></div>}
                      <div className="grid grid-cols-2 gap-4">
                        {editingVehicle ? <LockedField label="NIC Front Image" value={newVehicle.nicFrontImage} isImage /> : <ImageUploadField label="NIC Front Image" value={newVehicle.nicFrontImage} onChange={(val) => setNewVehicle({ ...newVehicle, nicFrontImage: val })} onRemove={() => setNewVehicle({ ...newVehicle, nicFrontImage: null })} />}
                        {editingVehicle ? <LockedField label="NIC Rear Image" value={newVehicle.nicRearImage} isImage /> : <ImageUploadField label="NIC Rear Image" value={newVehicle.nicRearImage} onChange={(val) => setNewVehicle({ ...newVehicle, nicRearImage: val })} onRemove={() => setNewVehicle({ ...newVehicle, nicRearImage: null })} />}
                      </div>
                      <div className="space-y-2"><Label>Address Line 1</Label><Input value={newVehicle.addressLine1} onChange={(e) => setNewVehicle({ ...newVehicle, addressLine1: e.target.value })} /></div>
                      <div className="space-y-2"><Label>Address Line 2</Label><Input value={newVehicle.addressLine2} onChange={(e) => setNewVehicle({ ...newVehicle, addressLine2: e.target.value })} /></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Mobile Number</Label><Input value={newVehicle.mobileNumber} onChange={(e) => setNewVehicle({ ...newVehicle, mobileNumber: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Secondary Mobile (Optional)</Label><Input value={newVehicle.secondaryMobileNumber} onChange={(e) => setNewVehicle({ ...newVehicle, secondaryMobileNumber: e.target.value })} /></div>
                      </div>
                      <div className="space-y-2"><Label>Email Address (Optional)</Label><Input type="email" value={newVehicle.email} onChange={(e) => setNewVehicle({ ...newVehicle, email: e.target.value })} /></div>
                    </div>

                    {/* Section 2: Vehicle Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-foreground border-b pb-2">2. Vehicle Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {editingVehicle ? <LockedField label="Vehicle Type" value={newVehicle.type} /> : (
                          <div className="space-y-2"><Label>Vehicle Type</Label>
                            <Select value={newVehicle.type} onValueChange={(value) => setNewVehicle({ ...newVehicle, type: value, brand: '', model: '' })}>
                              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                              <SelectContent>{VEHICLE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                        )}
                        {editingVehicle ? <LockedField label="Brand" value={newVehicle.brand} /> : (
                          <div className="space-y-2"><Label>Brand</Label>
                            <Select value={newVehicle.brand} onValueChange={(value) => setNewVehicle({ ...newVehicle, brand: value, model: '' })} disabled={!newVehicle.type}>
                              <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
                              <SelectContent>{(VEHICLE_BRANDS[newVehicle.type] || []).map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                        )}
                        {editingVehicle ? <LockedField label="Model" value={newVehicle.model} /> : (
                          <div className="space-y-2"><Label>Model</Label>
                            <Select value={newVehicle.model} onValueChange={(value) => setNewVehicle({ ...newVehicle, model: value })} disabled={!newVehicle.brand}>
                              <SelectTrigger><SelectValue placeholder="Select model" /></SelectTrigger>
                              <SelectContent>{(VEHICLE_MODELS[newVehicle.brand] || []).map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                        )}
                        <div className="space-y-2"><Label>Color</Label>
                          <Select value={newVehicle.color} onValueChange={(value) => setNewVehicle({ ...newVehicle, color: value })}>
                            <SelectTrigger><SelectValue placeholder="Select color" /></SelectTrigger>
                            <SelectContent>{VEHICLE_COLORS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2"><Label>Passenger Capacity</Label><Input type="number" value={newVehicle.capacity} onChange={(e) => setNewVehicle({ ...newVehicle, capacity: parseInt(e.target.value) || 0 })} /></div>
                        {editingVehicle ? <LockedField label="Year of Manufacture" value={newVehicle.yearOfManufacture} /> : <div className="space-y-2"><Label>Year of Manufacture</Label><Input type="number" value={newVehicle.yearOfManufacture} onChange={(e) => setNewVehicle({ ...newVehicle, yearOfManufacture: e.target.value })} /></div>}
                      </div>
                      {editingVehicle ? <LockedField label="License Plate Number" value={newVehicle.registration} /> : <div className="space-y-2"><Label>License Plate Number</Label><Input placeholder="e.g., KA-01-AB-1234" value={newVehicle.registration} onChange={(e) => setNewVehicle({ ...newVehicle, registration: e.target.value })} /></div>}
                    </div>

                    {/* Section 3: Documents and Photos */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-foreground border-b pb-2">3. Documents and Photos</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <ImageUploadField label="Insurance Card (Front)" value={newVehicle.insuranceCardFront} onChange={(val) => setNewVehicle({ ...newVehicle, insuranceCardFront: val })} onRemove={() => setNewVehicle({ ...newVehicle, insuranceCardFront: null })} />
                        <div className="space-y-2"><Label>Insurance Expiry Date</Label><Input type="date" value={newVehicle.insuranceExpiryDate} onChange={(e) => setNewVehicle({ ...newVehicle, insuranceExpiryDate: e.target.value })} /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <ImageUploadField label="Revenue License" value={newVehicle.revenueLicenseImage} onChange={(val) => setNewVehicle({ ...newVehicle, revenueLicenseImage: val })} onRemove={() => setNewVehicle({ ...newVehicle, revenueLicenseImage: null })} />
                      </div>
                      <Label className="block mt-4">Vehicle Photos</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <ImageUploadField label="Front View" value={newVehicle.vehicleImageFront} onChange={(val) => setNewVehicle({ ...newVehicle, vehicleImageFront: val })} onRemove={() => setNewVehicle({ ...newVehicle, vehicleImageFront: null })} />
                        <ImageUploadField label="Back View" value={newVehicle.vehicleImageBack} onChange={(val) => setNewVehicle({ ...newVehicle, vehicleImageBack: val })} onRemove={() => setNewVehicle({ ...newVehicle, vehicleImageBack: null })} />
                        <ImageUploadField label="Side View" value={newVehicle.vehicleImageSide} onChange={(val) => setNewVehicle({ ...newVehicle, vehicleImageSide: val })} onRemove={() => setNewVehicle({ ...newVehicle, vehicleImageSide: null })} />
                        <ImageUploadField label="Interior View" value={newVehicle.vehicleImageInside} onChange={(val) => setNewVehicle({ ...newVehicle, vehicleImageInside: val })} onRemove={() => setNewVehicle({ ...newVehicle, vehicleImageInside: null })} />
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredVehicles.map((vehicle) => {
                const status = statusConfig[vehicle.status];
                const StatusIcon = status.icon;
                return (
                  <div
                    key={vehicle.id}
                    className="overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/30 hover:shadow-md"
                  >
                    {/* Vehicle Image or Placeholder */}
                    <div className="aspect-video w-full bg-muted/30 relative">
                      {vehicle.images && vehicle.images.length > 0 ? (
                        <img
                          src={vehicle.images[0]}
                          alt={vehicle.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted/50">
                          <Car className="h-12 w-12 text-muted-foreground/30" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="focus:outline-none">
                            <span
                              className={cn(
                                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium shadow-sm backdrop-blur-md bg-background/80 hover:bg-background/90 transition-colors cursor-pointer',
                                status.class
                              )}
                            >
                              <StatusIcon className="h-3 w-3" />
                              {status.label}
                            </span>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleVehicleStatusChange(vehicle.id, 'available')}>
                              Available
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleVehicleStatusChange(vehicle.id, 'booked')}>
                              Booked
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleVehicleStatusChange(vehicle.id, 'maintenance')}>
                              Maintenance
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground text-lg">
                            {vehicle.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {vehicle.type}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Registration
                          </span>
                          <span className="font-medium text-foreground">
                            {vehicle.registration}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Capacity
                          </span>
                          <span className="font-medium text-foreground">
                            {vehicle.capacity} seats
                          </span>
                        </div>
                        {vehicle.driver && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Driver
                            </span>
                            <span className="font-medium text-foreground">
                              {vehicle.driver}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 flex gap-2">
                        {vehicleFilter === 'suspended' ? (
                          <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleRestoreVehicle(vehicle.id)}>
                            Restore
                          </Button>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 gap-1"
                              onClick={() => handleEditVehicle(vehicle)}
                            >
                              <Edit className="h-3 w-3" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => setDeleteActionVehicle(vehicle)}
                            >
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
            {deleteActionVehicle && (
              <AlertDialog open={!!deleteActionVehicle} onOpenChange={(open) => !open && setDeleteActionVehicle(null)}>
                <AlertDialogContent>
                  {deleteActionVehicle.status === 'booked' ? (
                    <>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cannot Delete Vehicle</AlertDialogTitle>
                        <AlertDialogDescription>
                          This vehicle cannot be deleted because it has an active booking. Please wait until the booking is completed.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Close</AlertDialogCancel>
                      </AlertDialogFooter>
                    </>
                  ) : (
                    <>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Vehicle</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action will permanently remove the vehicle from the platform. Historical booking records will be preserved. Are you sure?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <Button variant="outline" className="bg-amber-500/10 text-amber-500 hover:text-amber-600 hover:bg-amber-500/20 border-amber-500/20" onClick={() => handleSuspendVehicle(deleteActionVehicle.id)}>Suspend Vehicle</Button>
                        <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => handlePermanentDeleteVehicle(deleteActionVehicle.id)}>Delete Vehicle</AlertDialogAction>
                      </AlertDialogFooter>
                    </>
                  )}
                </AlertDialogContent>
              </AlertDialog>
            )}
          </>
        ) : (
          <>
            {/* Drivers Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-4 w-full sm:w-auto">
                <div className="flex bg-muted p-1 rounded-lg">
                  <Button variant={driverFilter === 'active' ? 'secondary' : 'ghost'} size="sm" onClick={() => setDriverFilter('active')} className="text-sm">Active</Button>
                  <Button variant={driverFilter === 'suspended' ? 'secondary' : 'ghost'} size="sm" onClick={() => setDriverFilter('suspended')} className="text-sm">Suspended</Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search drivers..."
                    value={searchDriver}
                    onChange={(e) => setSearchDriver(e.target.value)}
                    className="input-search w-full sm:w-64 pl-9"
                  />
                </div>
              </div>
                  <Button className="gap-2" onClick={handleCreateDriver}>
                    <Plus className="h-4 w-4" />
                    Add Driver
                  </Button>
              <Dialog open={isAddDriverOpen} onOpenChange={setIsAddDriverOpen}>
<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[700px]">
  <DialogHeader>
    <DialogTitle>{editingDriver ? "Edit Driver" : "Add New Driver"}</DialogTitle>
  </DialogHeader>
  <div className="space-y-8 py-4">
    
    {/* Driver Photo */}
    {editingDriver ? <LockedField label="Driver Photo" value={newDriver.image} isImage /> : (
      <div className="space-y-2">
        <Label>Driver Photo <span className="text-muted-foreground text-xs font-normal">(Clear face visible)</span></Label>
        <div className="flex flex-col items-center gap-4 mb-4">
          <div className="relative h-24 w-24 rounded-full border-2 border-dashed border-input flex items-center justify-center overflow-hidden hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            {newDriver.image ? (
              <><img src={newDriver.image} alt="Preview" className="h-full w-full object-cover" /><div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"><span className="text-xs text-white">Change</span></div></>
            ) : (
              <div className="text-center p-2"><Upload className="h-6 w-6 mx-auto text-muted-foreground mb-1" /><span className="text-[10px] text-muted-foreground">Upload Photo</span></div>
            )}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleDriverImageUpload} />
          </div>
          {newDriver.image && <Button variant="ghost" size="sm" onClick={removeDriverImage} className="text-xs text-destructive h-6">Remove Photo</Button>}
        </div>
      </div>
    )}

    {/* Section 1: Personal Details */}
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-foreground border-b pb-2">1. Personal Information</h3>
      <div className="grid grid-cols-2 gap-4">
        {editingDriver ? <LockedField label="First Name" value={newDriver.firstName} /> : <div className="space-y-2"><Label>First Name <span className="text-destructive">*</span></Label><Input placeholder="e.g., John" value={newDriver.firstName} onChange={(e) => setNewDriver({...newDriver, firstName: e.target.value})} /></div>}
        {editingDriver ? <LockedField label="Last Name" value={newDriver.lastName} /> : <div className="space-y-2"><Label>Last Name</Label><Input placeholder="e.g., Smith" value={newDriver.lastName} onChange={(e) => setNewDriver({...newDriver, lastName: e.target.value})} /></div>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {editingDriver ? <LockedField label="NIC Number" value={newDriver.nic} /> : <div className="space-y-2"><Label>NIC Number <span className="text-destructive">*</span></Label><Input placeholder="e.g., 991234567V" value={newDriver.nic} onChange={(e) => setNewDriver({...newDriver, nic: e.target.value})} /></div>}
        <div className="space-y-2"><Label>Blood Group</Label>
          <Select value={newDriver.bloodGroup} onValueChange={(val) => setNewDriver({...newDriver, bloodGroup: val})}>
            <SelectTrigger><SelectValue placeholder="Select Blood Group" /></SelectTrigger>
            <SelectContent>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
            </SelectContent>
           </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {editingDriver ? <LockedField label="NIC Front Image" value={newDriver.nicFront} isImage /> : <ImageUploadField label="NIC Front Image" value={newDriver.nicFront} onChange={(v) => setNewDriver({...newDriver, nicFront: v})} onRemove={() => setNewDriver({...newDriver, nicFront: null})} />}
        {editingDriver ? <LockedField label="NIC Rear Image" value={newDriver.nicRear} isImage /> : <ImageUploadField label="NIC Rear Image" value={newDriver.nicRear} onChange={(v) => setNewDriver({...newDriver, nicRear: v})} onRemove={() => setNewDriver({...newDriver, nicRear: null})} />}
      </div>
    </div>

    {/* Section 2: Contact Information */}
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-foreground border-b pb-2">2. Contact Information</h3>
      <div className="space-y-2"><Label>Address Line 1</Label><Input placeholder="123 Street Name" value={newDriver.addressLine1} onChange={(e) => setNewDriver({...newDriver, addressLine1: e.target.value})} /></div>
      <div className="space-y-2"><Label>Address Line 2</Label><Input placeholder="City, State" value={newDriver.addressLine2} onChange={(e) => setNewDriver({...newDriver, addressLine2: e.target.value})} /></div>
      <div className="space-y-2"><Label>Email (Optional)</Label><Input type="email" placeholder="john@example.com" value={newDriver.email} onChange={(e) => setNewDriver({...newDriver, email: e.target.value})} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Mobile Number <span className="text-destructive">*</span></Label><Input placeholder="+94 77..." value={newDriver.mobileNumber} onChange={(e) => setNewDriver({...newDriver, mobileNumber: e.target.value})} /></div>
        <div className="space-y-2"><Label>Second Mobile (Optional)</Label><Input placeholder="+94 71..." value={newDriver.secondaryMobileNumber} onChange={(e) => setNewDriver({...newDriver, secondaryMobileNumber: e.target.value})} /></div>
      </div>
    </div>

    {/* Section 3: Credentials */}
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-foreground border-b pb-2">3. Driving Credentials</h3>
      <div className="space-y-2">
         <Label>What kind of vehicle he/she can drive? <span className="text-destructive">*</span></Label>
         <div className="flex gap-6 mt-2">
           {['Tuk', 'Car', 'Minivan/VAN'].map(type => (
             <div key={type} className="flex items-center space-x-2 bg-muted/30 px-3 py-2 rounded-md border">
               <Checkbox 
                 id={`check-${type}`} 
                 checked={newDriver.vehicleTypes.includes(type)}
                 onCheckedChange={() => handleVehicleTypeToggle(type)}
               />
               <label htmlFor={`check-${type}`} className="text-sm font-medium leading-none cursor-pointer">{type}</label>
             </div>
           ))}
         </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {editingDriver ? <LockedField label="License Number" value={newDriver.license} /> : <div className="space-y-2"><Label>License Number <span className="text-destructive">*</span></Label><Input value={newDriver.license} onChange={(e) => setNewDriver({...newDriver, license: e.target.value})} /></div>}
        <div className="space-y-2"><Label>License Expiry Date</Label><Input type="date" value={newDriver.licenseExpiryDate} onChange={(e) => setNewDriver({...newDriver, licenseExpiryDate: e.target.value})} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <ImageUploadField label="License Front Image" value={newDriver.licenseFront} onChange={(v) => setNewDriver({...newDriver, licenseFront: v})} onRemove={() => setNewDriver({...newDriver, licenseFront: null})} />
        <ImageUploadField label="License Rear Image" value={newDriver.licenseRear} onChange={(v) => setNewDriver({...newDriver, licenseRear: v})} onRemove={() => setNewDriver({...newDriver, licenseRear: null})} />
      </div>
    </div>

    <Button className="w-full mt-6" onClick={handleSaveDriver}>{editingDriver ? "Update Driver" : "Add Driver"}</Button>
  </div>
</DialogContent>
              </Dialog>

              
            </div>

            {/* Drivers Table */}
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Driver
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      License
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Rating
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Vehicle
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredDrivers.map((driver) => {
                    const status = statusConfig[driver.status];
                    const StatusIcon = status.icon;
                    return (
                      <tr key={driver.id} className="table-row-hover">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-primary to-accent overflow-hidden">
                              {driver.image ? (
                                <img
                                  src={driver.image}
                                  alt={driver.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-sm font-semibold text-primary-foreground">
                                  {driver.name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground">
                                {driver.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {driver.email}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-foreground">
                          {driver.license}
                        </td>
                        <td className="px-6 py-4 text-foreground">
                          {driver.contact}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium text-foreground">
                              {driver.rating}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-foreground">
                          {driver.vehicle || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="focus:outline-none">
                              <span
                                className={cn(
                                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity',
                                  status.class
                                )}
                              >
                                <StatusIcon className="h-3 w-3" />
                                {status.label}
                              </span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleDriverStatusChange(driver.id, 'available')}>
                                Available
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDriverStatusChange(driver.id, 'on-trip')}>
                                On Trip
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDriverStatusChange(driver.id, 'off-duty')}>
                                Off Duty
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                          {driver.lifecycleStatus === 'suspended' ? (
                            <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleRestoreDriver(driver.id)}>
                              Restore
                            </Button>
                          ) : (
                            <>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEditDriver(driver)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setDeleteActionDriver(driver)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
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
            {deleteActionDriver && (
              <AlertDialog open={!!deleteActionDriver} onOpenChange={(open) => !open && setDeleteActionDriver(null)}>
                <AlertDialogContent>
                  {deleteActionDriver.status === 'on-trip' ? (
                    <>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cannot Delete Driver</AlertDialogTitle>
                        <AlertDialogDescription>
                          This driver cannot be deleted because they are currently on an active trip. Please wait until the trip is completed.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Close</AlertDialogCancel>
                      </AlertDialogFooter>
                    </>
                  ) : (
                    <>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Driver</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action will permanently remove the driver from the platform. Historical trip and booking records will be preserved. Are you sure?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <Button variant="outline" className="bg-amber-500/10 text-amber-500 hover:text-amber-600 hover:bg-amber-500/20 border-amber-500/20" onClick={() => handleSuspendDriver(deleteActionDriver.id)}>Suspend Driver</Button>
                        <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => handlePermanentDeleteDriver(deleteActionDriver.id)}>Delete Driver</AlertDialogAction>
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
