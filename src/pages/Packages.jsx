import { useState } from 'react';
import {
  Plus,
  Search,
  Edit,
  Eye,
  EyeOff,
  MapPin,
  Clock,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

import { Link } from 'react-router-dom';
import { packages } from '@/data/packages';

const Packages = () => {
  const [search, setSearch] = useState('');
  const [packagesList] = useState(packages);

  const filteredPackages = packagesList.filter(
    (pkg) =>
      pkg.name.toLowerCase().includes(search.toLowerCase()) ||
      pkg.destination.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout
      title="Travel Packages"
      subtitle="Create and manage your travel packages"
      showSearch={false}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search packages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-search w-full sm:w-80"
            />
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Package
          </Button>
        </div>

        {/* Packages Grid */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredPackages.map((pkg) => (
            <div
              key={pkg.id}
              className={cn(
                'group relative overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg',
                pkg.available ? 'border-border' : 'border-muted opacity-75'
              )}
            >
              {/* Package Image */}
              <div className="aspect-video w-full relative overflow-hidden bg-muted">
                {pkg.images && pkg.images.length > 0 ? (
                  <img
                    src={pkg.images[0]}
                    alt={pkg.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-primary via-primary to-accent/80 flex items-center justify-center">
                    <MapPin className="h-8 w-8 text-primary-foreground opacity-50" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <Link
                      to={`/packages/${pkg.id}`}
                      className="hover:underline"
                    >
                      <h3 className="font-semibold text-foreground">
                        {pkg.name}
                      </h3>
                    </Link>
                    <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {pkg.destination}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {pkg.available ? (
                      <Eye className="h-4 w-4 text-success" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                  {pkg.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {pkg.includes.slice(0, 3).map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                    >
                      {item}
                    </span>
                  ))}
                  {pkg.includes.length > 3 && (
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      +{pkg.includes.length - 3} more
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {pkg.duration}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {pkg.bookings} bookings
                    </p>
                    <p className="text-lg font-bold text-foreground">
                      ${pkg.price.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Packages;
