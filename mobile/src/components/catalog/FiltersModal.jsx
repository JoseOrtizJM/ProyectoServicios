import { X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useTheme } from "../../context/ThemeContext";
import Button from "../ui/Button";
import Input from "../ui/Input";

function Chip({ label, active, onPress, colors }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        { backgroundColor: active ? colors.primary : colors.surfaceMuted, borderColor: active ? colors.primary : colors.border },
      ]}
    >
      <Text style={{ color: active ? colors.primaryForeground : colors.foreground, fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}

export default function FiltersModal({ visible, onClose, categories, brands, filters, onApply, onReset }) {
  const { colors } = useTheme();
  const [draft, setDraft] = useState(filters);

  useEffect(() => {
    if (visible) setDraft(filters);
  }, [visible, filters]);

  function handleApply() {
    onApply(draft);
    onClose();
  }

  function handleReset() {
    onReset();
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.foreground }]}>Filtros</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={20} color={colors.muted} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Categoría</Text>
            <View style={styles.chipsRow}>
              <Chip label="Todas" active={!draft.category} onPress={() => setDraft((prev) => ({ ...prev, category: "" }))} colors={colors} />
              {categories.map((category) => (
                <Chip
                  key={category.id}
                  label={category.name}
                  active={draft.category === category.id}
                  onPress={() => setDraft((prev) => ({ ...prev, category: category.id }))}
                  colors={colors}
                />
              ))}
            </View>

            <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Marca</Text>
            <View style={styles.chipsRow}>
              <Chip label="Todas" active={!draft.brand} onPress={() => setDraft((prev) => ({ ...prev, brand: "" }))} colors={colors} />
              {brands.map((brand) => (
                <Chip
                  key={brand.id}
                  label={brand.name}
                  active={draft.brand === brand.id}
                  onPress={() => setDraft((prev) => ({ ...prev, brand: brand.id }))}
                  colors={colors}
                />
              ))}
            </View>

            <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Precio (MXN)</Text>
            <View style={styles.row}>
              <View style={styles.half}>
                <Input
                  label="Mínimo"
                  keyboardType="numeric"
                  value={draft.min_price}
                  onChangeText={(text) => setDraft((prev) => ({ ...prev, min_price: text }))}
                />
              </View>
              <View style={styles.half}>
                <Input
                  label="Máximo"
                  keyboardType="numeric"
                  value={draft.max_price}
                  onChangeText={(text) => setDraft((prev) => ({ ...prev, max_price: text }))}
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <View style={{ flex: 1 }}>
              <Button title="Limpiar" variant="outline" onPress={handleReset} />
            </View>
            <View style={{ flex: 1 }}>
              <Button title="Aplicar" onPress={handleApply} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: { maxHeight: "85%", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  title: { fontSize: 18, fontWeight: "700" },
  content: { gap: 8, paddingBottom: 12 },
  sectionLabel: { fontSize: 13, fontWeight: "600", marginTop: 12 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  row: { flexDirection: "row", gap: 12 },
  half: { flex: 1 },
  actions: { flexDirection: "row", gap: 12, marginTop: 16 },
});
