import { Term } from "@/constants/ContentTypes";
import { useTheme } from "@/design-system/ThemeProvider";
import { useAccessibility } from "@/ctx/AccessibilityContext";
import { useLanguage } from "@/ctx/LanguageContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Speech from "expo-speech";
import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/design-system/components/Text";

interface TooltipState {
  visible: boolean;
  text: string;
  x: number;
  y: number;
  width: number;
}

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

const CARD_MAX_HEIGHT = SCREEN_HEIGHT * 0.75;
const CARD_MIN_HEIGHT = 90;
const OPEN_POSITION = 0;
const CLOSED_POSITION = CARD_MAX_HEIGHT - CARD_MIN_HEIGHT;

export default function SentenceBreakdownCard({
  sentence,
  disabled,
}: {
  sentence: {
    translation: string;
    romanization?: string;
    nativeScript: string;
    words: Term[];
    breakdown: string;
  };
  disabled?: boolean;
}) {
  const { colors } = useTheme();
  const { activeLanguage, hasRomanization: hasRoman, getNativeScriptLabel, getRomanizationLabel } = useLanguage();
  const { preferences } = useAccessibility();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(CLOSED_POSITION);
  const context = useSharedValue({ y: 0 });
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const cardRef = useRef<Animated.View>(null);
  const tooltipWidthRef = useRef<number>(0);
  const nativeScriptWordRefs = useRef<Array<View | null>>([]);
  const romanizationWordRefs = useRef<Array<View | null>>([]);
  const [selectedWord, setSelectedWord] = useState<{
    type: "nativeScript" | "romanization";
    index: number;
  } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const romanizationLabel = getRomanizationLabel() ?? "Romanization";
  const nativeScriptLabel = getNativeScriptLabel();

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const closeCard = () => {
    "worklet";
    translateY.value = withSpring(CLOSED_POSITION, {
      damping: 30,
      stiffness: 200,
      mass: 1,
    });
  };

  const openCard = () => {
    "worklet";
    translateY.value = withSpring(OPEN_POSITION, {
      damping: 30,
      stiffness: 200,
      mass: 1,
    });
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      translateY.value = context.value.y + event.translationY;
      translateY.value = Math.max(translateY.value, OPEN_POSITION);
    })
    .onEnd(() => {
      if (translateY.value > CLOSED_POSITION / 2) {
        closeCard();
      } else {
        openCard();
      }
    });

  const hideTooltip = () => {
    setTooltip(null);
    setSelectedWord(null);
  };

  const playAudio = () => {
    if (isPlaying) {
      Speech.stop();
      setIsPlaying(false);
      return;
    }

    const text = sentence.nativeScript || sentence.romanization || "";
    if (!text) return;

    setIsPlaying(true);
    Speech.speak(text, {
      language: activeLanguage.ttsCode,
      rate: preferences.audioSpeed,
      onDone: () => setIsPlaying(false),
      onStopped: () => setIsPlaying(false),
      onError: () => setIsPlaying(false),
    });
  };

  const showTooltip = (word: Term, type: "nativeScript" | "romanization", index: number) => {
    const wordRef =
      type === "nativeScript"
        ? nativeScriptWordRefs.current[index]
        : romanizationWordRefs.current[index];
    if (!wordRef) return;

    wordRef.measureInWindow((wordX, wordY, wordWidth) => {
      cardRef.current?.measureInWindow((cardX, cardY) => {
        setTooltip({
          visible: true,
          text: word.translation,
          x: wordX + wordWidth / 2,
          y: wordY - cardY,
          width: wordWidth,
        });
        setSelectedWord({ type, index });
      });
    });
  };

  const renderInteractiveSentence = (type: "nativeScript" | "romanization") => (
    <Pressable onPress={hideTooltip}>
      <View style={styles.interactiveSentenceContainer}>
        {sentence.words.map((word, index) => (
          <Pressable
            key={index}
            ref={(ref) => {
              if (type === "nativeScript") nativeScriptWordRefs.current[index] = ref;
              else romanizationWordRefs.current[index] = ref;
            }}
            onPress={() => showTooltip(word, type, index)}
          >
            <Text
              style={[
                type === "nativeScript"
                  ? [styles.nativeScriptValue, { color: colors.text }]
                  : [styles.romanizationValue, { color: colors.text }],
                selectedWord &&
                  selectedWord.type === type &&
                  selectedWord.index === index && [
                    styles.selectedWord,
                    { textDecorationColor: colors.primary },
                  ],
              ]}
            >
              {type === "nativeScript" ? word.nativeScript : word.romanization}{" "}
            </Text>
          </Pressable>
        ))}
      </View>
    </Pressable>
  );

  const cardInner = (
    <Animated.View
      ref={cardRef}
      pointerEvents={disabled ? "none" : "auto"}
      style={[
        styles.cardContainer,
        {
          height: CARD_MAX_HEIGHT + insets.bottom,
          paddingBottom: insets.bottom,
          opacity: disabled ? 0.6 : 1,
          backgroundColor: colors.background,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
        animatedStyle,
      ]}
    >
      <Pressable style={{ flex: 1 }} onPress={hideTooltip}>
        <Pressable
          onPress={() => {
            if (translateY.value === OPEN_POSITION) {
              closeCard();
            } else {
              openCard();
            }
          }}
          style={styles.handleContainer}
        >
          <View style={[styles.handle, { backgroundColor: colors.border }]}></View>
        </Pressable>

        <View style={styles.peekContent}>
          <Ionicons name="help-circle-outline" size={24} color={colors.textTertiary} />
          <Text style={[styles.peekText, { color: colors.textSecondary }]}>
            Swipe up for detailed help
          </Text>
        </View>

        <ScrollView
          style={styles.fullContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.title, { color: colors.text }]}>Sentence Breakdown</Text>

          <View style={styles.wordHintContainer}>
            <Text style={[styles.wordHintText, { color: colors.textSecondary }]}>
              Tap any word to see its meaning
            </Text>
          </View>

          {hasRoman() && sentence.romanization && (
            <View style={styles.breakdownItem}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>{romanizationLabel}:</Text>
                <Pressable
                  onPress={playAudio}
                  disabled={disabled}
                  style={[
                    styles.playButton,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.primaryLight,
                    },
                  ]}
                  hitSlop={8}
                >
                  <Ionicons
                    name={isPlaying ? "pause" : "play"}
                    size={20}
                    color={colors.primary}
                  />
                </Pressable>
              </View>
              {renderInteractiveSentence("romanization")}
            </View>
          )}
          <View style={styles.breakdownItem}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{nativeScriptLabel}:</Text>
              {!hasRoman() && (
                <Pressable
                  onPress={playAudio}
                  disabled={disabled}
                  style={[
                    styles.playButton,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.primaryLight,
                    },
                  ]}
                  hitSlop={8}
                >
                  <Ionicons
                    name={isPlaying ? "pause" : "play"}
                    size={20}
                    color={colors.primary}
                  />
                </Pressable>
              )}
            </View>
            {renderInteractiveSentence("nativeScript")}
          </View>
          <View style={styles.breakdownItem}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Translation:</Text>
            <Text style={[styles.translationValue, { color: colors.text }]}>
              {sentence.translation}
            </Text>
          </View>
          <View style={styles.breakdownItem}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Breakdown:</Text>
            <Text style={[styles.breakdownText, { color: colors.text }]}>
              {sentence.breakdown}
            </Text>
          </View>
        </ScrollView>
      </Pressable>

      {tooltip?.visible && (
        <View
          style={[
            styles.tooltipContainer,
            {
              top: tooltip.y - 48,
              left: Math.max(
                8,
                Math.min(
                  tooltip.x - tooltipWidthRef.current / 2,
                  SCREEN_WIDTH - tooltipWidthRef.current - 8,
                ),
              ),
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
            },
          ]}
          onLayout={(e) => {
            tooltipWidthRef.current = e.nativeEvent.layout.width;
          }}
        >
          <Text style={[styles.tooltipText, { color: colors.text }]}>{tooltip.text}</Text>
        </View>
      )}
    </Animated.View>
  );

  if (disabled) {
    return cardInner;
  }

  return <GestureDetector gesture={panGesture}>{cardInner}</GestureDetector>;
}

