import { useTheme } from "@/design-system/ThemeProvider";
import { useAccessibility } from "@/ctx/AccessibilityContext";
import { useLanguage } from "@/ctx/LanguageContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { Text } from "@/design-system/components/Text";
import { ScoreBreakdown } from "@/lib/types/scoring";
import { LessonStats } from "./LessonContent";

export default function LessonCompleteScreen({
  lessonStats,
  scoreBreakdown,
  xpEarned,
  onContinue,
  onReview,
}: {
  lessonStats: LessonStats;
  scoreBreakdown?: ScoreBreakdown;
  xpEarned?: number;
  onContinue: () => void;
  onReview: () => void;
}) {
  const { colors } = useTheme();
  const { hasRomanization } = useLanguage();
  const { shouldAnimate } = useAccessibility();
  const confettiRef = useRef<any>(null);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (shouldAnimate()) {
      setTimeout(() => {
        confettiRef.current?.start();
      }, 400);
    }

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getPerformanceMessage = () => {
    if (lessonStats.accuracy >= 90) return "Outstanding! 🌟";
    if (lessonStats.accuracy >= 75) return "Great work! 🎉";
    if (lessonStats.accuracy >= 60) return "Good effort! 💪";
    return "Keep practicing! 📚";
  };

  const getPerformanceColor = () => {
    if (lessonStats.accuracy >= 90) return colors.warning;
    if (lessonStats.accuracy >= 75) return colors.success;
    if (lessonStats.accuracy >= 60) return colors.primary;
    return colors.textSecondary;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        style={styles.gradient}
        colors={["#ffffff", "#f9fafb", "#f3f4f6"]}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.badgeContainer,
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          <LinearGradient
            colors={[colors.primary, "#ff6b35"]}
            style={[
              styles.badgeGradient,
              {
                shadowColor: colors.primary,
              },
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="trophy" size={56} color={colors.textInverse} />
          </LinearGradient>
          <Text style={styles.completeTitle}>Lesson Complete!</Text>
          <Text style={styles.performanceMessage}>
            {getPerformanceMessage()}
          </Text>
        </Animated.View>

        {/* XP Earned + Star Rating */}
        {(xpEarned != null && xpEarned > 0 || scoreBreakdown) && (
          <Animated.View
            style={[
              styles.xpStarRow,
              { opacity: fadeAnim },
            ]}
          >
            {xpEarned != null && xpEarned > 0 && (
              <View style={[styles.xpBadge, { backgroundColor: colors.warning + "20" }]}>
                <Ionicons name="star" size={20} color={colors.warning} />
                <Text style={[styles.xpBadgeText, { color: colors.warning }]}>
                  +{xpEarned} XP
                </Text>
              </View>
            )}
            {scoreBreakdown && (
              <View style={styles.starRow}>
                {[1, 2, 3].map((i) => (
                  <Ionicons
                    key={i}
                    name={i <= scoreBreakdown.stars ? "star" : "star-outline"}
                    size={28}
                    color={colors.warning}
                  />
                ))}
              </View>
            )}
          </Animated.View>
        )}

        {/* Accuracy Card */}
        <Animated.View
          style={[
            styles.accuracyCard,
            {
              opacity: fadeAnim,
              backgroundColor: colors.card,
              borderColor: colors.border,
              shadowColor: colors.shadow,
            },
          ]}
        >
          <View
            style={[
              styles.accuracyIcon,
              { backgroundColor: getPerformanceColor() + "20" },
            ]}
          >
            <Ionicons
              name="checkmark-circle"
              size={40}
              color={getPerformanceColor()}
            />
          </View>
          <View style={styles.accuracyText}>
            <Text style={styles.accuracyValue}>
              {lessonStats.accuracy}%
            </Text>
            <Text
              style={[styles.accuracyLabel, { color: colors.textSecondary }]}
            >
              {lessonStats.correctAnswers}/{lessonStats.totalQuestions} correct
            </Text>
            {scoreBreakdown && (
              <View style={styles.scoreBreakdown}>
                <Text style={[styles.breakdownItem, { color: colors.textSecondary }]}>
                  Accuracy: {scoreBreakdown.accuracyScore}/70
                </Text>
                {scoreBreakdown.retryPenalty > 0 && (
                  <Text style={[styles.breakdownItem, { color: colors.error }]}>
                    Retry penalty: -{scoreBreakdown.retryPenalty}
                  </Text>
                )}
                <Text style={[styles.breakdownItem, { color: colors.text }]}>
                  Score: {scoreBreakdown.totalScore}/100
                </Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Questions to review */}
        {lessonStats.wrongQuestions &&
          lessonStats.wrongQuestions.length > 0 && (
            <Animated.View style={[styles.wrongSection, { opacity: fadeAnim }]}>
              <View style={styles.wrongHeader}>
                <Ionicons name="alert-circle" size={24} color={colors.error} />
                <Text style={styles.wrongTitle}>
                  Questions to Review
                </Text>
              </View>
              <Text
                style={[
                  styles.wrongSubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                Focus on these for improvement
              </Text>

              {lessonStats.wrongQuestions.map((question, index) => (
                <View
                  key={index}
                  style={[
                    styles.wrongQuestionCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.error + "33",
                      shadowColor: colors.error,
                    },
                  ]}
                >
                  <View style={styles.wrongIndicator}>
                    <Ionicons name="close-circle" size={20} color={colors.error} />
                  </View>
                  <View style={styles.questionContent}>
                    <Text style={styles.questionTranslation}>
                      {question.translation}
                    </Text>
                    <View style={styles.questionPhrase}>
                      {hasRomanization() && question.romanization && (
                        <Text style={styles.questionRomanization}>
                          {question.romanization}
                        </Text>
                      )}
                      <Text
                        style={[
                          styles.questionNativeScript,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {question.nativeScript}
                      </Text>
                    </View>
                  </View>
                  {question.attempts > 0 && (
                    <View style={[styles.attemptsIndicator, { backgroundColor: colors.errorLight }]}>
                      <Ionicons name="refresh" size={16} color={colors.error} />
                      <Text
                        style={[styles.attemptsText, { color: colors.error }]}
                      >
                        {question.attempts}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </Animated.View>
          )}
      </ScrollView>

      {/* Action Buttons */}
      <Animated.View
        style={[
          styles.actionButtons,
          {
            opacity: fadeAnim,
            backgroundColor: colors.card,
            borderTopColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.primaryButton, { shadowColor: colors.primary }]}
          onPress={onContinue}
        >
          <LinearGradient
            colors={[colors.primary, "#ff6b35"]}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={[styles.primaryButtonText, { color: colors.textInverse }]}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.textInverse} />
          </LinearGradient>
        </TouchableOpacity>

        {lessonStats.wrongQuestions &&
          lessonStats.wrongQuestions.length > 0 && (
            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: colors.border }]}
              onPress={onReview}
            >
              <Ionicons
                name="refresh-outline"
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
                Practice Again
              </Text>
            </TouchableOpacity>
          )}
      </Animated.View>

      {shouldAnimate() && (
        <ConfettiCannon
          ref={confettiRef}
          count={200}
          origin={{ x: -10, y: 0 }}
          autoStart={false}
          fadeOut={true}
          fallSpeed={4000}
          explosionSpeed={350}
          colors={[
            colors.primary,
            "#ff6b35",
            "#FFD700",
            "#34C759",
            "#FF9F0A",
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 180,
  },
  badgeContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  badgeGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  completeTitle: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  performanceMessage: {
    fontSize: 16,
    textAlign: "center",
  },
  xpStarRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginBottom: 20,
  },
  xpBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  xpBadgeText: {
    fontSize: 16,
    fontWeight: "700",
  },
  starRow: {
    flexDirection: "row",
    gap: 4,
  },
  scoreBreakdown: {
    marginTop: 8,
    gap: 2,
  },
  breakdownItem: {
    fontSize: 13,
  },
  accuracyCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 24,
    borderRadius: 20,
    borderWidth: 2,
    marginBottom: 32,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  accuracyIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 20,
  },
  accuracyText: {
    flex: 1,
  },
  accuracyValue: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4,
  },
  accuracyLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  wrongSection: {
    marginBottom: 32,
  },
  wrongHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  wrongTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  wrongSubtitle: {
    fontSize: 15,
    marginBottom: 16,
  },
  wrongQuestionCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  wrongIndicator: {
    marginRight: 12,
    marginTop: 2,
  },
  questionContent: {
    flex: 1,
    marginRight: 12,
  },
  questionTranslation: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 8,
  },
  questionPhrase: {
    gap: 4,
  },
  questionRomanization: {
    fontSize: 16,
    fontWeight: "600",
  },
  questionNativeScript: {
    fontSize: 15,
  },
  attemptsIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  attemptsText: {
    fontSize: 14,
    fontWeight: "700",
  },
  actionButtons: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 10,
    gap: 12,
    borderTopWidth: 1,
  },
  primaryButton: {
    borderRadius: 20,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "700",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 20,
    borderWidth: 2,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
