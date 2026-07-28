import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useTheme } from "../context/ThemeContext";
import CartScreen from "../screens/CartScreen";
import CheckoutScreen from "../screens/CheckoutScreen";

const Stack = createNativeStackNavigator();

export default function CartNavigator() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.foreground,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Cart" component={CartScreen} options={{ title: "Mi carrito" }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: "Pagar" }} />
    </Stack.Navigator>
  );
}
