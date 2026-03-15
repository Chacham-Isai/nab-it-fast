import { Star } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles?: { display_name: string | null; avatar_emoji: string | null } | null;
}

interface ReviewListProps {
  reviews: Review[];
}

export default function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) return null;

  return (
    <div className="space-y-2">
      {reviews.map((review) => (
        <div key={review.id} className="p-3 rounded-xl bg-secondary/30 border border-border">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-sm">{(review.profiles as any)?.avatar_emoji || "🐇"}</span>
              <span className="text-xs font-medium text-foreground">
                {(review.profiles as any)?.display_name || "Buyer"}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground">
              {new Date(review.created_at).toLocaleDateString()}
            </span>
          </div>
          <div className="flex gap-0.5 mb-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-3 h-3 ${
                  s <= review.rating ? "fill-primary text-primary" : "text-muted"
                }`}
              />
            ))}
          </div>
          {review.comment && (
            <p className="text-xs text-muted-foreground leading-relaxed">{review.comment}</p>
          )}
        </div>
      ))}
    </div>
  );
}
