import { Trash2 } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert as RNAlert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { deleteReview, listAdminReviews } from "../../api/admin";
import { listProducts } from "../../api/catalog";
import { extractErrorMessages } from "../../api/errors";
import Alert from "../../components/ui/Alert";
import StarRating from "../../components/ui/StarRating";
import { useTheme } from "../../context/ThemeContext";
import { formatDate } from "../../utils/format";

export default function AdminReviewsScreen() {
  const { colors } = useTheme();
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [productFilter, setProductFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listProducts({ page_size: 50 })
      .then((data) => setProducts(data.results))
      .catch(() => {});
  }, []);

  function load() {
    setLoading(true);
    setError("");
    const params = { page_size: 50 };
    if (productFilter) params.product = productFilter;
    listAdminReviews(params)
      .then((data) => setReviews(data.results))
      .catch(() => setError("No se pudo cargar la lista de reseñas."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [productFilter]);

  function handleDelete(review) {
    RNAlert.alert("Eliminar reseña", "¿Eliminar esta reseña?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteReview(review.id);
            setReviews((prev) => prev.filter((item) => item.id !== review.id));
          } catch (err) {
            setError(extractErrorMessages(err)[0]);
          }
        },
      },
    ]);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, padding: 16, paddingBottom: 8 }}
        contentContainerStyle={{ gap: 8 }}
        data={[{ id: "", name: "Todos" }, ...products]}
        keyExtractor={(item) => item.id || "all"}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setProductFilter(item.id)}
            style={[
              styles.chip,
              {
                backgroundColor: productFilter === item.id ? colors.primary : colors.surfaceMuted,
                borderColor: productFilter === item.id ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={{ color: productFilter === item.id ? colors.primaryForeground : colors.foreground, fontSize: 12 }}
              numberOfLines={1}
            >
              {item.name}
            </Text>
          </Pressable>
        )}
      />

      {error ? <Alert>{error}</Alert> : null}

      {loading ? (
        <ActivityIndicator style={{ marginTop: 24 }} color={colors.primary} />
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item: review }) => (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: 13 }} numberOfLines={1}>
                    {review.product?.name}
                  </Text>
                  <Text style={{ color: colors.muted, fontSize: 11 }}>
                    {review.user?.name} · {formatDate(review.created_at)}
                  </Text>
                </View>
                <StarRating rating={review.rating} size={13} />
                <Pressable onPress={() => handleDelete(review)} hitSlop={8}>
                  <Trash2 size={16} color={colors.danger} />
                </Pressable>
              </View>
              {review.comment ? (
                <Text style={{ color: colors.muted, fontSize: 12, marginTop: 6 }}>{review.comment}</Text>
              ) : null}
            </View>
          )}
          ListEmptyComponent={
            <Text style={{ color: colors.muted, textAlign: "center", marginTop: 24 }}>No hay reseñas con ese filtro.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, maxWidth: 160 },
  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 10 },
  card: { borderWidth: 1, borderRadius: 14, padding: 12 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
});
