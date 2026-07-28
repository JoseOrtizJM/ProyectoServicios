import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { listAdminUsers, updateAdminUser } from "../../api/admin";
import { extractErrorMessages } from "../../api/errors";
import Alert from "../../components/ui/Alert";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { formatDate } from "../../utils/format";

const ROLE_FILTERS = [
  { value: "", label: "Todos" },
  { value: "user", label: "Usuario" },
  { value: "admin", label: "Admin" },
];

export default function AdminUsersScreen() {
  const { colors } = useTheme();
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(true);
      setError("");
      const params = { page_size: 50 };
      if (roleFilter) params.role = roleFilter;
      if (search) params.search = search;
      listAdminUsers(params)
        .then((data) => setUsers(data.results))
        .catch(() => setError("No se pudo cargar la lista de usuarios."))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [roleFilter, search]);

  async function handleToggleActive(targetUser) {
    setError("");
    try {
      const updated = await updateAdminUser(targetUser.id, { is_active: !targetUser.is_active });
      setUsers((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setError(extractErrorMessages(err)[0]);
    }
  }

  async function handleToggleRole(targetUser) {
    setError("");
    const nextRole = targetUser.role === "admin" ? "user" : "admin";
    try {
      const updated = await updateAdminUser(targetUser.id, { role: nextRole });
      setUsers((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setError(extractErrorMessages(err)[0]);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.filters}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar por correo…"
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
        />
        <View style={styles.chipsRow}>
          {ROLE_FILTERS.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => setRoleFilter(option.value)}
              style={[
                styles.chip,
                {
                  backgroundColor: roleFilter === option.value ? colors.primary : colors.surfaceMuted,
                  borderColor: roleFilter === option.value ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={{ color: roleFilter === option.value ? colors.primaryForeground : colors.foreground, fontSize: 12 }}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {error ? <Alert>{error}</Alert> : null}

      {loading ? (
        <ActivityIndicator style={{ marginTop: 24 }} color={colors.primary} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const isSelf = item.id === currentUser.id;
            return (
              <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: 13 }} numberOfLines={1}>
                    {item.email}
                  </Text>
                  <Text style={{ color: colors.muted, fontSize: 11 }}>
                    {`${item.first_name} ${item.last_name}`.trim() || "—"} · {formatDate(item.created_at)}
                  </Text>
                  <View style={styles.metaRow}>
                    <View style={[styles.badge, { backgroundColor: item.is_active ? colors.success : colors.danger }]}>
                      <Text
                        style={{
                          color: item.is_active ? colors.successForeground : colors.dangerForeground,
                          fontSize: 10,
                          fontWeight: "600",
                        }}
                      >
                        {item.is_active ? "Activo" : "Bloqueado"}
                      </Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: colors.surfaceMuted }]}>
                      <Text style={{ color: colors.foreground, fontSize: 10, fontWeight: "600" }}>
                        {item.role === "admin" ? "Administrador" : "Usuario"}
                      </Text>
                    </View>
                  </View>
                </View>
                {!isSelf && (
                  <View style={styles.rowActions}>
                    <Pressable onPress={() => handleToggleRole(item)}>
                      <Text style={{ color: colors.primary, fontSize: 11, fontWeight: "600" }}>
                        {item.role === "admin" ? "Quitar admin" : "Hacer admin"}
                      </Text>
                    </Pressable>
                    <Pressable onPress={() => handleToggleActive(item)}>
                      <Text style={{ color: colors.primary, fontSize: 11, fontWeight: "600" }}>
                        {item.is_active ? "Bloquear" : "Desbloquear"}
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>
            );
          }}
          ListEmptyComponent={
            <Text style={{ color: colors.muted, textAlign: "center", marginTop: 24 }}>No hay usuarios con ese filtro.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  filters: { padding: 16, paddingBottom: 8, gap: 10 },
  search: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 10 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 10, borderWidth: 1, borderRadius: 14, padding: 12 },
  metaRow: { flexDirection: "row", gap: 6, marginTop: 6 },
  badge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  rowActions: { gap: 10, alignItems: "flex-end" },
});
