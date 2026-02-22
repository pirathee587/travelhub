import { Star } from 'lucide-react';

const reviews = [
  {
    id: 'R001',
    customerName: 'Sarah Johnson',
    rating: 5,
    comment:
      'Amazing experience! The driver was professional and the vehicle was spotless. Highly recommend!',
    date: '2 days ago',
    trip: 'Bali, Indonesia',
  },
  {
    id: 'R002',
    customerName: 'Emma Wilson',
    rating: 5,
    comment:
      'Perfect holiday. Everything was arranged seamlessly. Will definitely book again!',
    date: '1 week ago',
    trip: 'Maldives',
  },
  {
    id: 'R003',
    customerName: 'Robert Taylor',
    rating: 4,
    comment:
      'Great service overall. Minor delay on pickup but the trip was wonderful.',
    date: '2 weeks ago',
    trip: 'Swiss Alps',
  },
];

export function ReviewCard() {
  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="rounded-xl border border-border bg-card p-5 transition-all hover:shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-semibold text-primary-foreground">
                {review.customerName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {review.customerName}
                </p>
                <p className="text-sm text-muted-foreground">{review.trip}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < review.rating
                      ? 'fill-warning text-warning'
                      : 'text-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-foreground/80">
            {review.comment}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">{review.date}</p>
        </div>
      ))}
    </div>
  );
}
