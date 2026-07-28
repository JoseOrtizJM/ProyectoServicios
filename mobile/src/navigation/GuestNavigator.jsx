import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Grid2x2, User } from "lucide-react-native";

import { useTheme } from "../context/ThemeContext";
import CatalogNavigator from "./CatalogNavigator";
import GuestAccountNavigator from "./GuestAccountNavigator";

const Tab = createBottomTabNavigator();

export default function GuestNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <Tab.Screen
        name="CatalogTab"
        component={CatalogNavigator}
        options={{ title: "Catálogo", tabBarIcon: ({ color, size }) => <Grid2x2 color={color} size={size} /> }}
      />
      <Tab.Screen
        name="AccountTab"
        component={GuestAccountNavigator}
        options={{ title: "Mi cuenta", tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }}
      />
    </Tab.Navigator>
  );
}
