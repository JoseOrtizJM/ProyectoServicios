import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useTheme } from "../context/ThemeContext";
import GuestAccountScreen from "../screens/GuestAccountScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";

const Stack = createNativeStackNavigator();

export default function GuestAccountNavigator() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.foreground,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="AccountHome" component={GuestAccountScreen} options={{ title: "Mi cuenta" }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Iniciar sesión" }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "Crear cuenta" }} />
    </Stack.Navigator>
  );
}
