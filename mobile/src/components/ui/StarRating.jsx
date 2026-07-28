import { Star } from "lucide-react-native";
import { View } from "react-native";

import { useTheme } from "../../context/ThemeContext";

export default function StarRating({ rating = 0, size = 16 }) {
  const { colors } = useTheme();
  const rounded = Math.round(rating || 0);

  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          size={size}
          color={index < rounded ? colors.warning : colors.border}
          fill={index < rounded ? colors.warning : "transparent"}
        />
      ))}
    </View>
  );
}
