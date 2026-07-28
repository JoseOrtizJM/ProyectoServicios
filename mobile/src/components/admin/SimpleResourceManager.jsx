import { Pencil, Plus, Trash2 } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert as RNAlert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { extractErrorMessages } from "../../api/errors";
import { useTheme } from "../../context/ThemeContext";
import { formatDate } from "../../utils/format";
import Alert from "../ui/Alert";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "./Modal";

const EMPTY_FORM = { name: "", description: "" };

export default function SimpleResourceManager({ title, listFn, createFn, updateFn, deleteFn }) {
  const { colors } = useTheme();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  function load() {
    setLoading(true);
    listFn({ page_size: 50 })
      .then((data) => setItems(data.results))
      .catch(() => setListError("No se pudo cargar la lista."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormErrors([]);
    setModalVisible(true);
  }

  function openEdit(item) {
    setEditing(item);
    setForm({ name: item.name, description: item.description || "" });
    setFormErrors([]);
    setModalVisible(true);
  }

  async function handleSubmit() {
    setFormErrors([]);
    setSubmitting(true);
    try {
      if (editing) {
        await updateFn(editing.id, form);
      } else {
        await createFn(form);
      }
      setModalVisible(false);
      load();
    } catch (error) {
      setFormErrors(extractErrorMessages(error));
    } finally {
      setSubmitting(false);
    }
  }

  function handleDelete(item) {
    RNAlert.alert("Eliminar", `¿Eliminar "${item.name}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteFn(item.id);
            load();
          } catch (error) {
            setListError(extractErrorMessages(error)[0]);
          }
        },
      },
    ]);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.headerRow}>
        <Text style={{ color: colors.muted, fontSize: 12 }}>{items.length} en total</Text>
        <Pressable onPress={openCreate} style={[styles.addButton, { backgroundColor: colors.primary }]}>
          <Plus size={16} color={colors.primaryForeground} />
          <Text style={{ color: colors.primaryForeground, fontSize: 13, fontWeight: "600" }}>Nueva</Text>
        </Pressable>
      </View>

      {listError ? <Alert>{listError}</Alert> : null}

      {loading ? (
        <ActivityIndicator style={{ marginTop: 24 }} color={colors.primary} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: 14 }}>{item.name}</Text>
                {item.description ? (
                  <Text style={{ color: colors.muted, fontSize: 12 }} numberOfLines={1}>
                    {item.description}
                  </Text>
                ) : null}
                <Text style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>{formatDate(item.created_at)}</Text>
              </View>
              <View style={styles.rowActions}>
                <Pressable onPress={() => openEdit(item)} hitSlop={8}>
                  <Pencil size={16} color={colors.muted} />
                </Pressable>
                <Pressable onPress={() => handleDelete(item)} hitSlop={8}>
                  <Trash2 size={16} color={colors.danger} />
                </Pressable>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={{ color: colors.muted, textAlign: "center", marginTop: 24 }}>No hay elementos todavía.</Text>
          }
        />
      )}

      <Modal visible={modalVisible} title={title} onClose={() => setModalVisible(false)}>
        {formErrors.map((message, index) => (
          <Alert key={`${index}-${message}`}>{message}</Alert>
        ))}
        <Input label="Nombre" value={form.name} onChangeText={(text) => setForm((prev) => ({ ...prev, name: text }))} />
        <Input
          label="Descripción"
          value={form.description}
          onChangeText={(text) => setForm((prev) => ({ ...prev, description: text }))}
        />
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
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderRadius: 14, padding: 12 },
  rowActions: { flexDirection: "row", gap: 14 },
});
