import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@/design-system/ThemeProvider";
import { Text } from "@/design-system/components/Text";
import { StreakState } from "@/lib/services/streak-service";
import Ionicons from "@expo/vector-icons/Ionicons";

interface StreakWidgetProps {
  streakState: StreakState | null;
}

export default function StreakWidget({ streakState }: StreakWidgetProps) {
  const { colors } = useTheme();
  const streak = streakState?.currentStreak ?? 0;

  return (
    <View style={styles.container}>
      <Ionicons name="flame" size={20} color={colors.warning} />
      <Text style={[styles.count, { color: colors.text }]}>{streak}</Text>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        day streak
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  count: {
    fontSize: 18,
    fontWeight: "700",
  },
  label: {
    fontSize: 13,
  },
});
