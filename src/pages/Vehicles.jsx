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
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    status: 'available',
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
    status: 'booked',
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
    status: 'maintenance',
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
    status: 'booked',
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
    status: 'available',
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
    status: 'available',
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
    status: 'on-trip',
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
    status: 'on-trip',
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
    status: 'off-duty',
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

const Vehicles = () => {
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [drivers, setDrivers] = useState(initialDrivers); // Made mutable
  const [searchVehicle, setSearchVehicle] = useState('');
  const [searchDriver, setSearchDriver] = useState('');
  const [activeTab, setActiveTab] = useState('vehicles');
  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);

  // New Driver State
  const [newDriver, setNewDriver] = useState({
    name: '',
    email: '',
    license: '',
    nic: '',
    licenseIssuedDate: '',
    licenseExpiryDate: '',
    contact: '',
    rating: 5.0,
    status: 'available',
    image: '',
  });

  const [editingDriver, setEditingDriver] = useState(null);
  const [isEditDriverOpen, setIsEditDriverOpen] = useState(false);
  const [editDriverForm, setEditDriverForm] = useState({
    email: '',
    contact: '',
    license: '',
  });

  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [newVehicle, setNewVehicle] = useState({
    name: '',
    type: '',
    registration: '',
    capacity: 0,
    status: 'available',
    images: [],
  });

  const fileInputRef = useRef(null);
  const vehicleFileInputRef = useRef(null);

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.name.toLowerCase().includes(searchVehicle.toLowerCase()) ||
      v.registration.toLowerCase().includes(searchVehicle.toLowerCase())
  );

  const filteredDrivers = drivers.filter(
    (d) =>
      d.name.toLowerCase().includes(searchDriver.toLowerCase()) ||
      d.license.toLowerCase().includes(searchDriver.toLowerCase()) ||
      d.email.toLowerCase().includes(searchDriver.toLowerCase())
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

  const handleVehicleImageUpload = (e) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );
      setNewVehicle({
        ...newVehicle,
        images: [...(newVehicle.images || []), ...newImages],
      });
    }
  };

  const removeVehicleImage = (index) => {
    const updatedImages = (newVehicle.images || []).filter(
      (_, i) => i !== index
    );
    setNewVehicle({ ...newVehicle, images: updatedImages });
  };

  const handleEditVehicle = (vehicle) => {
    setNewVehicle({
      name: vehicle.name,
      type: vehicle.type,
      registration: vehicle.registration,
      capacity: vehicle.capacity,
      status: vehicle.status,
      images: vehicle.images || [],
    });
    setEditingVehicle(vehicle);
    setIsAddVehicleOpen(true);
  };

  const handleCreateVehicle = () => {
    setNewVehicle({
      name: '',
      type: '',
      registration: '',
      capacity: 0,
      status: 'available',
      images: [],
    });
    setEditingVehicle(null);
    setIsAddVehicleOpen(true);
  };

  const handleSaveVehicle = () => {
    if (newVehicle.name && newVehicle.registration) {
      if (editingVehicle) {
        // Update existing vehicle
        setVehicles((prev) =>
          prev.map((v) =>
            v.id === editingVehicle.id
              ? {
                  ...v,
                  name: newVehicle.name,
                  type: newVehicle.type || 'Sedan',
                  registration: newVehicle.registration,
                  capacity: newVehicle.capacity || 4,
                  status: newVehicle.status, // Preserve status or update if we added status field to form
                  images: newVehicle.images,
                }
              : v
          )
        );
      } else {
        // Create new vehicle
        setVehicles([
          ...vehicles,
          {
            id: `V${String(vehicles.length + 1).padStart(3, '0')}`,
            name: newVehicle.name,
            type: newVehicle.type || 'Sedan',
            registration: newVehicle.registration,
            capacity: newVehicle.capacity || 4,
            status: 'available',
            images: newVehicle.images,
          },
        ]);
      }
      setIsAddVehicleOpen(false);
      setNewVehicle({
        name: '',
        type: '',
        registration: '',
        capacity: 0,
        status: 'available',
        images: [],
      });
      setEditingVehicle(null);
    }
  };

  const handleAddDriver = () => {
    if (
      newDriver.name &&
      newDriver.email &&
      newDriver.license &&
      newDriver.contact &&
      newDriver.nic &&
      newDriver.licenseIssuedDate &&
      newDriver.licenseExpiryDate
    ) {
      setDrivers([
        ...drivers,
        {
          id: `D${String(drivers.length + 1).padStart(3, '0')}`,
          name: newDriver.name,
          email: newDriver.email,
          license: newDriver.license,
          nic: newDriver.nic,
          licenseIssuedDate: newDriver.licenseIssuedDate,
          licenseExpiryDate: newDriver.licenseExpiryDate,
          contact: newDriver.contact,
          rating: 5.0,
          image: newDriver.image,
          status: 'available',
        },
      ]);
      setNewDriver({
        name: '',
        email: '',
        license: '',
        nic: '',
        licenseIssuedDate: '',
        licenseExpiryDate: '',
        contact: '',
        rating: 5.0,
        status: 'available',
        image: '',
      });
      setIsAddDriverOpen(false);
    }
  };

  const handleEditDriver = (driver) => {
    setEditingDriver(driver);
    setEditDriverForm({
      email: driver.email,
      contact: driver.contact,
      license: driver.license,
    });
    setIsEditDriverOpen(true);
  };

  const handleUpdateDriver = () => {
    if (
      editingDriver &&
      editDriverForm.email &&
      editDriverForm.contact &&
      editDriverForm.license
    ) {
      setDrivers(
        drivers.map((d) =>
          d.id === editingDriver.id
            ? {
                ...d,
                email: editDriverForm.email,
                contact: editDriverForm.contact,
                license: editDriverForm.license,
              }
            : d
        )
      );
      setIsEditDriverOpen(false);
      setEditingDriver(null);
    }
  };

  return (
    <DashboardLayout
      title="Vehicles & Drivers"
      subtitle="Manage your fleet and driver assignments"
      showSearch={false}
    >
      <div className="space-y-6">
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
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search vehicles..."
                  value={searchVehicle}
                  onChange={(e) => setSearchVehicle(e.target.value)}
                  className="input-search w-full sm:w-80"
                />
              </div>
              <Dialog
                open={isAddVehicleOpen}
                onOpenChange={setIsAddVehicleOpen}
              >
                <DialogTrigger asChild>
                  <Button className="gap-2" onClick={handleCreateVehicle}>
                    <Plus className="h-4 w-4" />
                    Add Vehicle
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {/* Vehicle Images */}
                    <div className="space-y-3">
                      <Label>Vehicle Images</Label>
                      <div
                        className="border-2 border-dashed border-input rounded-lg p-6 hover:bg-muted/50 transition-colors cursor-pointer text-center"
                        onClick={() => vehicleFileInputRef.current?.click()}
                      >
                        <input
                          type="file"
                          ref={vehicleFileInputRef}
                          className="hidden"
                          multiple
                          accept="image/*"
                          onChange={handleVehicleImageUpload}
                        />

                        <div className="flex flex-col items-center gap-1.5">
                          <div className="p-2 bg-background rounded-full border shadow-sm">
                            <Upload className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <p className="text-sm font-medium text-foreground">
                            Click to upload vehicle photos
                          </p>
                        </div>
                      </div>
                      {newVehicle.images && newVehicle.images.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {newVehicle.images.map((url, index) => (
                            <div
                              key={index}
                              className="relative group aspect-video rounded-md overflow-hidden bg-muted border"
                            >
                              <img
                                src={url}
                                alt={`Vehicle ${index}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeVehicleImage(index);
                                }}
                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Vehicle Name</Label>
                      <Input
                        placeholder="e.g., Toyota Innova"
                        value={newVehicle.name}
                        onChange={(e) =>
                          setNewVehicle({ ...newVehicle, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select
                          value={newVehicle.type}
                          onValueChange={(value) =>
                            setNewVehicle({ ...newVehicle, type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SUV">SUV</SelectItem>
                            <SelectItem value="Van">Van</SelectItem>
                            <SelectItem value="Sedan">Sedan</SelectItem>
                            <SelectItem value="Bus">Bus</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Capacity</Label>
                        <Input
                          type="number"
                          placeholder="e.g., 7"
                          value={newVehicle.capacity || ''}
                          onChange={(e) =>
                            setNewVehicle({
                              ...newVehicle,
                              capacity: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Registration Number</Label>
                      <Input
                        placeholder="e.g., KA-01-AB-1234"
                        value={newVehicle.registration}
                        onChange={(e) =>
                          setNewVehicle({
                            ...newVehicle,
                            registration: e.target.value,
                          })
                        }
                      />
                    </div>
                    <Button className="w-full" onClick={handleSaveVehicle}>
                      {editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
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
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium shadow-sm backdrop-blur-md bg-background/80',
                            status.class
                          )}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </span>
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
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            {/* Drivers Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search drivers..."
                  value={searchDriver}
                  onChange={(e) => setSearchDriver(e.target.value)}
                  className="input-search w-full sm:w-80"
                />
              </div>
              <Dialog open={isAddDriverOpen} onOpenChange={setIsAddDriverOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Driver
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Driver</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {/* Image Upload */}
                    <div className="flex flex-col items-center gap-4 mb-4">
                      <div
                        className="relative h-24 w-24 rounded-full border-2 border-dashed border-input flex items-center justify-center overflow-hidden hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {newDriver.image ? (
                          <>
                            <img
                              src={newDriver.image}
                              alt="Preview"
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <span className="text-xs text-white">Change</span>
                            </div>
                          </>
                        ) : (
                          <div className="text-center p-2">
                            <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                            <span className="text-[10px] text-muted-foreground">
                              Upload Photo
                            </span>
                          </div>
                        )}
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={handleDriverImageUpload}
                        />
                      </div>
                      {newDriver.image && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={removeDriverImage}
                          className="text-xs text-destructive h-6"
                        >
                          Remove Photo
                        </Button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Driver Name</Label>
                      <Input
                        placeholder="e.g., John Smith"
                        value={newDriver.name}
                        onChange={(e) =>
                          setNewDriver({ ...newDriver, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <Input
                        placeholder="e.g., john@example.com"
                        type="email"
                        value={newDriver.email}
                        onChange={(e) =>
                          setNewDriver({ ...newDriver, email: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>License Number</Label>
                      <Input
                        placeholder="e.g., KA-DL-123456"
                        value={newDriver.license}
                        onChange={(e) =>
                          setNewDriver({
                            ...newDriver,
                            license: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>NIC Number</Label>
                      <Input
                        placeholder="e.g., NIC123456789"
                        value={newDriver.nic}
                        onChange={(e) =>
                          setNewDriver({ ...newDriver, nic: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>License Issued Date</Label>
                        <Input
                          type="date"
                          value={newDriver.licenseIssuedDate}
                          onChange={(e) =>
                            setNewDriver({
                              ...newDriver,
                              licenseIssuedDate: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>License Expiry Date</Label>
                        <Input
                          type="date"
                          value={newDriver.licenseExpiryDate}
                          onChange={(e) =>
                            setNewDriver({
                              ...newDriver,
                              licenseExpiryDate: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Contact</Label>
                      <Input
                        placeholder="e.g., +91 98765 43210"
                        value={newDriver.contact}
                        onChange={(e) =>
                          setNewDriver({
                            ...newDriver,
                            contact: e.target.value,
                          })
                        }
                      />
                    </div>

                    <Button className="w-full" onClick={handleAddDriver}>
                      Add Driver
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog
                open={isEditDriverOpen}
                onOpenChange={setIsEditDriverOpen}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Driver Details</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Driver Name</Label>
                      <Input
                        value={editingDriver?.name || ''}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <Input
                        placeholder="e.g., john@example.com"
                        type="email"
                        value={editDriverForm.email}
                        onChange={(e) =>
                          setEditDriverForm({
                            ...editDriverForm,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Contact</Label>
                      <Input
                        placeholder="e.g., +91 98765 43210"
                        value={editDriverForm.contact}
                        onChange={(e) =>
                          setEditDriverForm({
                            ...editDriverForm,
                            contact: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>License Number</Label>
                      <Input
                        placeholder="e.g., KA-DL-123456"
                        value={editDriverForm.license}
                        onChange={(e) =>
                          setEditDriverForm({
                            ...editDriverForm,
                            license: e.target.value,
                          })
                        }
                      />
                    </div>
                    <Button className="w-full" onClick={handleUpdateDriver}>
                      Update Driver
                    </Button>
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
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
                              status.class
                            )}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleEditDriver(driver)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Vehicles;
