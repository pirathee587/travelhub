import { useState, useEffect } from 'react';
import { Plus, Search, Edit, MapPin, Clock, Star, Trash2, Eye, CheckCircle, X } from 'lucide-react';
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

  // ── Filter ─────────────────────────────────────────────────
  const filteredPackages = packagesList.filter(pkg =>
    (pkg.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (pkg.district || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = async (pkg: any) => {
    try {
      const result = await api.getAgentPackage(pkg.packageId);
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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search packages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-search w-full sm:w-80 pl-9"
            />
          </div>
          <Button
            id="create-package-btn"
            className="gap-2"
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
          <p className="text-muted-foreground">No packages found.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredPackages.map((pkg) => {
              const displayImage = pkg.coverImageUrl || (pkg.images && pkg.images.length > 0 ? pkg.images[0].imageUrl : null);
              return (
              <div
                key={pkg.packageId || Math.random()}
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
                  <div className="absolute top-3 left-3 flex flex-col gap-2 items-start">
                    {/* Active badge */}
                    <span className={cn(
                      'text-xs font-medium px-3 py-1 rounded-full border shadow-sm',
                      (pkg.isActive !== false)
                        ? 'bg-primary/15 text-primary border-primary/20 backdrop-blur-sm'
                        : 'bg-muted/80 text-muted-foreground border-muted-foreground/20 backdrop-blur-sm'
                    )}>
                      {(pkg.isActive !== false) ? 'Active' : 'Inactive'}
                    </span>

                    {/* Approval Status badge (Only show if not Approved) */}
                    {pkg.applicationStatus && pkg.applicationStatus.trim().toLowerCase() !== 'approved' && (
                      <span className={cn(
                        'text-xs font-medium px-2 py-0.5 rounded border shadow-sm backdrop-blur-sm flex items-center gap-1',
                        pkg.applicationStatus.trim().toLowerCase() === 'rejected' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                        'bg-warning/10 text-warning-foreground border-warning/20'
                      )}>
                        {pkg.applicationStatus.trim().toLowerCase() === 'rejected' ? <X className="h-3 w-3" /> :
                         <Clock className="h-3 w-3" />}
                        {pkg.applicationStatus.trim().toLowerCase() === 'pending' ? 'Pending Approval' : pkg.applicationStatus.trim()}
                      </span>
                    )}
                  </div>

                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link to={`/agency/packages/${pkg.packageId}`} className="hover:underline">
                        <h3 className="font-semibold text-foreground truncate">
                          {pkg.name}
                        </h3>
                      </Link>
                      <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{pkg.district}</span>
                      </div>
                    </div>

                    {/* Rating & Review Count */}
                    <div className="flex items-center gap-1 shrink-0">
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
                  </div>

                  {/* Category & District */}
                  {(pkg.category || pkg.district) && (
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {pkg.category && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
                          {pkg.category.toLowerCase()}
                        </span>
                      )}
                      {pkg.district && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {pkg.district}
                        </span>
                      )}
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
            )})}
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
