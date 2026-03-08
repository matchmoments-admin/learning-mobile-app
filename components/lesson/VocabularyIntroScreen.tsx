import { Question, Term } from "@/constants/ContentTypes";
import { useTheme } from "@/design-system/ThemeProvider";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/design-system/components/Text";
import ConfirmDialog from "../ui/ConfirmDialog";
import Flashcard from "./Flashcard";
import ProgressHeader from "./ProgressHeader";

interface StudyCard {
  key: string;
  word: Term;
  direction: "native-to-translation" | "translation-to-native";
}

interface DeckBuckets {
  recognition: StudyCard[];
  recall: StudyCard[];
  total: number;
}

type StudyPhase = "recognition" | "recall";

interface StudyState {
  phase: StudyPhase;
  queue: string[];
  recallKeys: string[];
  cards: Record<string, StudyCard>;
  total: number;
  completed: number;
}

const getUniqueWords = (questions: Question[]): Term[] => {
  const allWords = new Map<string, Term>();
  questions.forEach((question) => {
    let wordSource: Term[] = [];
    if (question.type === "listening_mc") {
      wordSource = question.prompt.words;
    } else if (question.type === "fill_in_blank") {
      // No word-level breakdown for fill-in-blank
      wordSource = [{
        nativeScript: question.sentence.nativeScript,
        romanization: question.sentence.romanization,
        translation: question.sentence.translation,
      }];
    } else if (question.type === "matching") {
      wordSource = question.pairs.map((p) => ({
        nativeScript: p.left,
        translation: p.right,
      }));
    } else {
      wordSource = question.options.flatMap((opt) => opt.phrase.words);
    }

    wordSource.forEach((word) => {
      if (word && word.nativeScript && !allWords.has(word.nativeScript)) {
        allWords.set(word.nativeScript, word);
      }
    });
  });

  return Array.from(allWords.values());
};

const buildDeck = (words: Term[]): DeckBuckets => {
  const recognition: StudyCard[] = words.map((word) => ({
    key: `${word.nativeScript}-recognition`,
    word,
    direction: "native-to-translation",
  }));

  const recall: StudyCard[] = words.map((word) => ({
    key: `${word.nativeScript}-recall`,
    word,
    direction: "translation-to-native",
  }));

  return {
    recognition,
    recall,
    total: recognition.length + recall.length,
  };
};

const initializeStudyState = (deck: DeckBuckets): StudyState => {
  const cards: Record<string, StudyCard> = {};
  [...deck.recognition, ...deck.recall].forEach((entry) => {
    cards[entry.key] = entry;
  });

  return {
    phase: "recognition",
    queue: deck.recognition.map((entry) => entry.key),
    recallKeys: deck.recall.map((entry) => entry.key),
    cards,
    total: deck.total,
    completed: 0,
  };
};

