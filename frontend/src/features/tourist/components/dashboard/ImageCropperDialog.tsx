import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/common/ui/dialog";
import { Button } from "@/components/common/ui/button";
import { Slider } from "@/components/common/ui/slider";
import { Image as ImageIcon } from "lucide-react";

interface Area {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface ImageCropperDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    imageSrc: string;
    onCropSave: (croppedFile: File) => void;
    fileName: string;
}

export function ImageCropperDialog({
    open,
    onOpenChange,
    imageSrc,
    onCropSave,
    fileName,
}: ImageCropperDialogProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    // Create cropped image using canvas helper
    const handleSave = async () => {
        if (!croppedAreaPixels || !imageSrc) return;
        try {
            const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            const croppedFile = new File([croppedImageBlob], fileName, {
                type: "image/jpeg",
            });
            onCropSave(croppedFile);
            onOpenChange(false);
        } catch (e) {
            console.error("Error cropping image:", e);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] p-6 gap-6 overflow-hidden flex flex-col bg-background border border-border rounded-xl shadow-lg">
                <DialogHeader className="pb-2 border-b border-border">
                    <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-primary" /> Crop Image
                    </DialogTitle>
                </DialogHeader>

                {/* Cropping workspace */}
                <div className="relative w-full h-[320px] rounded-lg overflow-hidden bg-slate-100 dark:bg-muted border border-border">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                    />
                </div>

                {/* Zoom Control Slider */}
                <div className="flex items-center gap-4 py-2">
                    <ImageIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <Slider
                        value={[zoom]}
                        min={1}
                        max={3}
                        step={0.1}
                        aria-label="Zoom"
                        onValueChange={(val) => setZoom(val[0])}
                        className="flex-1"
                    />
                    <ImageIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                </div>

                <DialogFooter className="pt-4 border-t border-border flex justify-end gap-3">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="h-10 px-5">
                        Cancel
                    </Button>
                    <Button onClick={handleSave} className="gradient-ocean h-10 px-6 shadow-glow">
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/**
 * Helper function to crop the image using HTML5 Canvas
 */
async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
        throw new Error("No 2d context");
    }

    // Set canvas dimensions to matches cropped area
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Draw the cropped portion onto the canvas
    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error("Canvas is empty"));
                return;
            }
            resolve(blob);
        }, "image/jpeg", 0.95);
    });
}

function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener("load", () => resolve(image));
        image.addEventListener("error", (err) => reject(err));
        image.setAttribute("crossOrigin", "anonymous"); // Prevent CORS issues with Supabase URLs
        image.src = url;
    });
}
