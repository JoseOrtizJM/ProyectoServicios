import { ImageOff } from "lucide-react-native";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "../../context/ThemeContext";
import { formatCurrency } from "../../utils/format";

export default function ProductCard({ product, onPress }) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={[styles.imageWrapper, { backgroundColor: colors.surfaceMuted }]}>
        {product.image_url ? (
          <Image source={{ uri: product.image_url }} style={styles.image} resizeMode="cover" />
        ) : (
          <ImageOff size={28} color={colors.muted} />
        )}
      </View>

      <View style={styles.info}>
        {product.brand && (
          <Text style={[styles.brand, { color: colors.muted }]} numberOfLines={1}>
            {product.brand.name}
          </Text>
        )}
        <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={2}>
          {product.name}
        </Text>
        <View style={styles.footer}>
          <Text style={[styles.price, { color: colors.foreground }]}>{formatCurrency(product.price)}</Text>
          {product.stock === 0 && (
            <View style={[styles.badge, { backgroundColor: colors.danger }]}>
              <Text style={[styles.badgeText, { color: colors.dangerForeground }]}>Agotado</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  imageWrapper: {
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  image: { width: "100%", height: "100%" },
  info: { padding: 10, gap: 2 },
  brand: { fontSize: 11 },
  name: { fontSize: 13, fontWeight: "600", minHeight: 34 },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  price: { fontSize: 14, fontWeight: "700" },
  badge: { borderRadius: 999, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { fontSize: 10, fontWeight: "600" },
});
