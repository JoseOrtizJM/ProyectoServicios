import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useTheme } from "../context/ThemeContext";
import CatalogScreen from "../screens/CatalogScreen";
import ProductDetailScreen from "../screens/ProductDetailScreen";

const Stack = createNativeStackNavigator();

export default function CatalogNavigator() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.foreground,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Catalog" component={CatalogScreen} options={{ title: "Catálogo" }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: "Producto" }} />
    </Stack.Navigator>
  );
}
