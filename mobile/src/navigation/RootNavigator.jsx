import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { ActivityIndicator, View } from "react-native";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import AdminNavigator from "./AdminNavigator";
import AppNavigator from "./AppNavigator";
import AuthNavigator from "./AuthNavigator";

export default function RootNavigator() {
  const { theme, colors } = useTheme();
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const baseNavigationTheme = theme === "dark" ? DarkTheme : DefaultTheme;

  const navigationTheme = {
    ...baseNavigationTheme,
    colors: {
      ...baseNavigationTheme.colors,
      background: colors.background,
      card: colors.surface,
      text: colors.foreground,
      border: colors.border,
      primary: colors.primary,
    },
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      {!isAuthenticated ? <AuthNavigator /> : isAdmin ? <AdminNavigator /> : <AppNavigator />}
    </NavigationContainer>
  );
}
