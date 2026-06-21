import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Review {
  id: number;
  userName: string;
  rating: number;
  comment: string;
  reviewDate: string;
}

const Stars = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < Math.floor(rating)
            ? "fill-amber-400 text-amber-400"
            : "text-muted-foreground/20"
        }`}
      />
    ))}
  </div>
);

const ReviewsList = ({ hotelId }: { hotelId?: string }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    if (!hotelId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8080/api/reviews/hotel/${hotelId}`);
      if (!res.ok) throw new Error("Failed to fetch reviews");
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch reviews", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [hotelId]);

  const count = reviews.length;
  const avgRating =
    count > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / count).toFixed(1)
      : "0.0";

  // Calculate distribution
  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const starCount = reviews.filter((r) => Math.round(r.rating) === star).length;
    const percentage = count > 0 ? (starCount / count) * 100 : 0;
    return { star, count: starCount, percentage };
  });

  return (
    <section className="flex flex-col rounded-xl bg-card shadow-md p-6 h-full">
      <h2 className="text-lg font-semibold text-card-foreground mb-6">
        Guest Reviews
      </h2>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : count === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 text-muted-foreground mb-2">
            <Star className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            No reviews yet
          </p>
          <p className="text-xs text-muted-foreground">
            Guest reviews will appear here after stays.
          </p>
        </div>
      ) : (
        <div className="flex flex-col h-full min-h-0">
          {/* Summary Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-border">
            {/* Average Circle */}
            <div className="flex flex-col items-center justify-center border-r border-border/50">
              <div className="relative flex items-center justify-center">
                <svg className="h-32 w-32 -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-muted/20"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray={364.4}
                    strokeDashoffset={364.4 - (364.4 * Number(avgRating)) / 5}
                    strokeLinecap="round"
                    className="text-primary transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-bold text-foreground">
                    {avgRating}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Out of 5
                  </span>
                </div>
              </div>
              <p className="mt-4 text-sm font-medium text-muted-foreground">
                Based on {count} {count === 1 ? "review" : "reviews"}
              </p>
            </div>

            {/* Distribution Bars */}
            <div className="flex flex-col justify-center gap-2.5">
              {distribution.map((d) => (
                <div key={d.star} className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-muted-foreground w-3">
                    {d.star}
                  </span>
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${d.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right font-medium">
                    {Math.round(d.percentage)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* List Section */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="group relative">
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold ring-2 ring-background">
                      {(review.userName || "G")[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-sm font-bold text-foreground truncate">
                          {review.userName || "Guest"}
                        </p>
                        <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
                          {review.reviewDate}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Stars rating={review.rating} />
                      </div>
                      <p className="text-[13px] text-muted-foreground leading-relaxed italic">
                        "{review.comment}"
                      </p>
                      {review.imageUrls && review.imageUrls.length > 0 && (
                        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                          {review.imageUrls.map((url, i) => (
                            <img
                              key={i}
                              src={url}
                              alt="Review"
                              className="h-14 w-20 object-cover rounded-lg border border-border shadow-sm flex-shrink-0"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ReviewsList;
