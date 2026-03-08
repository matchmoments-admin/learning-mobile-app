import React, { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { Text } from "@/design-system/components/Text";
import { useTheme } from "@/design-system/ThemeProvider";
import { FillInBlankQuestion } from "@/constants/ContentTypes";

interface FillInBlankModeProps {
  question: FillInBlankQuestion;
  onAnswer: (correct: boolean) => void;
  disabled: boolean;
}

export default function FillInBlankMode({
  question,
  onAnswer,
  disabled,
}: FillInBlankModeProps) {
  const { colors } = useTheme();
  const [answer, setAnswer] = useState("");
  const [selectedChip, setSelectedChip] = useState<string | null>(null);

  const checkAnswer = (value: string) => {
    const normalized = value.trim().toLowerCase();
    const correctNorm = question.correctAnswer.trim().toLowerCase();
    const acceptable = question.acceptableAnswers?.map((a) =>
      a.trim().toLowerCase(),
    );

    return (
      normalized === correctNorm ||
      (acceptable?.includes(normalized) ?? false)
    );
  };

  const handleSubmit = () => {
    const value = selectedChip ?? answer;
    if (!value.trim()) return;
    onAnswer(checkAnswer(value));
  };

  const handleChipPress = (chip: string) => {
    if (disabled) return;
    setSelectedChip(chip);
    onAnswer(checkAnswer(chip));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>{question.prompt}</Text>

      <View style={[styles.sentenceCard, { backgroundColor: colors.backgroundSecondary }]}>
        <Text style={styles.sentenceNative}>
          {question.sentence.nativeScript.replace("___", " _____ ")}
        </Text>
        {question.sentence.romanization && (
          <Text style={[styles.sentenceRoman, { color: colors.textSecondary }]}>
            {question.sentence.romanization}
          </Text>
        )}
        <Text style={[styles.sentenceTranslation, { color: colors.textSecondary }]}>
          {question.sentence.translation}
        </Text>
      </View>

      {question.options ? (
        <View style={styles.chipRow}>
          {question.options.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[
                styles.chip,
                {
                  backgroundColor:
                    selectedChip === opt
                      ? colors.primary
                      : colors.backgroundSecondary,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => handleChipPress(opt)}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityLabel={`Select answer: ${opt}`}
              accessibilityState={{ selected: selectedChip === opt, disabled }}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color:
                      selectedChip === opt ? colors.textInverse : colors.text,
                  },
                ]}
              >
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.inputRow}>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.border,
              },
            ]}
            value={answer}
            onChangeText={setAnswer}
            placeholder="Type your answer..."
            placeholderTextColor={colors.textTertiary}
            editable={!disabled}
            autoCapitalize="none"
            onSubmitEditing={handleSubmit}
            accessibilityLabel="Type your answer"
          />
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: colors.primary }]}
            onPress={handleSubmit}
            disabled={disabled || !answer.trim()}
            accessibilityRole="button"
            accessibilityLabel="Check answer"
          >
            <Text style={[styles.submitText, { color: colors.textInverse }]}>
              Check
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
  sentenceCard: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    gap: 6,
  },
  sentenceNative: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  sentenceRoman: {
    fontSize: 15,
  },
  sentenceTranslation: {
    fontSize: 14,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 16,
    fontWeight: "600",
  },
  inputRow: {
    flexDirection: "row",
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  submitButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: "center",
  },
  submitText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
