import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Card } from "@/design-system/components/Card";
import { Text } from "@/design-system/components/Text";
import { useTheme } from "@/design-system/ThemeProvider";
import { useAuth } from "@/ctx/AuthContext";
import DailyGoalRing from "@/components/ui/DailyGoalRing";
import { DailyGoalProgress, GOAL_PRESETS } from "@/lib/types/daily-goal";
import { setDailyGoal } from "@/lib/services/daily-goal-service";
import Ionicons from "@expo/vector-icons/Ionicons";

interface DailyGoalWidgetProps {
  goalProgress: DailyGoalProgress | null;
  onGoalChanged?: () => void;
}

export default function DailyGoalWidget({
  goalProgress,
  onGoalChanged,
}: DailyGoalWidgetProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [showPicker, setShowPicker] = useState(false);

  const progress = goalProgress
    ? goalProgress.progress / goalProgress.config.target
    : 0;
  const current = goalProgress?.progress ?? 0;
  const target = goalProgress?.config.target ?? 1;
  const completed = goalProgress?.completed ?? false;

  const handleSelectGoal = async (target: number) => {
    await setDailyGoal({ type: "lessons", target }, user?.id);
    setShowPicker(false);
    onGoalChanged?.();
  };

  return (
    <Card variant="elevated" style={styles.card}>
      <TouchableOpacity
        style={styles.container}
        onPress={() => setShowPicker(!showPicker)}
        activeOpacity={0.7}
      >
        <DailyGoalRing progress={progress} size={80} strokeWidth={6}>
          {completed ? (
            <Ionicons name="checkmark-circle" size={32} color={colors.success} />
          ) : (
            <Text style={[styles.ringText, { color: colors.text }]}>
              {current}/{target}
            </Text>
          )}
        </DailyGoalRing>
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {completed ? "Goal Complete!" : "Daily Goal"}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {completed
              ? "Great work today!"
              : `${current} of ${target} lessons today`}
          </Text>
        </View>
      </TouchableOpacity>

      {showPicker && (
        <View style={[styles.picker, { borderTopColor: colors.border }]}>
          <Text style={[styles.pickerLabel, { color: colors.textSecondary }]}>
            Set daily goal:
          </Text>
          <View style={styles.presetRow}>
            {GOAL_PRESETS.map((preset) => (
              <TouchableOpacity
                key={preset.target}
                style={[
                  styles.presetButton,
                  {
                    backgroundColor:
                      target === preset.target
                        ? colors.primary
                        : colors.backgroundSecondary,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => handleSelectGoal(preset.target)}
              >
                <Text
                  style={[
                    styles.presetText,
                    {
                      color:
                        target === preset.target
                          ? colors.textInverse
                          : colors.text,
                    },
                  ]}
                >
                  {preset.target} {preset.target === 1 ? "lesson" : "lessons"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  ringText: {
    fontSize: 16,
    fontWeight: "700",
  },
  picker: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  pickerLabel: {
    fontSize: 13,
    marginBottom: 8,
  },
  presetRow: {
    flexDirection: "row",
    gap: 8,
  },
  presetButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  presetText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
