import { Star } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Review {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  text: string;
  date: string;
}

const reviews: Review[] = [
  {
    id: 1,
    name: "Sarah Mitchell",
    avatar: "SM",
    rating: 5,
    text: "Absolutely stunning property. The room was impeccable and the staff went above and beyond.",
    date: "2 days ago",
  },
  {
    id: 2,
    name: "James Cooper",
    avatar: "JC",
    rating: 4,
    text: "Great location and beautiful interiors. The spa was a highlight of our stay.",
    date: "5 days ago",
  },
  {
    id: 3,
    name: "Aisha Patel",
    avatar: "AP",
    rating: 5,
    text: "One of the best hotel experiences I've had. Will definitely return!",
    date: "1 week ago",
  },
  {
    id: 4,
    name: "Daniel Kim",
    avatar: "DK",
    rating: 4,
    text: "Smooth check-in, clean rooms, and great Wi‑Fi. Breakfast could have more variety.",
    date: "1 week ago",
  },
  {
    id: 5,
    name: "Maria Garcia",
    avatar: "MG",
    rating: 5,
    text: "Loved the rooftop pool and the view. Staff was friendly and very helpful.",
    date: "2 weeks ago",
  },
  {
    id: 6,
    name: "Omar Hassan",
    avatar: "OH",
    rating: 4,
    text: "Excellent location near restaurants. Rooms were quiet and comfortable.",
    date: "2 weeks ago",
  },
  {
    id: 7,
    name: "Priya Sharma",
    avatar: "PS",
    rating: 5,
    text: "The spa service was amazing and the gym was well equipped. Highly recommended.",
    date: "3 weeks ago",
  },
  {
    id: 8,
    name: "Leo Thompson",
    avatar: "LT",
    rating: 3,
    text: "Nice property, but the corridor was a bit noisy at night. Overall good experience.",
    date: "3 weeks ago",
  },
  {
    id: 9,
    name: "Nina Williams",
    avatar: "NW",
    rating: 5,
    text: "Perfect weekend getaway. Clean, modern, and great service throughout the stay.",
    date: "1 month ago",
  },
  {
    id: 10,
    name: "Chen Wei",
    avatar: "CW",
    rating: 4,
    text: "Great value for the price. The room was spacious and the bed was very comfortable.",
    date: "1 month ago",
  },
  {
    id: 11,
    name: "Fatima Noor",
    avatar: "FN",
    rating: 5,
    text: "Loved the late checkout option and the overall ambience. Would stay again!",
    date: "1 month ago",
  },
];

const Stars = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-3.5 w-3.5 ${i < rating ? "fill-star text-star" : "text-muted"}`}
      />
    ))}
  </div>
);

  const ReviewsList = ({ hotelId }: { hotelId?: string }) => {
  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <section className="rounded-lg bg-card shadow-card p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-card-foreground">Guest Reviews</h2>
        <div className="flex items-center gap-1.5">
          <Star className="h-4 w-4 fill-star text-star" />
          <span className="text-sm font-bold text-card-foreground">{avgRating}</span>
          <span className="text-xs text-muted-foreground">/ 5</span>
        </div>
      </div>

      <ScrollArea className="h-96 pr-3">
        <div className="grid gap-4">
          {reviews.map((review) => (
            <div key={review.id} className="flex gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                {review.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-card-foreground">{review.name}</p>
                  <span className="text-xs text-muted-foreground">{review.date}</span>
                </div>
                <Stars rating={review.rating} />
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{review.text}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </section>
  );
};

export default ReviewsList;
