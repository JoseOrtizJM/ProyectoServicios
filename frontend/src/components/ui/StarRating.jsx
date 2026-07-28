import { Star } from "lucide-react";

export default function StarRating({ rating = 0, size = 16 }) {
  const rounded = Math.round(rating || 0);
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} de 5 estrellas`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star key={index} size={size} className={index < rounded ? "fill-warning text-warning" : "text-border"} />
      ))}
    </div>
  );
}
