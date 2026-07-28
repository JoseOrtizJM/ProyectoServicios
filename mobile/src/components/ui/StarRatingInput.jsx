import { Star } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { useTheme } from "../../context/ThemeContext";

export default function StarRatingInput({ value, onChange, size = 26 }) {
  const { colors } = useTheme();

  return (
    <View style={{ flexDirection: "row", gap: 4 }}>
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1;
        return (
          <Pressable key={starValue} onPress={() => onChange(starValue)} hitSlop={6}>
            <Star
              size={size}
              color={starValue <= value ? colors.warning : colors.border}
              fill={starValue <= value ? colors.warning : "transparent"}
            />
          </Pressable>
        );
      })}
    </View>
  );
}
