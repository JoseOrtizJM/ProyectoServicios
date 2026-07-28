import { SlidersHorizontal } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";

import { listBrands, listCategories, listProducts } from "../api/catalog";
import FiltersModal from "../components/catalog/FiltersModal";
import ProductCard from "../components/catalog/ProductCard";
import WelcomeBanner from "../components/catalog/WelcomeBanner";
import { useTheme } from "../context/ThemeContext";

const INITIAL_FILTERS = { search: "", category: "", brand: "", min_price: "", max_price: "" };
const PAGE_SIZE = 12;

export default function CatalogScreen({ navigation }) {
  const { colors } = useTheme();

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [searchInput, setSearchInput] = useState("");
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);

  useEffect(() => {
    listCategories()
      .then((data) => setCategories(data.results))
      .catch(() => {});
    listBrands()
      .then((data) => setBrands(data.results))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters((prev) => (prev.search === searchInput ? prev : { ...prev, search: searchInput }));
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const buildParams = useCallback(
    (targetPage) => {
      const params = { page: targetPage, page_size: PAGE_SIZE };
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.brand) params.brand = filters.brand;
      if (filters.min_price) params.min_price = filters.min_price;
      if (filters.max_price) params.max_price = filters.max_price;
      return params;
    },
    [filters],
  );

  const loadFirstPage = useCallback(() => {
    setLoading(true);
    listProducts(buildParams(1))
      .then((data) => {
        setProducts(data.results);
        setTotalPages(data.total_pages);
        setCount(data.count);
        setPage(1);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, [buildParams]);

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  function handleRefresh() {
    setRefreshing(true);
    loadFirstPage();
  }

  function handleLoadMore() {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    listProducts(buildParams(nextPage))
      .then((data) => {
        setProducts((prev) => [...prev, ...data.results]);
        setPage(nextPage);
      })
      .catch(() => {})
      .finally(() => setLoadingMore(false));
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <WelcomeBanner />

      <View style={styles.searchRow}>
        <TextInput
          value={searchInput}
          onChangeText={setSearchInput}
          placeholder="Buscar productos…"
          placeholderTextColor={colors.muted}
          style={[
            styles.search,
            { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground },
          ]}
        />
        <Pressable
          onPress={() => setFiltersVisible(true)}
          style={[styles.filterButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <SlidersHorizontal size={18} color={colors.foreground} />
        </Pressable>
      </View>

      {!loading && <Text style={[styles.count, { color: colors.muted }]}>{count} productos</Text>}

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
      ) : products.length === 0 ? (
        <Text style={[styles.empty, { color: colors.muted }]}>No se encontraron productos con esos filtros.</Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => navigation.navigate("ProductDetail", { productId: item.id })}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
          }
          onEndReachedThreshold={0.4}
          onEndReached={handleLoadMore}
          ListFooterComponent={
            loadingMore ? <ActivityIndicator style={{ marginVertical: 16 }} color={colors.primary} /> : null
          }
        />
      )}

      <FiltersModal
        visible={filtersVisible}
        onClose={() => setFiltersVisible(false)}
        categories={categories}
        brands={brands}
        filters={filters}
        onApply={(next) => setFilters(next)}
        onReset={() => {
          setSearchInput("");
          setFilters(INITIAL_FILTERS);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 12, gap: 8 },
  searchRow: { flexDirection: "row", gap: 8 },
  search: { flex: 1, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  filterButton: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  count: { fontSize: 12 },
  empty: { textAlign: "center", marginTop: 40, fontSize: 14 },
  list: { gap: 12, paddingBottom: 24 },
  row: { gap: 12 },
});
