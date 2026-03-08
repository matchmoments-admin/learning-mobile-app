import { SpeakingOption } from "@/constants/ContentTypes";
import { useTheme } from "@/design-system/ThemeProvider";
import { useLanguage } from "@/ctx/LanguageContext";
import { useState } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "@/design-system/components/Text";

export default function SingleResponseMode({
  option,
  optionSelectionAnim,
}: {
  option: SpeakingOption;
  optionSelectionAnim: Animated.Value;
}) {
  const { colors } = useTheme();
  const [showAnswer, setShowAnswer] = useState(false);
  const { activeLanguage, hasRomanization } = useLanguage();

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.promptContainer}>
        <Animated.View
          style={[
            styles.sayItPromptContainer,
            {
              opacity: optionSelectionAnim,
              transform: [
                {
                  translateY: optionSelectionAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={[styles.sayItPrompt, { color: colors.primary }]}>
            Record this response in {activeLanguage.displayName}
          </Text>
        </Animated.View>
      </View>
      <View
        style={[
          styles.singleResponseContainer,
          {
            backgroundColor: colors.card,
            borderColor: colors.primary,
            ...Platform.select({
              ios: {
                shadowColor: colors.shadow,
              },
            }),
          },
        ]}
      >
        <Text style={styles.singleResponseTranslation}>
          {option.translation}
        </Text>
        <TouchableOpacity
          style={styles.revealButton}
          onPress={() => setShowAnswer((v) => !v)}
          hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
          accessibilityRole="button"
          accessibilityLabel={showAnswer ? "Hide answer" : "Reveal how to say it"}
          accessibilityHint="Tap to toggle the answer"
        >
          {!showAnswer ? (
            <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
              Tap here to reveal how to say it
            </Text>
          ) : (
            <View style={styles.singleResponsePhrase}>
              {hasRomanization() && option.phrase.romanization && (
                <Text style={styles.optionDetailsRomanization}>
                  {option.phrase.romanization}
                </Text>
              )}
              <Text
                style={[
                  styles.optionDetailsNativeScript,
                  { color: colors.textSecondary },
                ]}
              >
                {option.phrase.nativeScript}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  promptContainer: {
    justifyContent: "center",
    alignItems: "center",
    minHeight: 50,
  },
  sayItPromptContainer: {
    position: "absolute",
    bottom: 20,
  },
  sayItPrompt: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  revealButton: {
    marginBottom: 8,
    marginTop: 16,
    alignItems: "center",
  },
  instructionText: {
    fontSize: 16,
    textAlign: "center",
  },
  optionDetailsNativeScript: {
    fontSize: 16,
    marginBottom: 4,
  },
  optionDetailsRomanization: {
    fontSize: 18,
    fontWeight: "bold",
  },
  singleResponseContainer: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    overflow: "visible",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  singleResponseTranslation: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  singleResponsePhrase: {
    alignItems: "center",
    marginTop: 12,
  },
});
