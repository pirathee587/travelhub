import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/common/ui/dialog';
import { Button } from '@/components/common/ui/button';
import { AlertTriangle, Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import packageReportService from '@/services/packageReportService';

interface PackageReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: number | string;
  packageName: string;
  onSuccess?: () => void;
}

const CATEGORIES = [
  { value: 'FRAUD_OVERCHARGING', label: '🚨 Fraud / Overcharging' },
  { value: 'SAFETY_MISCONDUCT', label: '🛑 Safety & Misconduct' },
  { value: 'SERVICE_NOT_PROVIDED', label: '❌ Service Not Provided' },
  { value: 'PACKAGE_MISMATCH', label: '📦 Package Details Mismatch' },
  { value: 'HOTEL_MISMATCH', label: '🏨 Hotel Mismatch / Low Quality' },
  { value: 'VEHICLE_MISMATCH', label: '🚗 Vehicle / Driver Mismatch' },
  { value: 'OTHER', label: '📝 Other Complaints' },
];

export default function PackageReportDialog({
  open,
  onOpenChange,
  bookingId,
  packageName,
  onSuccess,
}: PackageReportDialogProps) {
  const [category, setCategory] = useState('FRAUD_OVERCHARGING');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newFiles = [...selectedFiles, ...filesArray];
      setSelectedFiles(newFiles);

      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    setPreviews(updatedPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please provide a short title for your report');
      return;
    }

    if (!description.trim()) {
      toast.error('Please describe the issue in detail');
      return;
    }

    setLoading(true);
    try {
      await packageReportService.createReport(
        bookingId,
        {
          category,
          title: title.trim(),
          description: description.trim(),
        },
        selectedFiles
      );

      toast.success('Report submitted successfully! Admin will investigate your claim.');
      onOpenChange(false);

      // Reset form
      setTitle('');
      setDescription('');
      setSelectedFiles([]);
      setPreviews([]);
      setCategory('FRAUD_OVERCHARGING');

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      const msg = err.message || err.response?.data?.message || 'Failed to submit report';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Report Issue - {packageName}
          </DialogTitle>
          <DialogDescription>
            Report fraudulent activity, misconduct, or service discrepancies for completed booking #{bookingId}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Category */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Category *</label>
            <select
              className="w-full p-2.5 border rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary/20 outline-none"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Short Title *</label>
            <input
              type="text"
              className="w-full p-2.5 border rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="e.g. Driver demanded extra cash / Hotel differed from package"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Detailed Description *</label>
            <textarea
              rows={4}
              className="w-full p-2.5 border rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary/20 outline-none resize-none"
              placeholder="Please provide full details of what happened, dates, locations, and involved parties..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Evidence Upload */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
              <span>Evidence / Screenshots (Optional)</span>
              <span className="text-xs text-muted-foreground">{selectedFiles.length} file(s) selected</span>
            </label>

            <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-4 text-center hover:bg-muted/50 transition-colors">
              <input
                type="file"
                id="evidence-upload"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <label
                htmlFor="evidence-upload"
                className="cursor-pointer flex flex-col items-center gap-1 text-xs text-muted-foreground font-medium"
              >
                <Upload className="h-6 w-6 text-primary mb-1" />
                <span>Click to upload evidence photos or screenshots</span>
                <span className="text-[10px] text-muted-foreground/70">JPG, PNG, WebP (Max 10MB each)</span>
              </label>
            </div>

            {/* Previews */}
            {previews.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {previews.map((src, index) => (
                  <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border bg-muted">
                    <img src={src} alt="Evidence preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="absolute top-1 right-1 bg-destructive text-white p-1 rounded-full shadow-md hover:bg-destructive/80 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-destructive hover:bg-destructive/90 text-white font-bold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting Report...
                </>
              ) : (
                'Submit Report'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
