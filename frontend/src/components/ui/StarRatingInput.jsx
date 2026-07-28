import { Star } from "lucide-react";
import { useState } from "react";

export default function StarRatingInput({ value, onChange, size = 22 }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1;
        return (
          <button
            key={starValue}
            type="button"
            onMouseEnter={() => setHovered(starValue)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(starValue)}
            aria-label={`Calificar con ${starValue} estrellas`}
          >
            <Star size={size} className={starValue <= display ? "fill-warning text-warning" : "text-border"} />
          </button>
        );
      })}
    </div>
  );
}
