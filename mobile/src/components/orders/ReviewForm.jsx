import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";

import { extractErrorMessages } from "../../api/errors";
import { createReview } from "../../api/reviews";
import { useTheme } from "../../context/ThemeContext";
import Alert from "../ui/Alert";
import Button from "../ui/Button";
import StarRatingInput from "../ui/StarRatingInput";

export default function ReviewForm({ productId, onSuccess, onCancel }) {
  const { colors } = useTheme();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
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
    <View style={[styles.container, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
      {errors.map((message, index) => (
        <Alert key={`${index}-${message}`}>{message}</Alert>
      ))}

      <StarRatingInput value={rating} onChange={setRating} />

      <TextInput
        value={comment}
        onChangeText={setComment}
        placeholder="Cuéntanos qué te pareció (opcional)"
        placeholderTextColor={colors.muted}
        multiline
        numberOfLines={3}
        style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
      />

      <View style={styles.actions}>
        <View style={{ flex: 1 }}>
          <Button title={submitting ? "Enviando…" : "Enviar reseña"} onPress={handleSubmit} loading={submitting} />
        </View>
        <View style={{ flex: 1 }}>
          <Button title="Cancelar" variant="outline" onPress={onCancel} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderWidth: 1, borderRadius: 14, padding: 12, gap: 10, marginTop: 8 },
  input: { borderWidth: 1, borderRadius: 10, padding: 10, fontSize: 13, textAlignVertical: "top", minHeight: 70 },
  actions: { flexDirection: "row", gap: 10 },
});