const styles = StyleSheet.create({
  cardContainer: {
    position: "absolute",
    bottom: -CARD_MIN_HEIGHT,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 0,
  },
  handleContainer: {
    alignItems: "center",
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
  },
  peekContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 10,
  },
  peekText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
  },
  fullContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  breakdownItem: {
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    textTransform: "uppercase",
  },
  interactiveSentenceContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  romanizationValue: {
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 30,
  },
  nativeScriptValue: {
    fontSize: 22,
    lineHeight: 34,
  },
  translationValue: {
    fontSize: 18,
    lineHeight: 26,
  },
  breakdownText: {
    fontSize: 16,
    lineHeight: 24,
  },
  tooltipContainer: {
    position: "absolute",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    marginBottom: 6,
    borderWidth: 1,
  },
  tooltipText: {
    fontSize: 14,
    textAlign: "center",
  },
  selectedWord: {
    borderWidth: 0,
    borderColor: "transparent",
    borderRadius: 0,
    paddingHorizontal: 2,
    textDecorationLine: "underline",
    textDecorationStyle: "solid",
  },
  wordHintContainer: {
    marginBottom: 20,
  },
  wordHintText: {
    fontSize: 13,
    fontStyle: "italic",
  },
  playButton: {
    marginLeft: 12,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
