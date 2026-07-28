import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useTheme } from "../context/ThemeContext";
import AdminAnalyticsScreen from "../screens/admin/AdminAnalyticsScreen";
import AdminBrandsScreen from "../screens/admin/AdminBrandsScreen";
import AdminCategoriesScreen from "../screens/admin/AdminCategoriesScreen";
import AdminDashboardScreen from "../screens/admin/AdminDashboardScreen";
import AdminOrdersScreen from "../screens/admin/AdminOrdersScreen";
import AdminProductsScreen from "../screens/admin/AdminProductsScreen";
import AdminReviewsScreen from "../screens/admin/AdminReviewsScreen";
import AdminUsersScreen from "../screens/admin/AdminUsersScreen";

const Stack = createNativeStackNavigator();

export default function AdminStack() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.foreground,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: "Dashboard" }} />
      <Stack.Screen name="AdminProducts" component={AdminProductsScreen} options={{ title: "Productos" }} />
      <Stack.Screen name="AdminCategories" component={AdminCategoriesScreen} options={{ title: "Categorías" }} />
      <Stack.Screen name="AdminBrands" component={AdminBrandsScreen} options={{ title: "Marcas" }} />
      <Stack.Screen name="AdminUsers" component={AdminUsersScreen} options={{ title: "Usuarios" }} />
      <Stack.Screen name="AdminOrders" component={AdminOrdersScreen} options={{ title: "Pedidos" }} />
      <Stack.Screen name="AdminReviews" component={AdminReviewsScreen} options={{ title: "Reseñas" }} />
      <Stack.Screen name="AdminAnalytics" component={AdminAnalyticsScreen} options={{ title: "Analíticas" }} />
    </Stack.Navigator>
  );
}
