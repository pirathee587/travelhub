import { useState, useEffect } from 'react';
import { Plus, Search, Edit, MapPin, Clock, Star, Trash2, Eye, CheckCircle, X, PackagePlus, SearchX, AlertCircle, Pencil } from 'lucide-react';
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
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
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

  // ── Counts ─────────────────────────────────────────────────
  const approvedCount = packagesList.filter(p => (p.applicationStatus || 'Approved').trim().toLowerCase() === 'approved').length;
  const pendingCount = packagesList.filter(p => (p.applicationStatus || '').trim().toLowerCase() === 'pending').length;
  const rejectedCount = packagesList.filter(p => ['rejected', 'suspended'].includes((p.applicationStatus || '').trim().toLowerCase())).length;

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

    const appStatus = (pkg.applicationStatus || 'Approved').trim().toLowerCase();
    let matchesStatus = true;
    if (statusFilter === 'approved') {
      matchesStatus = appStatus === 'approved';
    } else if (statusFilter === 'pending') {
      matchesStatus = appStatus === 'pending';
    } else if (statusFilter === 'rejected') {
      matchesStatus = ['rejected', 'suspended'].includes(appStatus);
    }

    return matchesSearch && matchesType && matchesStatus;
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
        {/* Status Sub-Tab Navigation Bar & Search Controls */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-1 rounded-xl bg-muted/60 p-1.5 border border-border/60 self-start">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={cn(
                'px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2',
                statusFilter === 'all'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              All Packages
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted font-normal text-muted-foreground">
                {packagesList.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('approved')}
              className={cn(
                'px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2',
                statusFilter === 'approved'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Approved
              {approvedCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-medium">
                  {approvedCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('pending')}
              className={cn(
                'px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2',
                statusFilter === 'pending'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Pending
              {pendingCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-medium">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('rejected')}
              className={cn(
                'px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2',
                statusFilter === 'rejected'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Needs Action
              {rejectedCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-medium">
                  {rejectedCount}
                </span>
              )}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search packages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-search w-full pl-9"
              />
            </div>

            {/* Top-Right District Type Filter Dropdown */}
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

            <Button
              id="create-package-btn"
              className="gap-2 shrink-0"
              onClick={() => { setEditingPkg(null); setShowCreateModal(true); }}
            >
              <Plus className="h-4 w-4" />
              Create Package
            </Button>
          </div>
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
              {search ? 'No packages match your search' :
               statusFilter === 'approved' && pendingCount > 0 ? 'No approved packages yet' :
               statusFilter === 'approved' && rejectedCount > 0 ? 'No approved packages yet' :
               statusFilter === 'pending' ? 'No packages pending approval' :
               statusFilter === 'rejected' ? 'No rejected or suspended packages' :
               'No travel packages created yet'}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md">
              {search
                ? 'Try adjusting your search query or clear the filter.'
                : statusFilter === 'approved' && pendingCount > 0
                ? 'You have submitted packages currently awaiting admin verification approval.'
                : statusFilter === 'approved' && rejectedCount > 0
                ? 'You have packages requiring update & re-submission.'
                : statusFilter === 'pending'
                ? 'All your submitted packages have been processed by admin.'
                : statusFilter === 'rejected'
                ? 'All your travel packages are currently in good standing.'
                : "Start building your agency's travel offerings! Add custom itineraries, set pricing, and start accepting tourist bookings."}
            </p>
            {statusFilter === 'approved' && pendingCount > 0 && (
              <Button
                variant="outline"
                className="mt-6 gap-2 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-950"
                onClick={() => setStatusFilter('pending')}
              >
                <Clock className="h-4 w-4" /> View Pending Packages ({pendingCount})
              </Button>
            )}
            {statusFilter === 'approved' && pendingCount === 0 && rejectedCount > 0 && (
              <Button
                variant="outline"
                className="mt-6 gap-2 border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950"
                onClick={() => setStatusFilter('rejected')}
              >
                <AlertCircle className="h-4 w-4" /> View Packages Needing Action ({rejectedCount})
              </Button>
            )}
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
                      <div className="mt-3 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-center justify-between gap-2 shadow-sm animate-fade-in">
                        <div className="flex items-start gap-1.5 min-w-0">
                          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                          <span className="leading-snug truncate">
                            <strong>Admin Feedback:</strong> {pkg.rejectionReason}
                          </span>
                        </div>
                        {['rejected', 'suspended'].includes(pkg.applicationStatus.trim().toLowerCase()) && (
                          <Link
                            to={`/agency/packages/${pkg.packageId || pkg.id}`}
                            className="shrink-0 font-semibold text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 hover:underline flex items-center gap-0.5 text-[11px]"
                          >
                            Review & Fix →
                          </Link>
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
