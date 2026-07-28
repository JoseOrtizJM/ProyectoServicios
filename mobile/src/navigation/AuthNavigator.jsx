import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useTheme } from "../context/ThemeContext";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.foreground,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Iniciar sesión" }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "Crear cuenta" }} />
    </Stack.Navigator>
  );
}
