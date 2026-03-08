import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Card } from "@/design-system/components/Card";
import { Text } from "@/design-system/components/Text";
import { useTheme } from "@/design-system/ThemeProvider";
import { useAuth } from "@/ctx/AuthContext";
import { getDueForReview } from "@/lib/services/mastery-service";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function ReviewWidget() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [dueCount, setDueCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const due = await getDueForReview(user?.id);
        setDueCount(due.length);
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [user?.id]);

  if (loading || dueCount === 0) return null;

  return (
    <Card variant="filled" style={styles.card}>
      <View style={styles.row}>
        <View style={[styles.iconBg, { backgroundColor: colors.warning + "20" }]}>
          <Ionicons name="refresh-circle" size={24} color={colors.warning} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Review Due</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {dueCount} {dueCount === 1 ? "term" : "terms"} ready for review
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
  },
});
