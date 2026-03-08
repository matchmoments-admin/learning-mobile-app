import React from "react";
import { StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/design-system/ThemeProvider";
import { Text } from "@/design-system/components/Text";
import { Card } from "@/design-system/components/Card";
import { useAuth } from "@/ctx/AuthContext";
import { useXpState } from "@/hooks/useXpState";
import { useStreakState } from "@/hooks/useStreakState";
import { useDailyGoalProgress } from "@/hooks/useDailyGoalProgress";
import DailyGoalWidget from "@/components/home/DailyGoalWidget";
import StreakWidget from "@/components/home/StreakWidget";
import XpSummaryWidget from "@/components/home/XpSummaryWidget";
import ContinueLearningWidget from "@/components/home/ContinueLearningWidget";
import ReviewWidget from "@/components/home/ReviewWidget";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const { profile } = useAuth();
  const { xpState } = useXpState();
  const { streakState } = useStreakState();
  const { goalProgress, refresh: refreshGoal } = useDailyGoalProgress();

  const firstName = profile?.full_name?.split(" ")[0] ?? "";

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top", "left", "right"]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>
            {getGreeting()}, {firstName}
          </Text>
        </View>

        {/* Daily Goal — prominent */}
        <DailyGoalWidget
          goalProgress={goalProgress}
          onGoalChanged={refreshGoal}
        />

        {/* Stats Row */}
        <Card variant="outlined" style={styles.statsCard}>
          <View style={styles.statsRow}>
            <StreakWidget streakState={streakState} />
          </View>
          <View style={styles.xpSection}>
            <XpSummaryWidget xpState={xpState} />
          </View>
        </Card>

        {/* Continue Learning */}
        <ContinueLearningWidget />

        {/* Review Widget */}
        <ReviewWidget />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 80,
  },
  greeting: {
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: "700",
  },
  statsCard: {
    marginBottom: 16,
  },
  statsRow: {
    marginBottom: 12,
  },
  xpSection: {
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
});
