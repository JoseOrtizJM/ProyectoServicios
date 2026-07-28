import { ImageOff } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from "react-native";

import { getProduct } from "../api/catalog";
import { listProductReviews } from "../api/reviews";
import StarRating from "../components/ui/StarRating";
import { useTheme } from "../context/ThemeContext";
import { formatCurrency, formatDate } from "../utils/format";

export default function ProductDetailScreen({ route, navigation }) {
  const { productId } = route.params;
  const { colors } = useTheme();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ average_rating: null, total_reviews: 0 });
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    getProduct(productId)
      .then((data) => {
        setProduct(data);
        navigation.setOptions({ title: data.name });
      })
      .catch((error) => {
        if (error?.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [productId, navigation]);

  useEffect(() => {
    setReviewsLoading(true);
    listProductReviews(productId, { page_size: 20 })
      .then((data) => {
        setReviews(data.results);
        setSummary(data.summary);
      })
      .catch(() => {})
      .finally(() => setReviewsLoading(false));
  }, [productId]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (notFound || !product) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground, fontWeight: "600" }}>Producto no encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.scroll}>
      <View style={[styles.imageWrapper, { backgroundColor: colors.surfaceMuted }]}>
        {product.image_url ? (
          <Image source={{ uri: product.image_url }} style={styles.image} resizeMode="cover" />
        ) : (
          <ImageOff size={48} color={colors.muted} />
        )}
      </View>

      <View style={styles.content}>
        <Text style={[styles.meta, { color: colors.muted }]}>
          {[product.category?.name, product.brand?.name].filter(Boolean).join(" · ")}
        </Text>
        <Text style={[styles.name, { color: colors.foreground }]}>{product.name}</Text>

        {summary.total_reviews > 0 && (
          <View style={styles.ratingRow}>
            <StarRating rating={summary.average_rating} />
            <Text style={{ color: colors.muted, fontSize: 13 }}>
              {summary.average_rating} ({summary.total_reviews} reseña{summary.total_reviews === 1 ? "" : "s"})
            </Text>
          </View>
        )}

        <Text style={[styles.price, { color: colors.foreground }]}>{formatCurrency(product.price)}</Text>

        <Text style={{ color: product.stock > 0 ? colors.success : colors.danger, fontSize: 13 }}>
          {product.stock > 0 ? `${product.stock} disponibles` : "Sin stock por ahora"}
        </Text>

        <Text style={[styles.description, { color: colors.muted }]}>
          {product.description || "Este producto no tiene descripción todavía."}
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Reseñas</Text>

        {reviewsLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : reviews.length === 0 ? (
          <Text style={{ color: colors.muted, fontSize: 13 }}>Este producto todavía no tiene reseñas.</Text>
        ) : (
          <View style={{ gap: 10 }}>
            {reviews.map((review) => (
              <View
                key={review.id}
                style={[styles.reviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={styles.reviewHeader}>
                  <Text style={{ color: colors.foreground, fontWeight: "600" }}>
                    {review.user?.name || "Usuario"}
                  </Text>
                  <StarRating rating={review.rating} size={13} />
                </View>
                {review.comment ? (
                  <Text style={{ color: colors.muted, fontSize: 13, marginTop: 4 }}>{review.comment}</Text>
                ) : null}
                <Text style={{ color: colors.muted, fontSize: 11, marginTop: 6 }}>
                  {formatDate(review.created_at)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: { flexGrow: 1 },
  imageWrapper: { width: "100%", aspectRatio: 1, alignItems: "center", justifyContent: "center" },
  image: { width: "100%", height: "100%" },
  content: { padding: 20, gap: 8 },
  meta: { fontSize: 12 },
  name: { fontSize: 20, fontWeight: "700" },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  price: { fontSize: 24, fontWeight: "800", marginTop: 4 },
  description: { fontSize: 13, lineHeight: 19, marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginTop: 16, marginBottom: 4 },
  reviewCard: { borderWidth: 1, borderRadius: 14, padding: 12 },
  reviewHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
});
