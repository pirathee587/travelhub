import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/features/tourist/components/dashboard/DashboardLayout';
import { AlertTriangle, Clock, CheckCircle2, XCircle, Search, ShieldAlert, FileText, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/common/ui/button';
import { Badge } from '@/components/common/ui/badge';
import packageReportService, { PackageReportResponseDto } from '@/services/packageReportService';

const STATUS_CONFIG: Record<string, { label: string; badgeClass: string; icon: any }> = {
  OPEN: {
    label: 'Open',
    badgeClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    icon: Clock,
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    badgeClass: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    icon: ShieldAlert,
  },
  RESOLVED: {
    label: 'Resolved',
    badgeClass: 'bg-green-500/10 text-green-600 border-green-500/20',
    icon: CheckCircle2,
  },
  REJECTED: {
    label: 'Reviewed / Closed',
    badgeClass: 'bg-muted text-muted-foreground border-border',
    icon: XCircle,
  },
};

export default function MyReports() {
  const [reports, setReports] = useState<PackageReportResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedReport, setSelectedReport] = useState<PackageReportResponseDto | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await packageReportService.getTouristReports();
      setReports(data);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = reports.filter(
    (r) =>
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.packageName?.toLowerCase().includes(search.toLowerCase()) ||
      r.category?.toLowerCase().includes(search.toLowerCase()) ||
      String(r.bookingId).includes(search)
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              My Reports & Disputes
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track the investigation status of your reported issues and resolutions.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search reports or booking #"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm bg-background focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-16 text-muted-foreground">Loading your reports...</div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-16 bg-card border rounded-2xl p-8 space-y-3">
            <ShieldAlert className="h-12 w-12 text-muted-foreground/50 mx-auto" />
            <h3 className="text-lg font-semibold">No Reports Found</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              You have not submitted any reports yet. If you face any issues with completed trips, you can submit a report from your completed trip cards.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* List View */}
            <div className="lg:col-span-1 space-y-3">
              {filteredReports.map((report) => {
                const statusInfo = STATUS_CONFIG[report.status] || STATUS_CONFIG.OPEN;
                const IconComponent = statusInfo.icon;
                const isSelected = selectedReport?.id === report.id;

                return (
                  <div
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className={`p-4 border rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'bg-card hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Badge className={`text-xs px-2.5 py-0.5 border ${statusInfo.badgeClass}`}>
                        <IconComponent className="h-3 w-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="font-semibold text-sm line-clamp-1">{report.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {report.packageName} (Booking #{report.bookingId})
                    </p>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t text-xs text-muted-foreground">
                      <span className="font-medium text-destructive">{report.category?.replace(/_/g, ' ')}</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Details View */}
            <div className="lg:col-span-2">
              {selectedReport ? (
                <div className="bg-card border rounded-2xl p-6 space-y-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b">
                    <div>
                      <span className="text-xs font-semibold text-destructive uppercase tracking-wider">
                        {selectedReport.category?.replace(/_/g, ' ')}
                      </span>
                      <h2 className="text-xl font-bold mt-1">{selectedReport.title}</h2>
                      <p className="text-xs text-muted-foreground mt-1">
                        Report ID: #{selectedReport.id} • Booking #{selectedReport.bookingId} • Submitted on{' '}
                        {new Date(selectedReport.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <Badge className={`self-start sm:self-center text-xs px-3 py-1 border ${STATUS_CONFIG[selectedReport.status]?.badgeClass}`}>
                      {STATUS_CONFIG[selectedReport.status]?.label}
                    </Badge>
                  </div>

                  {/* Details Breakdown */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs bg-muted/40 p-4 rounded-xl border">
                    <div>
                      <span className="text-muted-foreground">Package</span>
                      <p className="font-semibold text-sm mt-0.5">{selectedReport.packageName || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Travel Agency</span>
                      <p className="font-semibold text-sm mt-0.5">{selectedReport.agentName || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Location</span>
                      <p className="font-semibold text-sm mt-0.5">{selectedReport.packageLocation || 'Sri Lanka'}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase">Issue Description</h4>
                    <div className="p-4 rounded-xl bg-muted/30 border text-sm leading-relaxed whitespace-pre-wrap">
                      {selectedReport.description}
                    </div>
                  </div>

                  {/* Evidence Images */}
                  {selectedReport.evidenceUrls && selectedReport.evidenceUrls.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                        <ImageIcon className="h-3.5 w-3.5" />
                        Submitted Evidence ({selectedReport.evidenceUrls.length})
                      </h4>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {selectedReport.evidenceUrls.map((url, i) => (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative aspect-square rounded-xl overflow-hidden border bg-muted"
                          >
                            <img src={url} alt={`Evidence ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resolution Response from Admin */}
                  {selectedReport.resolution ? (
                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 space-y-2">
                      <div className="flex items-center gap-2 text-green-700 font-bold text-sm">
                        <CheckCircle2 className="h-4 w-4" />
                        Official Resolution Response
                      </div>
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        {selectedReport.resolution}
                      </p>
                      {selectedReport.resolvedAt && (
                        <p className="text-xs text-muted-foreground pt-1">
                          Resolved on {new Date(selectedReport.resolvedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/15 text-xs text-blue-700 space-y-1">
                      <p className="font-semibold">Investigation in progress</p>
                      <p className="text-muted-foreground">
                        Our Trust & Safety admin team is reviewing your report. Once an official resolution is posted, it will appear here.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-card border rounded-2xl p-12 text-center text-muted-foreground">
                  Select a report from the list to view details
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
