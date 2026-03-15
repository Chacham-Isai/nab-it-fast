import { useState } from "react";
import { Star, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ReviewFormProps {
  orderId: string;
  sellerId: string;
  reviewerId: string;
  onSubmitted: () => void;
}

export default function ReviewForm({ orderId, sellerId, reviewerId, onSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({ title: "Please select a rating", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      order_id: orderId,
      seller_id: sellerId,
      reviewer_id: reviewerId,
      rating,
      comment: comment.trim() || null,
    });
    if (error) {
      toast({ title: "Error submitting review", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "⭐ Review submitted!", description: "Thanks for your feedback." });
      onSubmitted();
    }
    setSubmitting(false);
  };

  return (
    <div className="mt-3 p-3 rounded-xl bg-secondary/30 border border-border space-y-2.5">
      <p className="text-xs font-medium text-foreground">Rate this seller</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            onMouseEnter={() => setHovered(s)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setRating(s)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`w-6 h-6 transition-colors ${
                s <= (hovered || rating)
                  ? "fill-primary text-primary"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
        {rating > 0 && (
          <span className="text-xs text-muted-foreground ml-2 self-center">
            {["", "Poor", "Fair", "Good", "Great", "Excellent"][rating]}
          </span>
        )}
      </div>
      <textarea
        placeholder="Leave a comment (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full bg-secondary/50 border border-border rounded-lg p-2 text-xs text-foreground placeholder:text-muted-foreground min-h-[60px] resize-none focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <Button
        size="sm"
        className="rounded-xl w-full text-xs gap-1"
        onClick={handleSubmit}
        disabled={submitting || rating === 0}
      >
        {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
        Submit Review
      </Button>
    </div>
  );
}
