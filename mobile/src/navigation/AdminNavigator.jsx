import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { LayoutGrid, User } from "lucide-react-native";

import { useTheme } from "../context/ThemeContext";
import ProfileScreen from "../screens/ProfileScreen";
import AdminStack from "./AdminStack";

const Tab = createBottomTabNavigator();

export default function AdminNavigator() {
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
        name="AdminDashboardTab"
        component={AdminStack}
        options={{ title: "Dashboard", tabBarIcon: ({ color, size }) => <LayoutGrid color={color} size={size} /> }}
      />
      <Tab.Screen
        name="AdminProfileTab"
        component={ProfileScreen}
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.foreground,
          title: "Mi perfil",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}
