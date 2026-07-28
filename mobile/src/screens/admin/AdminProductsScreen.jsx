import { Pencil, Plus } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert as RNAlert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import {
  createProduct,
  deleteProduct,
  listBrands,
  listCategories,
  listProducts,
  updateProduct,
} from "../../api/catalog";
import { extractErrorMessages } from "../../api/errors";
import Modal from "../../components/admin/Modal";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useTheme } from "../../context/ThemeContext";
import { formatCurrency } from "../../utils/format";

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  stock: "",
  image_url: "",
  category_id: "",
  brand_id: "",
};

const STATUS_FILTERS = [
  { value: "", label: "Todos" },
  { value: "true", label: "Activos" },
  { value: "false", label: "Inactivos" },
];

export default function AdminProductsScreen() {
  const { colors } = useTheme();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    listCategories()
      .then((data) => setCategories(data.results))
      .catch(() => {});
    listBrands()
      .then((data) => setBrands(data.results))
      .catch(() => {});
  }, []);

  function load() {
    setLoading(true);
    setListError("");
    const params = { page_size: 50 };
    if (statusFilter) params.is_active = statusFilter;
    listProducts(params)
      .then((data) => setProducts(data.results))
      .catch(() => setListError("No se pudo cargar la lista de productos."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [statusFilter]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormErrors([]);
    setModalVisible(true);
  }

  function openEdit(product) {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description || "",
      price: String(product.price),
      stock: String(product.stock),
      image_url: product.image_url || "",
      category_id: product.category?.id || "",
      brand_id: product.brand?.id || "",
    });
    setFormErrors([]);
    setModalVisible(true);
  }

  async function handleSubmit() {
    setFormErrors([]);
    setSubmitting(true);
    const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };
    try {
      if (editing) {
        await updateProduct(editing.id, payload);
      } else {
        await createProduct(payload);
      }
      setModalVisible(false);
      load();
    } catch (error) {
      setFormErrors(extractErrorMessages(error));
    } finally {
      setSubmitting(false);
    }
  }

  function handleToggleActive(product) {
    if (product.is_active) {
      RNAlert.alert("Desactivar", `¿Desactivar "${product.name}"?`, [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Desactivar",
          style: "destructive",
          onPress: () => {
            deleteProduct(product.id)
              .then(load)
              .catch((error) => setListError(extractErrorMessages(error)[0]));
          },
        },
      ]);
    } else {
      updateProduct(product.id, { is_active: true })
        .then(load)
        .catch((error) => setListError(extractErrorMessages(error)[0]));
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.headerRow}>
        <View style={styles.filterRow}>
          {STATUS_FILTERS.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => setStatusFilter(option.value)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: statusFilter === option.value ? colors.primary : colors.surfaceMuted,
                  borderColor: statusFilter === option.value ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={{
                  color: statusFilter === option.value ? colors.primaryForeground : colors.foreground,
                  fontSize: 12,
                }}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
        <Pressable onPress={openCreate} style={[styles.addButton, { backgroundColor: colors.primary }]}>
          <Plus size={18} color={colors.primaryForeground} />
        </Pressable>
      </View>

      {listError ? <Alert>{listError}</Alert> : null}

      {loading ? (
        <ActivityIndicator style={{ marginTop: 24 }} color={colors.primary} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: 14 }} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={{ color: colors.muted, fontSize: 11 }}>
                  {[item.category?.name, item.brand?.name].filter(Boolean).join(" · ") || "—"}
                </Text>
                <View style={styles.metaRow}>
                  <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: "600" }}>
                    {formatCurrency(item.price)}
                  </Text>
                  <Text style={{ color: colors.muted, fontSize: 12 }}>Stock: {item.stock}</Text>
                  <View
                    style={[styles.badge, { backgroundColor: item.is_active ? colors.success : colors.danger }]}
                  >
                    <Text
                      style={{
                        color: item.is_active ? colors.successForeground : colors.dangerForeground,
                        fontSize: 10,
                        fontWeight: "600",
                      }}
                    >
                      {item.is_active ? "Activo" : "Inactivo"}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.rowActions}>
                <Pressable onPress={() => openEdit(item)} hitSlop={8}>
                  <Pencil size={16} color={colors.muted} />
                </Pressable>
                <Pressable onPress={() => handleToggleActive(item)} hitSlop={8}>
                  <Text style={{ color: colors.primary, fontSize: 11, fontWeight: "600" }}>
                    {item.is_active ? "Desactivar" : "Activar"}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={{ color: colors.muted, textAlign: "center", marginTop: 24 }}>No hay productos.</Text>
          }
        />
      )}

      <Modal
        visible={modalVisible}
        title={editing ? "Editar producto" : "Nuevo producto"}
        onClose={() => setModalVisible(false)}
      >
        {formErrors.map((message, index) => (
          <Alert key={`${index}-${message}`}>{message}</Alert>
        ))}
        <Input label="Nombre" value={form.name} onChangeText={(text) => setForm((prev) => ({ ...prev, name: text }))} />
        <Input
          label="Descripción"
          value={form.description}
          onChangeText={(text) => setForm((prev) => ({ ...prev, description: text }))}
          multiline
        />
        <View style={styles.row2}>
          <View style={styles.half}>
            <Input
              label="Precio (MXN)"
              keyboardType="decimal-pad"
              value={form.price}
              onChangeText={(text) => setForm((prev) => ({ ...prev, price: text }))}
            />
          </View>
          <View style={styles.half}>
            <Input
              label="Stock"
              keyboardType="number-pad"
              value={form.stock}
              onChangeText={(text) => setForm((prev) => ({ ...prev, stock: text }))}
            />
          </View>
        </View>
        <Input
          label="URL de imagen (opcional)"
          value={form.image_url}
          onChangeText={(text) => setForm((prev) => ({ ...prev, image_url: text }))}
          autoCapitalize="none"
        />

        <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "600" }}>Categoría</Text>
        <View style={styles.chipsRow}>
          {categories.map((category) => (
            <Pressable
              key={category.id}
              onPress={() => setForm((prev) => ({ ...prev, category_id: category.id }))}
              style={[
                styles.chip,
                {
                  backgroundColor: form.category_id === category.id ? colors.primary : colors.surfaceMuted,
                  borderColor: form.category_id === category.id ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={{
                  color: form.category_id === category.id ? colors.primaryForeground : colors.foreground,
                  fontSize: 12,
                }}
              >
                {category.name}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "600" }}>Marca</Text>
        <View style={styles.chipsRow}>
          {brands.map((brand) => (
            <Pressable
              key={brand.id}
              onPress={() => setForm((prev) => ({ ...prev, brand_id: brand.id }))}
              style={[
                styles.chip,
                {
                  backgroundColor: form.brand_id === brand.id ? colors.primary : colors.surfaceMuted,
                  borderColor: form.brand_id === brand.id ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={{
                  color: form.brand_id === brand.id ? colors.primaryForeground : colors.foreground,
                  fontSize: 12,
                }}
              >
                {brand.name}
              </Text>
            </Pressable>
          ))}
        </View>

        <Button title={submitting ? "Guardando…" : "Guardar"} onPress={handleSubmit} loading={submitting} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingBottom: 8,
    gap: 8,
  },
  filterRow: { flexDirection: "row", gap: 6, flex: 1, flexWrap: "wrap" },
  filterChip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  addButton: { width: 36, height: 36, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 10 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 10, borderWidth: 1, borderRadius: 14, padding: 12 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  badge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  rowActions: { alignItems: "flex-end", gap: 10 },
  row2: { flexDirection: "row", gap: 10 },
  half: { flex: 1 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
});
