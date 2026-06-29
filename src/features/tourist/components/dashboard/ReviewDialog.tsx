import { useState, useRef } from "react";
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
import { defaultUserId, defaultUserName } from "@/features/tourist/services/userHelpers";

export function ReviewDialog({ open, onOpenChange, targetName, showDriverRating, onSuccess, packageId, hotelId }) {
    const { toast } = useToast();
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [driverRating, setDriverRating] = useState(0);
    const [hoveredDriverRating, setHoveredDriverRating] = useState(0);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [images, setImages] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {               //Image Handling
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setImages((prev) => [...prev, ...newFiles]);
        }
    };

    const removeImage = (index) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) return;

        if (!packageId && !hotelId) {
            setErrorMessage("Unable to submit review: Package or Hotel ID is missing");
            return;
        }

        setSubmitting(true);
        setErrorMessage("");

        try {
            console.log("[DEBUG] Submitting review and images...");
                                                                    //Review Object creation
            const reviewData = {
                userId: defaultUserId(),
                userName: defaultUserName(),
                title: title,
                comment: description,
                rating: rating,
                // imageUrls is no longer needed here since backend will generate and attach them
            };

            if (packageId) {
                console.log("[DEBUG] Submitting package review to packageId:", packageId);
                await api.addPackageReview(packageId, reviewData, images);                  {/*Package Review API Connection*/}
                console.log("[DEBUG] ✅ Package review submitted successfully");
            } else if (hotelId) {
                console.log("[DEBUG] Submitting hotel review to hotelId:", hotelId);
                await api.addHotelReview(hotelId, reviewData, images);                      {/*Hotel Review API Connection*/}
                console.log("[DEBUG] ✅ Hotel review submitted successfully");
            }

            toast({
                title: "Review Submitted",
                description: `Your review for ${targetName} has been saved successfully!`,
                variant: "default",
            });

            console.log("[DEBUG] ✅ Review submission complete with", images.length, "images");

            onSuccess();
            resetForm();
            onOpenChange(false);
        } catch (error) {
            console.error("[DEBUG] ❌ Error during review submission:", error);
            const errorMsg = error.message || "Failed to submit review!";
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

    const resetForm = () => {
        setRating(0);
        setDriverRating(0);
        setTitle("");
        setDescription("");
        setImages([]);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Write a Review</DialogTitle>
                    <DialogDescription>
                        Share your experience for <strong>{targetName}</strong>
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    {errorMessage && (
                        <div className="flex gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-destructive">{errorMessage}</p>
                        </div>
                    )}
{/*Package or hotel Rating */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
{/*Driver Rating (Optional) */}
                        {showDriverRating && (
                            <div className="space-y-2 flex flex-col items-center py-2 bg-primary/5 rounded-xl border border-primary/20">
                                <Label className="text-sm font-semibold">Driver Rating</Label>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onMouseEnter={() => setHoveredDriverRating(star)}
                                            onMouseLeave={() => setHoveredDriverRating(0)}
                                            onClick={() => setDriverRating(star)}
                                            className="transition-transform hover:scale-110 focus:outline-none"
                                        >
                                            <Star
                                                className={cn(
                                                    "h-6 w-6 transition-colors",
                                                    (hoveredDriverRating || driverRating) >= star
                                                        ? "fill-primary text-primary"
                                                        : "text-muted-foreground/30"
                                                )}
                                            />
                                        </button>
                                    ))}
                                </div>
                                {driverRating === 0 && <p className="text-[10px] text-muted-foreground">Optional</p>}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="title">Review Title</Label>             {/* Review Title Input */}
                        <Input
                            id="title"
                            placeholder="e.g. Amazing experience!"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>        {/* Review Description Input */}
                        <Textarea
                            id="description"
                            placeholder="What made this trip special?"
                            className="min-h-[100px] resize-none"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-3">
                        <Label>Experience Images (Optional)</Label>
                        <div className="grid grid-cols-4 gap-2">
                            {images.map((file, index) => (
                                <div key={index} className="relative aspect-square rounded-md overflow-hidden bg-muted">
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={`upload-${index}`}
                                        className="h-full w-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1 right-1 bg-background/80 rounded-full p-0.5 hover:bg-destructive hover:text-white transition-colors"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="aspect-square flex flex-col items-center justify-center rounded-md border border-dashed border-muted-foreground/50 hover:border-primary hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary"
                            >
                                <Upload className="h-5 w-5 mb-1" />
                                <span className="text-[10px]">Upload</span>
                            </button>
                        </div>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}             
                        />                                  {/* image upload handle */}
                        {images.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                                {images.length} image(s) selected — will upload on submit
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={rating === 0 || submitting} className="gradient-ocean shadow-glow">
                            {submitting ? "Uploading & Submitting..." : "Submit Review"}                {/* Review Submit Button */}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}