export default function VocabularyIntroScreen({
  questions,
  onStartLesson,
}: {
  questions: Question[];
  onStartLesson: () => void;
}) {
  const { colors } = useTheme();
  const vocabulary = useMemo(() => getUniqueWords(questions), [questions]);
  const deck = useMemo(() => buildDeck(vocabulary), [vocabulary]);
  const [state, setState] = useState<StudyState>(() =>
    initializeStudyState(deck),
  );
  const [exitConfirmVisible, setExitConfirmVisible] = useState(false);

  useEffect(() => {
    if (
      state.queue.length === 0 &&
      state.recallKeys.length === 0 &&
      state.completed >= state.total
    ) {
      onStartLesson();
    }
  }, [
    state.queue.length,
    state.recallKeys.length,
    state.completed,
    state.total,
    onStartLesson,
  ]);

  const handleGrade = useCallback((grade: "again" | "good") => {
    setState((prev) => {
      if (!prev.queue.length) {
        return prev;
      }

      const [activeKey, ...restQueue] = prev.queue;
      const entry = prev.cards[activeKey];

      if (!entry) {
        return { ...prev, queue: restQueue };
      }

      let queue = [...restQueue];
      let completed = prev.completed;
      let phase: StudyPhase = prev.phase;
      let recallKeys = prev.recallKeys;

      if (grade === "again") {
        const insertIndex = Math.min(2, queue.length);
        queue.splice(insertIndex, 0, activeKey);
      } else {
        completed = Math.min(prev.total, prev.completed + 1);
      }

      if (
        queue.length === 0 &&
        phase === "recognition" &&
        recallKeys.length > 0
      ) {
        queue = [...recallKeys];
        recallKeys = [];
        phase = "recall";
      }

      return {
        ...prev,
        queue,
        completed,
        phase,
        recallKeys,
      };
    });
  }, []);

  if (deck.total === 0) {
    onStartLesson();
    return null;
  }

  const progressPercent =
    state.total === 0 ? 0 : (state.completed / state.total) * 100;

  const currentKey = state.queue[0];
  const currentCard = currentKey ? state.cards[currentKey] : undefined;
  const headerCount = currentCard
    ? Math.min(state.completed + 1, state.total)
    : state.completed;

  return (
    <View style={styles.container}>
      <ConfirmDialog
        visible={exitConfirmVisible}
        title="Exit practise"
        description="Are you sure you want to exit? Your progress will be lost."
        cancelLabel="Cancel"
        confirmLabel="Exit"
        destructive
        onCancel={() => setExitConfirmVisible(false)}
        onConfirm={() => {
          setExitConfirmVisible(false);
          router.push("/lessons");
        }}
      />
      <ProgressHeader
        progress={progressPercent}
        currentCount={headerCount}
        totalCount={state.total}
        onClose={() => setExitConfirmVisible(true)}
      />

      <View style={styles.content}>
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionTitle}>
            Lesson Vocabulary
          </Text>
          <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
            Tap to flip. Retry cards you still need to review.
          </Text>
        </View>

        {currentCard ? (
          <View style={styles.flashcardContainer}>
            <Flashcard
              key={currentCard.key}
              word={currentCard.word}
              direction={currentCard.direction}
            />
          </View>
        ) : null}

        <View style={styles.bottomActions}>
          <View style={styles.gradeButtons}>
            <Pressable
              onPress={() => handleGrade("again")}
              disabled={!currentCard}
              style={({ pressed }) => [
                styles.gradeButton,
                { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
                !currentCard ? styles.disabledButton : null,
                pressed && !!currentCard ? styles.pressedButton : null,
              ]}
            >
              <Text style={[styles.gradeButtonText, { color: colors.text }]}>Again</Text>
            </Pressable>
            <Pressable
              onPress={() => handleGrade("good")}
              disabled={!currentCard}
              style={({ pressed }) => [
                styles.gradeButton,
                { backgroundColor: colors.primary, borderColor: colors.primary },
                !currentCard ? styles.disabledButton : null,
                pressed && !!currentCard ? styles.pressedButton : null,
              ]}
            >
              <Text style={[styles.gradeButtonTextWhite, { color: colors.textInverse }]}>
                Got it
              </Text>
            </Pressable>
          </View>

          <Pressable
            onPress={onStartLesson}
            style={({ pressed }) => [
              styles.skipButton,
              pressed && styles.skipButtonPressed,
            ]}
          >
            <Text style={[styles.skipButtonText, { color: colors.textSecondary }]}>
              Skip to Lesson
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  instructionContainer: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  instructionTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
  },
  instructionText: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  flashcardContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  bottomActions: {
    marginTop: "auto",
    paddingTop: 16,
    gap: 16,
  },
  gradeButtons: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },
  gradeButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  disabledButton: {
    opacity: 0.4,
  },
  pressedButton: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  gradeButtonText: {
    fontSize: 17,
    fontWeight: "600",
  },
  gradeButtonTextWhite: {
    fontSize: 17,
    fontWeight: "600",
  },
  skipButton: {
    width: "100%",
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  skipButtonPressed: {
    opacity: 0.6,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
