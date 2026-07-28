import { useState } from "react";

import { extractErrorMessages } from "../../api/errors";
import { createReview } from "../../api/reviews";
import Alert from "../ui/Alert";
import Button from "../ui/Button";
import StarRatingInput from "../ui/StarRatingInput";

export default function ReviewForm({ productId, onSuccess, onCancel }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (rating === 0) {
      setErrors(["Selecciona una calificación."]);
      return;
    }
    setErrors([]);
    setSubmitting(true);
    try {
      const review = await createReview(productId, { rating, comment });
      onSuccess(review);
    } catch (error) {
      setErrors(extractErrorMessages(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-2 flex flex-col gap-3 rounded-xl border border-border bg-surface-muted p-3"
    >
      {errors.map((message, index) => (
        <Alert key={`${index}-${message}`}>{message}</Alert>
      ))}

      <StarRatingInput value={rating} onChange={setRating} />

      <textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="Cuéntanos qué te pareció (opcional)"
        rows={3}
        className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
      />

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Enviando…" : "Enviar reseña"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
