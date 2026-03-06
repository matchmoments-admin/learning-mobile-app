import { SpeakingOption } from "@/constants/ContentTypes";
import { Colors } from "@/constants/theme";
import { useLanguage } from "@/ctx/LanguageContext";
import { useState } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "../themed-text";

export default function SingleResponseMode({
  option,
  optionSelectionAnim,
}: {
  option: SpeakingOption;
  optionSelectionAnim: Animated.Value;
}) {
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
          <ThemedText style={styles.sayItPrompt}>
            Record this response in {activeLanguage.displayName}
          </ThemedText>
        </Animated.View>
      </View>
      <View
        style={[styles.singleResponseContainer, { backgroundColor: "#ffffff" }]}
      >
        <ThemedText style={styles.singleResponseTranslation}>
          {option.translation}
        </ThemedText>
        <TouchableOpacity
          style={styles.revealButton}
          onPress={() => setShowAnswer((v) => !v)}
          hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
          accessibilityRole="button"
          accessibilityLabel={showAnswer ? "Hide answer" : "Reveal how to say it"}
          accessibilityHint="Tap to toggle the answer"
        >
          {!showAnswer ? (
            <ThemedText style={styles.instructionText}>
              Tap here to reveal how to say it
            </ThemedText>
          ) : (
            <View style={styles.singleResponsePhrase}>
              {hasRomanization() && option.phrase.romanization && (
                <ThemedText style={styles.optionDetailsRomanization}>
                  {option.phrase.romanization}
                </ThemedText>
              )}
              <ThemedText
                style={[
                  styles.optionDetailsNativeScript,
                  { color: Colors.subduedTextColor },
                ]}
              >
                {option.phrase.nativeScript}
              </ThemedText>
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
    color: Colors.primaryAccentColor,
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
    color: Colors.subduedTextColor,
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
    borderColor: Colors.primaryAccentColor,
    overflow: "visible",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
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
