import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Card } from "@/design-system/components/Card";
import { Text } from "@/design-system/components/Text";
import { useTheme } from "@/design-system/ThemeProvider";
import { useAuth } from "@/ctx/AuthContext";
import { useLanguage } from "@/ctx/LanguageContext";
import { getAllProgress } from "@/lib/services/progress-service";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function ContinueLearningWidget() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { activePack } = useLanguage();
  const [nextLesson, setNextLesson] = useState<{
    lessonId: string;
    lessonTitle: string;
    chapterTitle: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function findNextLesson() {
      if (!activePack) {
        setLoading(false);
        return;
      }

      try {
        const progress = await getAllProgress(user?.id);

        // Find first lesson with 0 completions
        for (const chapter of activePack.chapters) {
          for (const lesson of chapter.lessons) {
            if (!progress[lesson.id] || progress[lesson.id] === 0) {
              setNextLesson({
                lessonId: lesson.id,
                lessonTitle: lesson.title,
                chapterTitle: chapter.title,
              });
              setLoading(false);
              return;
            }
          }
        }

        // All completed — suggest the one with lowest completion count for review
        let lowestCount = Infinity;
        let reviewLesson = null;
        for (const chapter of activePack.chapters) {
          for (const lesson of chapter.lessons) {
            const count = progress[lesson.id] ?? 0;
            if (count < lowestCount) {
              lowestCount = count;
              reviewLesson = {
                lessonId: lesson.id,
                lessonTitle: lesson.title,
                chapterTitle: chapter.title,
              };
            }
          }
        }
        setNextLesson(reviewLesson);
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }

    void findNextLesson();
  }, [activePack, user?.id]);

  if (loading || !nextLesson) return null;

  return (
    <Card variant="outlined" style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="book-outline" size={20} color={colors.primary} />
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Continue Learning
        </Text>
      </View>
      <Text style={styles.lessonTitle}>{nextLesson.lessonTitle}</Text>
      <Text style={[styles.chapterName, { color: colors.textSecondary }]}>
        {nextLesson.chapterTitle}
      </Text>
      <TouchableOpacity
        style={[styles.continueButton, { backgroundColor: colors.primary }]}
        onPress={() =>
          router.push(`/practise?lessonId=${nextLesson.lessonId}`)
        }
      >
        <Text style={[styles.buttonText, { color: colors.textInverse }]}>
          Continue
        </Text>
        <Ionicons name="arrow-forward" size={16} color={colors.textInverse} />
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
  },
  lessonTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 4,
  },
  chapterName: {
    fontSize: 14,
    marginBottom: 12,
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
