import { SlidersHorizontal, Trash2 } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert as RNAlert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { deleteReview, listAdminReviews } from "../../api/admin";
import { listProducts } from "../../api/catalog";
import { extractErrorMessages } from "../../api/errors";
import Modal from "../../components/admin/Modal";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import StarRating from "../../components/ui/StarRating";
import { useTheme } from "../../context/ThemeContext";
import { formatDate } from "../../utils/format";

const RATING_OPTIONS = [
  { value: "", label: "Todas" },
  { value: "5", label: "5 ★" },
  { value: "4", label: "4 ★" },
  { value: "3", label: "3 ★" },
  { value: "2", label: "2 ★" },
  { value: "1", label: "1 ★" },
];

const EMPTY_FILTERS = { product: "", rating: "", user_search: "" };

export default function AdminReviewsScreen() {
  const { colors } = useTheme();
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [draft, setDraft] = useState(EMPTY_FILTERS);

  useEffect(() => {
    listProducts({ page_size: 50 })
      .then((data) => setProducts(data.results))
      .catch(() => {});
  }, []);

  function load() {
    setLoading(true);
    setError("");
    const params = { page_size: 50 };
    if (filters.product) params.product = filters.product;
    if (filters.rating) params.rating = filters.rating;
    if (filters.user_search) params.user_search = filters.user_search;
    listAdminReviews(params)
      .then((data) => setReviews(data.results))
      .catch(() => setError("No se pudo cargar la lista de reseñas."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [filters]);

  function openFilters() {
    setDraft(filters);
    setModalVisible(true);
  }

  function applyFilters() {
    setFilters(draft);
    setModalVisible(false);
  }

  function resetFilters() {
    setDraft(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
    setModalVisible(false);
  }

  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const selectedProductName = products.find((p) => p.id === filters.product)?.name;

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
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          {selectedProductName ? (
            <Text style={{ color: colors.muted, fontSize: 12 }} numberOfLines={1}>
              Producto: {selectedProductName}
            </Text>
          ) : null}
          {filters.user_search ? (
            <Text style={{ color: colors.muted, fontSize: 12 }} numberOfLines={1}>
              Usuario: {filters.user_search}
            </Text>
          ) : null}
        </View>
        <Pressable
          onPress={openFilters}
          style={[styles.filterButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <SlidersHorizontal size={16} color={colors.foreground} />
          <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "600" }}>Filtros</Text>
          {activeFilterCount > 0 && (
            <View style={[styles.countBadge, { backgroundColor: colors.accent }]}>
              <Text style={{ color: colors.accentForeground, fontSize: 10, fontWeight: "700" }}>
                {activeFilterCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

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
            <Text style={{ color: colors.muted, textAlign: "center", marginTop: 24 }}>
              No hay reseñas con ese filtro.
            </Text>
          }
        />
      )}

      <Modal visible={modalVisible} title="Filtros de reseñas" onClose={() => setModalVisible(false)}>
        <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "600" }}>Producto</Text>
        <View style={styles.chipsRow}>
          <Pressable
            onPress={() => setDraft((prev) => ({ ...prev, product: "" }))}
            style={[
              styles.chip,
              {
                backgroundColor: !draft.product ? colors.primary : colors.surfaceMuted,
                borderColor: !draft.product ? colors.primary : colors.border,
              },
            ]}
          >
            <Text style={{ color: !draft.product ? colors.primaryForeground : colors.foreground, fontSize: 12 }}>
              Todos
            </Text>
          </Pressable>
          {products.map((product) => (
            <Pressable
              key={product.id}
              onPress={() => setDraft((prev) => ({ ...prev, product: product.id }))}
              style={[
                styles.chip,
                {
                  backgroundColor: draft.product === product.id ? colors.primary : colors.surfaceMuted,
                  borderColor: draft.product === product.id ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={{
                  color: draft.product === product.id ? colors.primaryForeground : colors.foreground,
                  fontSize: 12,
                }}
                numberOfLines={1}
              >
                {product.name}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "600" }}>Calificación</Text>
        <View style={styles.chipsRow}>
          {RATING_OPTIONS.map((option) => (
            <Pressable
              key={option.value || "all"}
              onPress={() => setDraft((prev) => ({ ...prev, rating: option.value }))}
              style={[
                styles.chip,
                {
                  backgroundColor: draft.rating === option.value ? colors.primary : colors.surfaceMuted,
                  borderColor: draft.rating === option.value ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={{
                  color: draft.rating === option.value ? colors.primaryForeground : colors.foreground,
                  fontSize: 12,
                }}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Input
          label="Usuario (correo o nombre)"
          placeholder="Buscar por correo o nombre…"
          autoCapitalize="none"
          value={draft.user_search}
          onChangeText={(text) => setDraft((prev) => ({ ...prev, user_search: text }))}
        />

        <View style={styles.modalActions}>
          <View style={{ flex: 1 }}>
            <Button title="Limpiar" variant="outline" onPress={resetFilters} />
          </View>
          <View style={{ flex: 1 }}>
            <Button title="Aplicar" onPress={applyFilters} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    padding: 16,
    paddingBottom: 8,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  countBadge: { borderRadius: 999, minWidth: 16, height: 16, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 10 },
  card: { borderWidth: 1, borderRadius: 14, padding: 12 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, maxWidth: 180 },
  modalActions: { flexDirection: "row", gap: 12, marginTop: 4 },
});
