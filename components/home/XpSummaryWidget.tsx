import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@/design-system/ThemeProvider";
import { Text } from "@/design-system/components/Text";
import { Badge } from "@/design-system/components/Badge";
import { ProgressBar } from "@/design-system/components/ProgressBar";
import { XpState, xpProgressInLevel, xpForNextLevel } from "@/lib/types/xp";
import Ionicons from "@expo/vector-icons/Ionicons";

interface XpSummaryWidgetProps {
  xpState: XpState | null;
}

export default function XpSummaryWidget({ xpState }: XpSummaryWidgetProps) {
  const { colors } = useTheme();

  const totalXp = xpState?.totalXp ?? 0;
  const level = xpState?.level ?? 1;
  const progressInLevel = xpProgressInLevel(totalXp);
  const neededForNext = xpForNextLevel(totalXp);
  const progressRatio = progressInLevel / (progressInLevel + neededForNext);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.xpRow}>
          <Ionicons name="star" size={18} color={colors.warning} />
          <Text style={[styles.xpTotal, { color: colors.text }]}>
            {totalXp} XP
          </Text>
        </View>
        <Badge
          variant="premium"
          label={`Level ${level}`}
          icon={<Ionicons name="trophy-outline" size={12} color={colors.primary} />}
        />
      </View>
      <ProgressBar progress={progressRatio} height={6} />
      <Text style={[styles.caption, { color: colors.textSecondary }]}>
        {neededForNext} XP to level {level + 1}
        {xpState?.todayXp ? ` · ${xpState.todayXp} XP today` : ""}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  xpRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  xpTotal: {
    fontSize: 18,
    fontWeight: "700",
  },
  caption: {
    fontSize: 12,
  },
});
