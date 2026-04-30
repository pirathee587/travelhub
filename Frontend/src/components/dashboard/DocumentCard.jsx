import { FileText, Download, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const typeConfig = {
    invoice: {
        color: "text-primary bg-primary/10",
        label: "Invoice",
    },
    receipt: {
        color: "text-success bg-success/10",
        label: "Receipt",
    },
    itinerary: {
        color: "text-accent bg-accent/10",
        label: "Itinerary",
    },
    confirmation: {
        color: "text-warning bg-warning/10",
        label: "Confirmation",
    },
};

export function DocumentCard({ title, type, date, size, onDownload }) {
    const [downloaded, setDownloaded] = useState(false);
    const config = typeConfig[type];

    const handleDownload = () => {
        setDownloaded(true);
        onDownload?.();
        setTimeout(() => setDownloaded(false), 2000);
    };

    return (
        <div className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border hover:shadow-soft transition-all">
            <div className={cn("rounded-lg p-3", config.color)}>
                <FileText className="h-5 w-5" />
            </div>

            <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground truncate">{title}</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{config.label}</span>
                    <span>•</span>
                    <span>{date}</span>
                    <span>•</span>
                    <span>{size}</span>
                </div>
            </div>

            <Button
                size="sm"
                variant={downloaded ? "default" : "outline"}
                onClick={handleDownload}
                className={cn(
                    "transition-all",
                    downloaded && "bg-success hover:bg-success text-success-foreground"
                )}
            >
                {downloaded ? (
                    <>
                        <Check className="h-4 w-4 mr-1" />
                        Downloaded
                    </>
                ) : (
                    <>
                        <Download className="h-4 w-4 mr-1" />
                        Download
                    </>
                )}
            </Button>
        </div>
    );
}
