import { useState, useRef, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/common/ui/dialog";
import { Button } from "@/components/common/ui/button";
import { Input } from "@/components/common/ui/input";
import { Label } from "@/components/common/ui/label";
import { Textarea } from "@/components/common/ui/textarea";
import { Star, Upload, X, AlertCircle } from "lucide-react";
import { cn } from "@/features/tourist/services/utils";
import { api } from "@/features/tourist/services/api";
import { useToast } from "@/hooks/use-toast";
import { defaultUserId } from "@/features/tourist/services/userHelpers";

export function EditReviewDialog({ 
    open, 
    onOpenChange, 
    review, 
    targetName, 
    onSuccess, 
    isPackageReview = true 
}) {
    const { toast } = useToast();
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [existingImages, setExistingImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const fileInputRef = useRef(null);

    // Initialize form with existing review data when dialog opens
    useEffect(() => {
        if (open && review) {
            setRating(review.rating || 0);
            setTitle(review.title || "");
            setDescription(review.comment || "");
            setExistingImages(review.imageUrls || []);
            setNewImages([]);
            setErrorMessage("");
        }
    }, [open, review]);

    const handleFileChange = (e) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setNewImages((prev) => [...prev, ...newFiles]);
        }
    };

    const removeExistingImage = (index) => {
        setExistingImages((prev) => prev.filter((_, i) => i !== index));
    };

    const removeNewImage = (index) => {
        setNewImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) return;

        if (!review?.id) {
            setErrorMessage("Unable to update review: Review ID is missing");
            return;
        }

        setSubmitting(true);
        setErrorMessage("");

        try {
            console.log("[DEBUG] Updating review...");

            const reviewData = {
                userId: defaultUserId(),
                title: title,
                comment: description,
                rating: rating,
            };

            // Use the appropriate API method
            if (isPackageReview) {
                console.log("[DEBUG] Updating package review ID:", review.id);
                await api.updatePackageReview(review.id, defaultUserId(), reviewData, newImages);
                console.log("[DEBUG] ✅ Package review updated successfully");
            } else {
                console.log("[DEBUG] Updating hotel review ID:", review.id);
                await api.updateHotelReview(review.id, defaultUserId(), reviewData, newImages);
                console.log("[DEBUG] ✅ Hotel review updated successfully");
            }

            toast({
                title: "Review Updated",
                description: `Your review for ${targetName} has been updated successfully!`,
                variant: "default",
            });

            console.log("[DEBUG] ✅ Review update complete");

            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error("[DEBUG] ❌ Error during review update:", error);
            const errorMsg = error.message || "Failed to update review!";
            setErrorMessage(errorMsg);
            toast({
                title: "Error",
                description: errorMsg,
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (!review) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Review</DialogTitle>
                    <DialogDescription>
                        Update your review for <strong>{targetName}</strong>
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    {errorMessage && (
                        <div className="flex gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-destructive">{errorMessage}</p>
                        </div>
                    )}

                    {/* Rating */}
                    <div className="space-y-2 flex flex-col items-center py-2 bg-accent/5 rounded-xl border border-border/50">
                        <Label className="text-sm font-semibold">Overall Rating</Label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    onClick={() => setRating(star)}
                                    className="transition-transform hover:scale-110 focus:outline-none"
                                >
                                    <Star
                                        className={cn(
                                            "h-6 w-6 transition-colors",
                                            (hoveredRating || rating) >= star
                                                ? "fill-warning text-warning"
                                                : "text-muted-foreground/30"
                                        )}
                                    />
                                </button>
                            ))}
                        </div>
                        {rating === 0 && <p className="text-[10px] text-destructive">Required</p>}
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Review Title</Label>
                        <Input
                            id="title"
                            placeholder="e.g. Amazing experience!"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="What made this trip special?"
                            className="min-h-[100px] resize-none"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>

                    {/* Existing Images */}
                    {existingImages.length > 0 && (
                        <div className="space-y-3">
                            <Label>Current Images</Label>
                            <div className="grid grid-cols-4 gap-2">
                                {existingImages.map((url, index) => (
                                    <div key={index} className="relative aspect-square rounded-md overflow-hidden bg-muted">
                                        <img
                                            src={url}
                                            alt={`existing-${index}`}
                                            className="h-full w-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeExistingImage(index)}
                                            className="absolute top-1 right-1 bg-black/50 hover:bg-black/80 rounded-full p-1 transition-colors"
                                        >
                                            <X className="h-3 w-3 text-white" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* New Images Upload */}
                    <div className="space-y-3">
                        <Label>Add New Images (Optional)</Label>
                        <div className="grid grid-cols-4 gap-2">
                            {newImages.map((file, index) => (
                                <div key={index} className="relative aspect-square rounded-md overflow-hidden bg-muted">
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={`new-upload-${index}`}
                                        className="h-full w-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeNewImage(index)}
                                        className="absolute top-1 right-1 bg-black/50 hover:bg-black/80 rounded-full p-1 transition-colors"
                                    >
                                        <X className="h-3 w-3 text-white" />
                                    </button>
                                </div>
                            ))}
                            {newImages.length < 4 && (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-square rounded-md border-2 border-dashed border-border hover:border-primary transition-colors flex items-center justify-center hover:bg-primary/5"
                                >
                                    <Upload className="h-5 w-5 text-muted-foreground" />
                                </button>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={submitting || rating === 0}
                            className="gradient-sunset"
                        >
                            {submitting ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
