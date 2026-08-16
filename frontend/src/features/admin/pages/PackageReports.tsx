import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  User,
  Package as PackageIcon,
  Building2,
  Calendar,
  Image as ImageIcon,
  Loader2,
  MessageSquare,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/common/ui/button';
import { Badge } from '@/components/common/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/common/ui/dialog';
import { toast } from 'sonner';
import packageReportService, { PackageReportResponseDto } from '@/services/packageReportService';

const STATUS_CONFIG: Record<string, { label: string; badgeClass: string; icon: any }> = {
  OPEN: {
    label: 'OPEN',
    badgeClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    icon: Clock,
  },
  UNDER_REVIEW: {
    label: 'UNDER REVIEW',
    badgeClass: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    icon: ShieldAlert,
  },
  RESOLVED: {
    label: 'RESOLVED',
    badgeClass: 'bg-green-500/10 text-green-600 border-green-500/20',
    icon: CheckCircle2,
  },
  REJECTED: {
    label: 'REJECTED',
    badgeClass: 'bg-destructive/10 text-destructive border-destructive/20',
    icon: XCircle,
  },
};

export default function PackageReports() {
  const [reports, setReports] = useState<PackageReportResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Detail Modal state
  const [selectedReport, setSelectedReport] = useState<PackageReportResponseDto | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [status, setStatus] = useState('OPEN');
  const [adminNotes, setAdminNotes] = useState('');
  const [resolution, setResolution] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await packageReportService.getAdminReports();
      setReports(data);
    } catch (err: any) {
      console.error('Failed to load admin reports:', err);
      toast.error('Failed to fetch reports list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleOpenDetail = (report: PackageReportResponseDto) => {
    setSelectedReport(report);
    setStatus(report.status || 'OPEN');
    setAdminNotes(report.adminNotes || '');
    setResolution(report.resolution || '');
    setDetailModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedReport) return;
    setUpdating(true);
    try {
      const updated = await packageReportService.updateAdminReportStatus(selectedReport.id, {
        status,
        adminNotes,
        resolution,
      });

      toast.success(`Report #${selectedReport.id} updated to ${status}`);
      setSelectedReport(updated);
      setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setDetailModalOpen(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update report status';
      toast.error(msg);
    } finally {
      setUpdating(false);
    }
  };

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.userName?.toLowerCase().includes(search.toLowerCase()) ||
      r.packageName?.toLowerCase().includes(search.toLowerCase()) ||
      r.agentName?.toLowerCase().includes(search.toLowerCase()) ||
      String(r.bookingId).includes(search) ||
      String(r.id).includes(search);

    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const openCount = reports.filter((r) => r.status === 'OPEN').length;
  const underReviewCount = reports.filter((r) => r.status === 'UNDER_REVIEW').length;
  const resolvedCount = reports.filter((r) => r.status === 'RESOLVED').length;
  const rejectedCount = reports.filter((r) => r.status === 'REJECTED').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            Package Reports & Disputes Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Investigate tourist claims against travel agencies, inspect evidence, add private notes, and issue official resolutions.
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setStatusFilter('OPEN')}
          className={`p-4 rounded-xl border bg-card cursor-pointer transition-all ${
            statusFilter === 'OPEN' ? 'ring-2 ring-yellow-500' : 'hover:border-yellow-500/50'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Open Reports</span>
            <Clock className="h-4 w-4 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-yellow-600 mt-2">{openCount}</p>
        </div>

        <div
          onClick={() => setStatusFilter('UNDER_REVIEW')}
          className={`p-4 rounded-xl border bg-card cursor-pointer transition-all ${
            statusFilter === 'UNDER_REVIEW' ? 'ring-2 ring-blue-500' : 'hover:border-blue-500/50'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Under Review</span>
            <ShieldAlert className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-2">{underReviewCount}</p>
        </div>

        <div
          onClick={() => setStatusFilter('RESOLVED')}
          className={`p-4 rounded-xl border bg-card cursor-pointer transition-all ${
            statusFilter === 'RESOLVED' ? 'ring-2 ring-green-500' : 'hover:border-green-500/50'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Resolved</span>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600 mt-2">{resolvedCount}</p>
        </div>

        <div
          onClick={() => setStatusFilter('REJECTED')}
          className={`p-4 rounded-xl border bg-card cursor-pointer transition-all ${
            statusFilter === 'REJECTED' ? 'ring-2 ring-gray-400' : 'hover:border-gray-400/50'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Rejected / Closed</span>
            <XCircle className="h-4 w-4 text-gray-500" />
          </div>
          <p className="text-2xl font-bold text-gray-600 mt-2">{rejectedCount}</p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-xl border">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by tourist, package, agency, booking #"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            className="p-2 border rounded-lg text-sm bg-background outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses ({reports.length})</option>
            <option value="OPEN">Open ({openCount})</option>
            <option value="UNDER_REVIEW">Under Review ({underReviewCount})</option>
            <option value="RESOLVED">Resolved ({resolvedCount})</option>
            <option value="REJECTED">Rejected ({rejectedCount})</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="text-center py-16 text-muted-foreground">Loading reports...</div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">No reports matching your criteria</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground border-b">
                <tr>
                  <th className="p-3.5 font-semibold">Report ID</th>
                  <th className="p-3.5 font-semibold">Tourist</th>
                  <th className="p-3.5 font-semibold">Package & Agency</th>
                  <th className="p-3.5 font-semibold">Category & Title</th>
                  <th className="p-3.5 font-semibold">Evidence</th>
                  <th className="p-3.5 font-semibold">Date</th>
                  <th className="p-3.5 font-semibold">Status</th>
                  <th className="p-3.5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredReports.map((report) => {
                  const statusInfo = STATUS_CONFIG[report.status] || STATUS_CONFIG.OPEN;
                  const IconComponent = statusInfo.icon;

                  return (
                    <tr key={report.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3.5 font-mono text-xs font-bold text-primary">#{report.id}</td>
                      <td className="p-3.5">
                        <p className="font-semibold text-foreground">{report.userName || 'Tourist'}</p>
                        <p className="text-xs text-muted-foreground">{report.userEmail}</p>
                      </td>
                      <td className="p-3.5">
                        <p className="font-medium text-foreground">{report.packageName}</p>
                        <p className="text-xs text-muted-foreground">
                          {report.agentName} (Booking #{report.bookingId})
                        </p>
                      </td>
                      <td className="p-3.5 max-w-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-destructive">
                          {report.category?.replace(/_/g, ' ')}
                        </span>
                        <p className="font-semibold text-foreground line-clamp-1">{report.title}</p>
                      </td>
                      <td className="p-3.5">
                        {report.evidenceUrls && report.evidenceUrls.length > 0 ? (
                          <Badge variant="outline" className="text-xs gap-1">
                            <ImageIcon className="h-3 w-3" />
                            {report.evidenceUrls.length} File(s)
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">None</span>
                        )}
                      </td>
                      <td className="p-3.5 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3.5">
                        <Badge className={`text-xs px-2.5 py-0.5 border ${statusInfo.badgeClass}`}>
                          <IconComponent className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1 font-semibold text-xs"
                          onClick={() => handleOpenDetail(report)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Investigate
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Admin Report Detail & Investigation Modal */}
      {selectedReport && (
        <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Investigate Report #{selectedReport.id}
              </DialogTitle>
              <DialogDescription>
                Review submitted evidence, add internal investigation notes, and communicate the resolution to the tourist.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-2">
              {/* Header Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3.5 bg-muted/40 rounded-xl border space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    Complainant (Tourist)
                  </span>
                  <p className="font-semibold text-sm">{selectedReport.userName}</p>
                  <p className="text-xs text-muted-foreground">{selectedReport.userEmail}</p>
                </div>

                <div className="p-3.5 bg-muted/40 rounded-xl border space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <PackageIcon className="h-3.5 w-3.5" />
                    Reported Package
                  </span>
                  <p className="font-semibold text-sm">{selectedReport.packageName}</p>
                  <p className="text-xs text-muted-foreground">Booking ID #{selectedReport.bookingId}</p>
                </div>

                <div className="p-3.5 bg-muted/40 rounded-xl border space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" />
                    Travel Agency (Agent)
                  </span>
                  <p className="font-semibold text-sm">{selectedReport.agentName}</p>
                  <p className="text-xs text-muted-foreground">{selectedReport.agentEmail || 'No email registered'}</p>
                </div>
              </div>

              {/* Claim Title & Category */}
              <div className="p-4 rounded-xl border bg-destructive/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-destructive uppercase tracking-wider">
                    {selectedReport.category?.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Submitted: {new Date(selectedReport.createdAt).toLocaleString()}
                  </span>
                </div>
                <h3 className="font-bold text-base">{selectedReport.title}</h3>
                <div className="p-3 rounded-lg bg-background border text-sm leading-relaxed whitespace-pre-wrap mt-2">
                  {selectedReport.description}
                </div>
              </div>

              {/* Evidence Gallery */}
              {selectedReport.evidenceUrls && selectedReport.evidenceUrls.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                    <ImageIcon className="h-4 w-4" />
                    Uploaded Evidence Photos ({selectedReport.evidenceUrls.length})
                  </h4>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {selectedReport.evidenceUrls.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative aspect-square rounded-xl overflow-hidden border bg-muted"
                      >
                        <img
                          src={url}
                          alt={`Evidence photo ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Action Form */}
              <div className="border-t pt-4 space-y-4">
                <h4 className="font-bold text-sm flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-primary" />
                  Admin Action & Resolution
                </h4>

                {/* Status Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Report Status</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatus(st)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                          status === st
                            ? 'bg-primary text-white border-primary shadow-sm'
                            : 'bg-background hover:bg-muted text-muted-foreground'
                        }`}
                      >
                        {st.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Admin Internal Notes */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Lock className="h-3.5 w-3.5 text-amber-500" />
                    Admin Internal Notes (Private — Admin Only)
                  </label>
                  <textarea
                    rows={3}
                    className="w-full p-2.5 border rounded-xl text-sm bg-amber-500/5 border-amber-500/20 focus:ring-2 focus:ring-amber-500/20 outline-none"
                    placeholder="Enter internal investigation notes (e.g. Contacted agency manager on 17 Aug, agency acknowledged booking mistake...)"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    🔒 These notes are strictly private to administrators and will NEVER be shown to tourists or agencies.
                  </p>
                </div>

                {/* Tourist Resolution Message */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5 text-green-600" />
                    Official Resolution Message (Public — Visible to Tourist)
                  </label>
                  <textarea
                    rows={3}
                    className="w-full p-2.5 border rounded-xl text-sm bg-green-500/5 border-green-500/20 focus:ring-2 focus:ring-green-500/20 outline-none"
                    placeholder="Enter the response/resolution message sent to the tourist (e.g. Your claim was investigated and verified. The agency has issued a refund of $50...)"
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setDetailModalOpen(false)}
                  disabled={updating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateStatus}
                  className="bg-primary hover:bg-primary/90 font-bold"
                  disabled={updating}
                >
                  {updating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    'Save Investigation & Resolution'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
