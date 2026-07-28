import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Grid2x2, User } from "lucide-react-native";

import { useTheme } from "../context/ThemeContext";
import ProfileScreen from "../screens/ProfileScreen";
import CatalogNavigator from "./CatalogNavigator";

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const { colors } = useTheme();

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
