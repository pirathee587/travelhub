import { useState, useEffect } from 'react';
<<<<<<< HEAD
import { Plus, Search, Edit, MapPin, Clock, Star, Trash2, Eye, CheckCircle, X, PackagePlus, SearchX } from 'lucide-react';
=======
import { Plus, Search, Edit, MapPin, Clock, Star, Trash2, Eye, CheckCircle, X, AlertCircle } from 'lucide-react';
>>>>>>> origin/main
import { DashboardLayout } from '@/features/agency/components/dashboard/DashboardLayout';
import { Button } from '@/components/common/ui/button';
import { Input } from '@/components/common/ui/input';
import { cn } from '@/utils/utils';
import { Link } from 'react-router-dom';
import { CreatePackageModal } from '@/features/agency/components/packages/CreatePackageModal';
import { toast } from 'sonner';
import { api } from '@/features/agency/services/api';
import { Skeleton } from '@/components/common/ui/skeleton';
import { useCurrency } from '@/features/agency/hooks/CurrencyContext';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/common/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/common/ui/alert-dialog";

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080') + '/api';

const Packages = () => {
  const { formatPrice } = useCurrency();
  /* Package State Management */
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'single' | 'multi'>('all');
  const [packagesList, setPackagesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPkg, setEditingPkg] = useState<any>(null);

  /* DATA FETCHING: Load agent packages from the server */
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const data = await api.getAgentPackages();
        setPackagesList(Array.isArray(data) ? data : (data.data || []));
      } catch (error) {
        console.error('Failed to load packages:', error);
        toast.error('Failed to load packages');
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  // ── Helper: Determine if package is Multi-District ──────────
  const isMulti = (pkg: any) => {
    const type = (pkg.packageType || pkg.tourType || '').toString().toUpperCase();
    if (type === 'MULTI_DISTRICT' || pkg.isMultiDistrict === true) return true;
    if (Array.isArray(pkg.districts) && pkg.districts.length > 1) return true;
    if (typeof pkg.district === 'string' && (pkg.district.includes(',') || pkg.district.includes('&'))) return true;
    return false;
  };

  // ── Filter ─────────────────────────────────────────────────
  const filteredPackages = packagesList.filter(pkg => {
    const matchesSearch = (pkg.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (pkg.district || '').toLowerCase().includes(search.toLowerCase());

    const pkgIsMulti = isMulti(pkg);
    const matchesType = typeFilter === 'all'
      ? true
      : typeFilter === 'multi'
      ? pkgIsMulti
      : !pkgIsMulti;

    return matchesSearch && matchesType;
  });

  const handleEdit = async (pkg: any) => {
    try {
      const targetId = pkg.packageId || pkg.id;
      const result = await api.getAgentPackage(targetId);
      setEditingPkg(result);
      setShowCreateModal(true);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load package details');
    }
  };

  const handleSave = (updated: any) => {
    setPackagesList(prev =>
      prev.map(pkg => pkg.packageId === updated.packageId ? { ...pkg, ...updated } : pkg)
    );
    setEditingPkg(null);
  };

  const handleCreate = (newPkg: any) => {
    setPackagesList(prev => [newPkg, ...prev]);
  };

  const handleClose = () => {
    setShowCreateModal(false);
    setEditingPkg(null);
  };

  return (
    <DashboardLayout
      title="Travel Packages"
      subtitle="Create and manage your travel packages"
      showSearch={false}
    >
      <div className="space-y-6">
        {/* 1. HEADER SECTION: Search Bar and Create New Package Button */}
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search packages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-search w-full pl-9"
              />
            </div>

            {/* Top-Right Filter Dropdown */}
            <Select value={typeFilter} onValueChange={(val: any) => setTypeFilter(val)}>
              <SelectTrigger className="w-44 rounded-xl border-border bg-card">
                <SelectValue placeholder="All Package Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Packages</SelectItem>
                <SelectItem value="single">Single District</SelectItem>
                <SelectItem value="multi">Multi-District</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            id="create-package-btn"
            className="gap-2 shrink-0"
            onClick={() => { setEditingPkg(null); setShowCreateModal(true); }}
          >
            <Plus className="h-4 w-4" />
            Create Package
          </Button>
        </div>

        {/* 2. MAIN SECTION: Grid of Package Cards */}
        {/* Packages Grid */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-4">
                <Skeleton className="aspect-video w-full rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="flex justify-between items-center pt-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 flex-1" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
              {search ? <SearchX className="h-8 w-8 text-primary" /> : <PackagePlus className="h-8 w-8 text-primary" />}
            </div>
            <h3 className="text-xl font-bold text-foreground">
              {search ? 'No packages match your search' : 'No travel packages created yet'}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md">
              {search
                ? 'Try adjusting your search query or clear the filter.'
                : "Start building your agency's travel offerings! Add custom itineraries, set pricing, and start accepting tourist bookings."}
            </p>
            {search && (
              <div className="mt-6 flex gap-3">
                <Button variant="outline" onClick={() => setSearch('')} className="rounded-xl">
                  Clear Search
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredPackages.map((pkg) => {
              const displayImage = pkg.coverImageUrl || (pkg.images && pkg.images.length > 0 ? pkg.images[0].imageUrl : null);
              return (
                <div
                  key={pkg.packageId || pkg.id || Math.random()}
                  className={cn(
                    'group relative overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg',
                    (pkg.isActive !== false) ? 'border-border' : 'border-muted opacity-70'
                  )}
                >
                  {/* Package Image */}
                  <div className="aspect-video w-full relative overflow-hidden bg-muted">
                    {displayImage ? (
                      <img
                        src={displayImage}
                        alt={pkg.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-primary via-primary to-accent/80 flex items-center justify-center">
                        <MapPin className="h-8 w-8 text-primary-foreground opacity-50" />
                      </div>
                    )}

                    {/* Badges container */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2 items-start z-10">
                      {/* Active badge */}
                      <span className={cn(
                        'text-xs font-semibold px-3 py-0.5 rounded-full border shadow-sm backdrop-blur-md transition-all',
                        (pkg.isActive !== false)
                          ? 'bg-emerald-50/95 text-emerald-700 border-emerald-300/90 dark:bg-emerald-950/90 dark:text-emerald-300 dark:border-emerald-700/80'
                          : 'bg-slate-100/95 text-slate-700 border-slate-300/90 dark:bg-slate-900/90 dark:text-slate-300 dark:border-slate-700/80'
                      )}>
                        {(pkg.isActive !== false) ? 'Active' : 'Inactive'}
                      </span>

                      {/* Approval Status badge (Only show if not Approved) */}
                      {pkg.applicationStatus && pkg.applicationStatus.trim().toLowerCase() !== 'approved' && (
                        <span className={cn(
                          'text-xs font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1.5 border',
                          pkg.applicationStatus.trim().toLowerCase() === 'rejected'
                            ? 'bg-red-600 text-white border-red-500/50'
                            : 'bg-amber-500 text-slate-950 border-amber-400/50'
                        )}>
                          {pkg.applicationStatus.trim().toLowerCase() === 'rejected' ? <X className="h-3 w-3 text-white" /> :
                           <Clock className="h-3 w-3 text-slate-950" />}
                          {pkg.applicationStatus.trim().toLowerCase() === 'pending' ? 'Pending Approval' : pkg.applicationStatus.trim()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link to={`/agency/packages/${pkg.packageId || pkg.id}`} className="hover:underline">
                          <h3 className="font-semibold text-foreground truncate">
                            {pkg.name}
                          </h3>
                        </Link>
                        <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{pkg.district}</span>
                        </div>
                      </div>

                      {/* Rating & Review Count & District Badge */}
                      <div className="flex flex-col items-end shrink-0">
                        <div className="flex items-center gap-1">
                          <Star className={`h-3.5 w-3.5 ${pkg.rating ? 'fill-warning text-warning' : 'text-muted-foreground'}`} />
                          {pkg.rating ? (
                            <span className="text-sm font-medium">
                              {pkg.rating.toFixed(1)}
                              <span className="text-xs text-muted-foreground font-normal ml-1">({pkg.reviewCount ?? 0})</span>
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">No reviews yet</span>
                          )}
                        </div>
                        <span className="mt-1.5 inline-flex items-center rounded-full bg-sky-50 px-3 py-0.5 text-xs font-medium text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
                          {isMulti(pkg) ? 'Multi District' : 'Single District'}
                        </span>
                      </div>
                    </div>

                    {/* Admin Rejection / Suspension Reason */}
                    {pkg.rejectionReason && pkg.applicationStatus && pkg.applicationStatus.trim().toLowerCase() !== 'approved' && (
                      <div className="mt-3 p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-start gap-1.5 animate-fade-in">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">
                          <strong>Admin Feedback:</strong> {pkg.rejectionReason}
                        </span>
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {pkg.duration || '-'}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Starts from</p>
                        <p className="text-sm font-semibold text-foreground">
                          {formatPrice(pkg.basePriceAdult ?? 0)}
                        </p>
                      </div>
                    </div>

<<<<<<< HEAD
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" className="gap-1.5" asChild>
                      <Link to={`/agency/packages/${pkg.packageId || pkg.id}`}>
                        <Eye className="h-3.5 w-3.5" />
                        View Details
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20">
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure you want to delete this package?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the travel package and remove it from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={async () => {
                              try {
                                const targetId = pkg.packageId || pkg.id;
                                await api.deleteAgentPackage(targetId);
                                setPackagesList(prev => prev.filter(p => (p.packageId || p.id) !== targetId));
                                toast.success('Package deleted successfully');
                              } catch (err: any) {
                                console.error('Delete package error:', err);
                                toast.error(err.message || 'Failed to delete package');
                              }
                            }}
                          >
=======
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm" className="gap-1.5" asChild>
                        <Link to={`/agency/packages/${pkg.packageId}`}>
                          <Eye className="h-3.5 w-3.5" />
                          View Details
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20">
                            <Trash2 className="h-3.5 w-3.5" />
>>>>>>> origin/main
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure you want to delete this package?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the travel package and remove it from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={async () => {
                                try {
                                  await api.deleteAgentPackage(pkg.packageId);
                                  setPackagesList(prev => prev.filter(p => p.packageId !== pkg.packageId));
                                  toast.success('Package deleted successfully');
                                } catch (err) {
                                  console.error(err);
                                  toast.error('Failed to delete package');
                                }
                              }}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* --- POPUP MODAL: Form for Creating or Editing a Package --- */}
      {/* Create Package Modal */}
      <CreatePackageModal
        open={showCreateModal}
        onClose={handleClose}
        editData={editingPkg}
        onSave={handleSave}
        onCreate={handleCreate}
      />
    </DashboardLayout>
  );
};

export default Packages;
