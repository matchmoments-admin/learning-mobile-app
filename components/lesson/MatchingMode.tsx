import React, { useMemo, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "@/design-system/components/Text";
import { useTheme } from "@/design-system/ThemeProvider";
import { MatchingQuestion } from "@/constants/ContentTypes";

interface MatchingModeProps {
  question: MatchingQuestion;
  onComplete: (allCorrect: boolean) => void;
  disabled: boolean;
}

export default function MatchingMode({
  question,
  onComplete,
  disabled,
}: MatchingModeProps) {
  const { colors } = useTheme();

  // Shuffle right column once
  const shuffledRight = useMemo(() => {
    return [...question.pairs]
      .map((p) => ({ id: p.id, text: p.right }))
      .sort(() => Math.random() - 0.5);
  }, [question.pairs]);

  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matchedIds, setMatchedIds] = useState<Set<number>>(new Set());
  const [wrongFlash, setWrongFlash] = useState<{
    left: number;
    right: number;
  } | null>(null);
  const [mistakes, setMistakes] = useState(0);

  const handleLeftPress = (id: number) => {
    if (disabled || matchedIds.has(id)) return;
    setSelectedLeft(id);
  };

  const handleRightPress = (id: number) => {
    if (disabled || selectedLeft === null || matchedIds.has(id)) return;

    if (selectedLeft === id) {
      // Correct match
      const newMatched = new Set(matchedIds);
      newMatched.add(id);
      setMatchedIds(newMatched);
      setSelectedLeft(null);

      // Check if all matched
      if (newMatched.size === question.pairs.length) {
        onComplete(mistakes === 0);
      }
    } else {
      // Wrong match — flash
      setMistakes((m) => m + 1);
      setWrongFlash({ left: selectedLeft, right: id });
      setTimeout(() => {
        setWrongFlash(null);
        setSelectedLeft(null);
      }, 600);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>{question.prompt}</Text>
      <View style={styles.columns}>
        {/* Left column */}
        <View style={styles.column}>
          {question.pairs.map((pair) => {
            const isMatched = matchedIds.has(pair.id);
            const isSelected = selectedLeft === pair.id;
            const isWrong = wrongFlash?.left === pair.id;

            return (
              <TouchableOpacity
                key={`l-${pair.id}`}
                style={[
                  styles.item,
                  {
                    backgroundColor: isMatched
                      ? colors.success + "20"
                      : isWrong
                        ? colors.error + "20"
                        : isSelected
                          ? colors.primary + "20"
                          : colors.backgroundSecondary,
                    borderColor: isMatched
                      ? colors.success
                      : isWrong
                        ? colors.error
                        : isSelected
                          ? colors.primary
                          : colors.border,
                    opacity: isMatched ? 0.5 : 1,
                  },
                ]}
                onPress={() => handleLeftPress(pair.id)}
                disabled={disabled || isMatched}
                accessibilityRole="button"
                accessibilityLabel={`Select: ${pair.left}`}
                accessibilityState={{ selected: isSelected, disabled: disabled || isMatched }}
                accessibilityHint={isMatched ? "Already matched" : "Tap to select, then tap matching item on the right"}
              >
                <Text
                  style={[
                    styles.itemText,
                    { color: isMatched ? colors.success : colors.text },
                  ]}
                >
                  {pair.left}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Right column (shuffled) */}
        <View style={styles.column}>
          {shuffledRight.map((item) => {
            const isMatched = matchedIds.has(item.id);
            const isWrong = wrongFlash?.right === item.id;

            return (
              <TouchableOpacity
                key={`r-${item.id}`}
                style={[
                  styles.item,
                  {
                    backgroundColor: isMatched
                      ? colors.success + "20"
                      : isWrong
                        ? colors.error + "20"
                        : colors.backgroundSecondary,
                    borderColor: isMatched
                      ? colors.success
                      : isWrong
                        ? colors.error
                        : colors.border,
                    opacity: isMatched ? 0.5 : 1,
                  },
                ]}
                onPress={() => handleRightPress(item.id)}
                disabled={disabled || isMatched}
                accessibilityRole="button"
                accessibilityLabel={`Match with: ${item.text}`}
                accessibilityState={{ disabled: disabled || isMatched }}
                accessibilityHint={isMatched ? "Already matched" : "Tap to match with selected item"}
              >
                <Text
                  style={[
                    styles.itemText,
                    { color: isMatched ? colors.success : colors.text },
                  ]}
                >
                  {item.text}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  prompt: {
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
  },
  columns: {
    flexDirection: "row",
    gap: 12,
  },
  column: {
    flex: 1,
    gap: 8,
  },
  item: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
  },
  itemText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
