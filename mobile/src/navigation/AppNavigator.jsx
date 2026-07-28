import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useTheme } from "../context/ThemeContext";
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.foreground,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Tienda Tech" }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: "Mi perfil" }} />
    </Stack.Navigator>
  );
}
