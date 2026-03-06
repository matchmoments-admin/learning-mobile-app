import { Term } from "@/constants/ContentTypes";
import { useLanguage } from "@/ctx/LanguageContext";
import { useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "../themed-text";

export default function Flashcard({
  word,
  direction,
}: {
  word: Term;
  direction: "native-to-translation" | "translation-to-native";
}) {
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
        <ThemedText
          style={[styles.romanization, isBack && styles.backText]}
        >
          {word.romanization}
        </ThemedText>
      )}
      <ThemedText
        style={[styles.nativeScript, isBack && styles.backText]}
      >
        {word.nativeScript}
      </ThemedText>
    </View>
  );

  const TranslationContent = ({ isBack }: { isBack?: boolean }) => (
    <ThemedText
      style={[
        isBack ? styles.translationBack : styles.translationFront,
        isBack && styles.backText,
      ]}
    >
      {word.translation}
    </ThemedText>
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
          style={[styles.card, styles.cardFront, frontAnimatedStyle]}
        >
          {FrontContent()}
        </Animated.View>
        <Animated.View
          style={[styles.card, styles.cardBack, backAnimatedStyle]}
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  cardFront: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
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
  backText: {
    color: "white",
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
