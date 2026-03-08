import { SpeakingOption } from "@/constants/ContentTypes";
import { useTheme } from "@/design-system/ThemeProvider";
import { useLanguage } from "@/ctx/LanguageContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "@/design-system/components/Text";

export function FeedbackView({
  correctOption,
  isCorrect,
  onContinue,
  onRetry,
  attemptCount,
  maxAttempts,
  transcription,
}: {
  correctOption: SpeakingOption;
  isCorrect: boolean | null;
  onContinue: () => void;
  onRetry?: () => void;
  attemptCount: number;
  maxAttempts: number;
  transcription?: {
    expected: string;
    said: string;
  };
}) {
  const { colors } = useTheme();
  const { hasRomanization } = useLanguage();
  const showRetryButton = onRetry && !isCorrect && attemptCount < maxAttempts;
  const showCorrectAnswer = !isCorrect && attemptCount >= maxAttempts;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isCorrect ? colors.successLight : colors.errorLight,
          borderColor: isCorrect ? colors.success : colors.error,
          shadowColor: colors.shadow,
        },
      ]}
    >
      <View style={styles.header}>
        <Ionicons
          name={isCorrect ? "checkmark-circle" : "close-circle"}
          size={40}
          color={isCorrect ? colors.success : colors.error}
        />
        <View style={styles.headerText}>
          <Text style={styles.title}>
            {isCorrect
              ? "Great job!"
              : showRetryButton
                ? "Not quite"
                : "Keep practising"}
          </Text>
          {!isCorrect && showRetryButton && (
            <Text
              style={[styles.subtitle, { color: colors.textSecondary }]}
            >
              Try again - you've got this!
            </Text>
          )}
          {showCorrectAnswer && (
            <Text
              style={[styles.subtitle, { color: colors.textSecondary }]}
            >
              Here's what to say next time
            </Text>
          )}
        </View>
      </View>
      {/* Transcription feedback */}
      {transcription && (
        <View style={[styles.transcriptionContainer, { backgroundColor: colors.backgroundSecondary }]}>
          <View style={styles.transcriptionRow}>
            <Text style={[styles.transcriptionLabel, { color: colors.textSecondary }]}>Expected:</Text>
            <Text style={styles.transcriptionText}>
              {transcription.expected}
            </Text>
          </View>
          <View style={styles.transcriptionRow}>
            <Text style={[styles.transcriptionLabel, { color: colors.textSecondary }]}>You said:</Text>
            <Text
              style={[
                styles.transcriptionText,
                {
                  color: isCorrect ? colors.success : colors.error,
                },
              ]}
            >
              {transcription.said.charAt(0).toUpperCase() +
                transcription.said.slice(1)}
            </Text>
          </View>
        </View>
      )}

      {/* Show correct answer after max attempts */}
      {showCorrectAnswer && (
        <View style={[styles.correctAnswerSection, { backgroundColor: colors.primaryLight, borderColor: colors.primary + "4D" }]}>
          <View style={styles.correctAnswerHeader}>
            <Ionicons
              name="bulb-outline"
              size={20}
              color={colors.primary}
            />
            <Text style={[styles.correctAnswerLabel, { color: colors.primary }]}>
              Correct Response:
            </Text>
          </View>
          <View style={styles.correctAnswerContent}>
            <Text style={styles.correctAnswerTranslation}>
              {correctOption.translation}
            </Text>
            <View style={styles.correctAnswerPhrase}>
              {hasRomanization() && correctOption.phrase.romanization && (
                <Text style={styles.correctAnswerRomanization}>
                  {correctOption.phrase.romanization}
                </Text>
              )}
              <Text
                style={[
                  styles.correctAnswerNativeScript,
                  { color: colors.textSecondary },
                ]}
              >
                {correctOption.phrase.nativeScript}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Action buttons */}
      <View style={styles.buttonContainer}>
        {showRetryButton ? (
          <>
            <TouchableOpacity
              style={[styles.button, styles.retryButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
              onPress={onRetry}
            >
              <Ionicons name="refresh" size={20} color={colors.textInverse} />
              <Text style={[styles.retryButtonText, { color: colors.textInverse }]}>
                Try Again ({maxAttempts - attemptCount} left)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.skipButton,
                { borderColor: colors.textSecondary },
              ]}
              onPress={onContinue}
            >
              <Text
                style={[
                  styles.skipButtonText,
                  { color: colors.textSecondary },
                ]}
              >
                Skip
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.continueButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
            onPress={onContinue}
          >
            <Text style={[styles.continueButtonText, { color: colors.textInverse }]}>
              {isCorrect ? "Continue" : "Next Question"}
            </Text>
            <Ionicons name="arrow-forward" size={20} color={colors.textInverse} />
          </TouchableOpacity>
        )}
      </View>

      {/* Attempt indicator */}
      {!isCorrect && attemptCount > 0 && attemptCount < maxAttempts && (
        <View style={styles.attemptIndicator}>
          <View style={styles.attemptDots}>
            {Array.from({ length: maxAttempts }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.attemptDot,
                  {
                    backgroundColor:
                      i < attemptCount ? colors.error : colors.textTertiary + "4D",
                  },
                ]}
              ></View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    borderWidth: 2,
    padding: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 20,
  },
  correctAnswerSection: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  correctAnswerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  correctAnswerLabel: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  correctAnswerContent: {
    gap: 8,
  },
  correctAnswerTranslation: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  correctAnswerPhrase: {
    gap: 4,
  },
  correctAnswerRomanization: {
    fontSize: 18,
    fontWeight: "700",
  },
  correctAnswerNativeScript: {
    fontSize: 16,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
  },
  retryButton: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  skipButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  continueButton: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  attemptIndicator: {
    marginTop: 16,
    alignItems: "center",
  },
  attemptDots: {
    flexDirection: "row",
    gap: 8,
  },
  attemptDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  transcriptionContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  transcriptionRow: {
    flexDirection: "row",
  },
  transcriptionLabel: {
    width: 80,
    fontSize: 14,
    fontWeight: "600",
  },
  transcriptionText: {
    flex: 1,
    fontSize: 14,
  },
});
