import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Grid2x2, ShoppingCart, User } from "lucide-react-native";

import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import ProfileScreen from "../screens/ProfileScreen";
import CartNavigator from "./CartNavigator";
import CatalogNavigator from "./CatalogNavigator";

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const { colors } = useTheme();
  const { itemCount } = useCart();

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.foreground,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <Tab.Screen
        name="CatalogTab"
        component={CatalogNavigator}
        options={{
          headerShown: false,
          title: "Catálogo",
          tabBarIcon: ({ color, size }) => <Grid2x2 color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartNavigator}
        options={{
          headerShown: false,
          title: "Carrito",
          tabBarIcon: ({ color, size }) => <ShoppingCart color={color} size={size} />,
          tabBarBadge: itemCount > 0 ? itemCount : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.accent, color: colors.accentForeground },
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: "Mi perfil",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}
