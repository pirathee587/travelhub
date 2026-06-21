import { useState, useEffect } from 'react';
import { Plus, Search, Edit, MapPin, Clock, Star } from 'lucide-react';
import { DashboardLayout } from '@agent/components/dashboard/DashboardLayout';
import { Button } from '@agent/components/ui/button';
import { Input } from '@agent/components/ui/input';
import { cn } from '@agent/lib/utils';
import { Link } from 'react-router-dom';
import { CreatePackageModal } from '@agent/components/packages/CreatePackageModal';
import { toast } from 'sonner';

const BASE_URL = 'http://localhost:8082/api';

const Packages = () => {
  /* Package State Management */
  const [search, setSearch] = useState('');
  const [packagesList, setPackagesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);

  /* DATA FETCHING: Load all packages from the server */
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await fetch(`${BASE_URL}/packages`);
        const data = await res.json();
        setPackagesList(Array.isArray(data) ? data : []);
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
    (pkg.packageName || '').toLowerCase().includes(search.toLowerCase()) ||
    (pkg.destination || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (pkg) => {
    setEditingPkg(pkg);
    setShowCreateModal(true);
  };

  const handleSave = (updated) => {
    setPackagesList(prev =>
      prev.map(pkg => pkg.id === updated.id ? { ...pkg, ...updated } : pkg)
    );
    setEditingPkg(null);
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
          <p className="text-muted-foreground">Loading packages...</p>
        ) : filteredPackages.length === 0 ? (
          <p className="text-muted-foreground">No packages found.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredPackages.map((pkg) => (
              <div
                key={pkg.id}
                className={cn(
                  'group relative overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg',
                  (pkg.isActive !== false) ? 'border-border' : 'border-muted opacity-70'
                )}
              >
                {/* Package Image */}
                <div className="aspect-video w-full relative overflow-hidden bg-muted">
                  {pkg.imageUrl ? (
                    <img
                      src={pkg.imageUrl}
                      alt={pkg.packageName}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-primary via-primary to-accent/80 flex items-center justify-center">
                      <MapPin className="h-8 w-8 text-primary-foreground opacity-50" />
                    </div>
                  )}

                  {/* Active badge */}
                  <div className="absolute top-3 left-3">
                    <span className={cn(
                      'text-xs font-medium px-3 py-1 rounded-full border',
                      (pkg.isActive !== false)
                        ? 'bg-primary/15 text-primary border-primary/20'
                        : 'bg-muted/80 text-muted-foreground border-muted-foreground/20'
                    )}>
                      {(pkg.isActive !== false) ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Trending badge */}
                  {pkg.trending && (
                    <div className="absolute top-3 right-3">
                      <span className="text-xs font-medium px-3 py-1 rounded-full bg-warning/15 text-warning border border-warning/20">
                        Trending
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link to={`/agent/packages/${pkg.id}`} className="hover:underline">
                        <h3 className="font-semibold text-foreground truncate">
                          {pkg.packageName}
                        </h3>
                      </Link>
                      <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{pkg.destination}</span>
                      </div>
                    </div>

                    {/* Rating */}
                    {pkg.rating && (
                      <div className="flex items-center gap-1 shrink-0">
                        <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                        <span className="text-sm font-medium">{pkg.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  {/* Category & District */}
                  {(pkg.category || pkg.district) && (
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {pkg.category && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
                          {pkg.category}
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
                      <p className="text-xs text-muted-foreground">Price range</p>
                      <p className="text-base font-bold text-foreground">
                        ${(pkg.priceFrom ?? 0).toLocaleString()}
                        <span className="text-muted-foreground font-normal mx-1">–</span>
                        ${(pkg.priceTo ?? 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1"
                      onClick={() => handleEdit(pkg)}
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            ))}
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
      />
    </DashboardLayout>
  );
};

export default Packages;
