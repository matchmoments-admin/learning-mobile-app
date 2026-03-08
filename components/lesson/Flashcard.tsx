import { Term } from "@/constants/ContentTypes";
import { useTheme } from "@/design-system/ThemeProvider";
import { useLanguage } from "@/ctx/LanguageContext";
import { useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/design-system/components/Text";

export default function Flashcard({
  word,
  direction,
}: {
  word: Term;
  direction: "native-to-translation" | "translation-to-native";
}) {
  const { colors } = useTheme();
  const { hasRomanization } = useLanguage();
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ["180deg", "360deg"],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  const flipToFront = () => {
    Animated.timing(flipAnimation, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
    setIsFlipped(false);
  };

  const flipToBack = () => {
    Animated.timing(flipAnimation, {
      toValue: 180,
      duration: 250,
      useNativeDriver: true,
    }).start();
    setIsFlipped(true);
  };

  const NativeContent = ({ isBack }: { isBack?: boolean }) => (
    <View style={styles.nativeContent}>
      {hasRomanization() && word.romanization && (
        <Text
          style={[styles.romanization, isBack && { color: colors.textInverse }]}
        >
          {word.romanization}
        </Text>
      )}
      <Text
        style={[styles.nativeScript, isBack && { color: colors.textInverse }]}
      >
        {word.nativeScript}
      </Text>
    </View>
  );

  const TranslationContent = ({ isBack }: { isBack?: boolean }) => (
    <Text
      style={[
        isBack ? styles.translationBack : styles.translationFront,
        isBack && { color: colors.textInverse },
      ]}
    >
      {word.translation}
    </Text>
  );

  const FrontContent = () => {
    if (direction === "translation-to-native") {
      return <TranslationContent />;
    }
    return <NativeContent />;
  };

  const BackContent = () => {
    if (direction === "translation-to-native") {
      return <NativeContent isBack />;
    }
    return <TranslationContent isBack />;
  };

  return (
    <Pressable
      onPress={isFlipped ? flipToFront : flipToBack}
      accessibilityRole="button"
      accessibilityLabel={isFlipped ? "Flashcard showing answer. Tap to flip back" : "Flashcard. Tap to reveal answer"}
    >
      <View>
        <Animated.View
          style={[
            styles.card,
            styles.cardFront,
            frontAnimatedStyle,
            {
              shadowColor: colors.shadow,
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          {FrontContent()}
        </Animated.View>
        <Animated.View
          style={[
            styles.card,
            styles.cardBack,
            backAnimatedStyle,
            {
              shadowColor: colors.shadow,
            },
          ]}
        >
          {BackContent()}
        </Animated.View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 340,
    maxHeight: 440,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backfaceVisibility: "hidden",
    borderRadius: 28,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  cardFront: {
    borderWidth: 1,
  },
  cardBack: {
    backgroundColor: "#1a1a2e",
    position: "absolute",
    top: 0,
  },
  nativeContent: {
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    width: "100%",
  },
  romanization: {
    fontSize: 40,
    lineHeight: 48,
    fontWeight: "600",
    textAlign: "center",
    maxWidth: "90%",
  },
  nativeScript: {
    fontSize: 30,
    lineHeight: 36,
    textAlign: "center",
    maxWidth: "90%",
  },
  translationFront: {
    fontSize: 40,
    lineHeight: 48,
    textAlign: "center",
    fontWeight: "600",
    maxWidth: "90%",
  },
  translationBack: {
    fontSize: 40,
    lineHeight: 48,
    textAlign: "center",
    fontStyle: "italic",
    maxWidth: "90%",
  },
});
