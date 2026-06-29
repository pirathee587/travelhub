import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useSWR from "swr";
import { Card, CardContent, CardHeader } from "@/components/common/ui/card";
import { Button } from "@/components/common/ui/button";
import { Badge } from "@/components/common/ui/badge";
import { Pencil, Trash2, Building2, Compass, Calendar, Star, Package, Hotel, MapPin } from "lucide-react";
import { cn } from "@/features/tourist/services/utils";
import { api } from "@/features/tourist/services/api";
import { useToast } from "@/hooks/use-toast";
import { defaultUserId } from "@/features/tourist/services/userHelpers";
import { EditReviewDialog } from "./EditReviewDialog";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";

export function MyReviewsSection() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const userId = defaultUserId();

    // State management for edit/delete operations
    const [editingReview, setEditingReview] = useState(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [deletingReview, setDeletingReview] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch user reviews
    const { data: reviews = [], mutate: mutateReviews, isLoading, error } = useSWR(
        userId ? `/api/reviews/user/${userId}` : null,
        () => userId ? api.getUserReviews(userId) : [],
        { revalidateOnFocus: false }
    );

    // Separate reviews into package and hotel reviews for easier display
    const packageReviews = useMemo(() => reviews.filter(r => r.packageId), [reviews]);
    const hotelReviews = useMemo(() => reviews.filter(r => r.hotelId), [reviews]);

    // Handle edit review
    const handleEditReview = useCallback((review) => {
        setEditingReview(review);
        setIsEditDialogOpen(true);
    }, []);

    // Handle edit success
    const handleEditSuccess = useCallback(() => {
        mutateReviews();
        setIsEditDialogOpen(false);
    }, [mutateReviews]);

    // Handle delete review
    const handleDeleteReview = useCallback((review) => {
        setDeletingReview(review);
        setIsDeleteDialogOpen(true);
    }, []);

    // Handle confirm delete
    const handleConfirmDelete = useCallback(async () => {
        if (!deletingReview?.id) return;

        setIsDeleting(true);
        try {
            await api.deleteReview(deletingReview.id, userId);
            toast({
                title: "Review deleted",
                description: "Your review has been successfully deleted.",
                variant: "default",
            });
            mutateReviews();
            setIsDeleteDialogOpen(false);
        } catch (error) {
            console.error("[DEBUG] Delete failed:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to delete review",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
        }
    }, [deletingReview, userId, mutateReviews, toast]);

    // Handle review card click - navigate to package/hotel details
    const handleReviewClick = useCallback((review) => {
        if (review.packageId) {
            navigate(`/tourist/explore/package/${review.packageId}`);
        } else if (review.hotelId) {
            navigate(`/tourist/hotels/${review.hotelId}`);
        }
    }, [navigate]);

    // Review card component
    const ReviewCard = ({ review, isPackage }) => (
        <Card
            className="border-border hover:border-primary/30 transition-all cursor-pointer group overflow-hidden"
            onClick={() => handleReviewClick(review)}
        >
            <CardContent className="p-4">
                {/* Header with type badge and rating */}
                <div className="flex items-start justify-between mb-3">
                    <Badge
                        variant="secondary"
                        className={cn(
                            "flex items-center gap-1",
                            isPackage ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                        )}
                    >
                        {isPackage ? (
                            <>
                                <Package className="h-3 w-3" />
                                Package
                            </>
                        ) : (
                            <>
                                <Hotel className="h-3 w-3" />
                                Hotel
                            </>
                        )}
                    </Badge>
                    <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={cn(
                                    "h-4 w-4",
                                    i < review.rating
                                        ? "fill-warning text-warning"
                                        : "text-muted-foreground/30"
                                )}
                            />
                        ))}
                    </div>
                </div>

                {/* Review title */}
                <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {review.title}
                </h3>

                {/* Review text */}
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {review.comment}
                </p>

                {/* Package/Hotel name and date */}
                <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        {isPackage ? (
                            <Compass className="h-4 w-4 text-primary flex-shrink-0" />
                        ) : (
                            <Building2 className="h-4 w-4 text-primary flex-shrink-0" />
                        )}
                        <span className="line-clamp-1 text-sm font-bold text-foreground">
                            {isPackage ? review.packageName : review.hotelName}
                        </span>
                    </div>
                    {review.district && (
                        <div className="flex items-center gap-2 text-muted-foreground text-xs">
                            <MapPin className="h-3.5 w-3.5  text-muted-foreground flex-shrink-0" />
                            <span className="font-bold">{review.district}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground text-xs">
                        <Calendar className="h-3 w-3 flex-shrink-0" />
                        <span>{review.reviewDate}</span>
                    </div>
                </div>

                {/* Review images */}
                {review.imageUrls && review.imageUrls.length > 0 && (
                    <div className="mb-3 grid grid-cols-3 gap-2">
                        {review.imageUrls.slice(0, 3).map((url, idx) => (
                            <div key={idx} className="aspect-square rounded-md overflow-hidden bg-muted">
                                <img
                                    src={url}
                                    alt={`review-${idx}`}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Action buttons */}
                <div
                    className="flex gap-2 pt-3 border-t"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-8 text-xs"
                        onClick={() => handleEditReview(review)}
                    >
                        <Pencil className="h-3 w-3 mr-1" /> Edit
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-8 text-xs text-destructive hover:text-destructive"
                        onClick={() => handleDeleteReview(review)}
                    >
                        <Trash2 className="h-3 w-3 mr-1" /> Delete
                    </Button>
                </div>
            </CardContent>
        </Card>
    );

    // Loading state
    if (isLoading) {
        return (
            <section className="space-y-4">
                <h3 className="text-xl font-bold">My Reviews</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="h-64 bg-muted animate-pulse" />
                    ))}
                </div>
            </section>
        );
    }

    // Error state
    if (error) {
        return (
            <section className="space-y-4">
                <h3 className="text-xl font-bold">My Reviews</h3>
                <Card className="p-6 bg-destructive/5 border-destructive/20">
                    <p className="text-sm text-destructive">Failed to load reviews. Please try again later.</p>
                </Card>
            </section>
        );
    }

    // Empty state
    if (!reviews || reviews.length === 0) {
        return (
            <section className="space-y-4">
                <h3 className="text-xl font-bold">My Reviews</h3>
                <Card className="p-8 text-center">
                    <p className="text-muted-foreground">You haven't posted any reviews yet.</p>
                    <p className="text-sm text-muted-foreground mt-2">
                        Share your experiences by posting reviews on packages and hotels!
                    </p>
                </Card>
            </section>
        );
    }

    // Main content with package and hotel reviews
    return (
        <section className="space-y-8">
            <h3 className="text-xl font-bold">My Reviews ({reviews.length})</h3>

            {/* Package Reviews */}
            {packageReviews.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-lg font-semibold flex items-center gap-2">
                        <Package className="h-5 w-5 text-blue-600" />
                        Package Reviews ({packageReviews.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {packageReviews.map((review) => (
                            <ReviewCard key={review.id} review={review} isPackage={true} />
                        ))}
                    </div>
                </div>
            )}

            {/* Hotel Reviews */}
            {hotelReviews.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-lg font-semibold flex items-center gap-2">
                        <Hotel className="h-5 w-5 text-purple-600" />
                        Hotel Reviews ({hotelReviews.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {hotelReviews.map((review) => (
                            <ReviewCard key={review.id} review={review} isPackage={false} />
                        ))}
                    </div>
                </div>
            )}

            {/* Edit Dialog */}
            {editingReview && (
                <EditReviewDialog
                    open={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                    review={editingReview}
                    targetName={
                        editingReview.packageId ? editingReview.packageName : editingReview.hotelName
                    }
                    onSuccess={handleEditSuccess}
                    isPackageReview={Boolean(editingReview.packageId)}
                />
            )}

            {/* Delete Confirmation Dialog */}
            {deletingReview && (
                <DeleteConfirmDialog
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                    onConfirm={handleConfirmDelete}
                    isDeleting={isDeleting}
                    reviewTitle={deletingReview.title}
                />
            )}
        </section>
    );
}
