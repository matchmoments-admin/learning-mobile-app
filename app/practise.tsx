import LessonContent from "@/components/lesson/LessonContent";
import VocabularyIntroScreen from "@/components/lesson/VocabularyIntroScreen";
import { useAuth } from "@/ctx/AuthContext";
import { useLanguage } from "@/ctx/LanguageContext";
import { canAccessLesson } from "@/lib/services/access-service";
import { Redirect, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PractiseScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const [isStudyingVocabulary, setIsStudyingVocabulary] = useState(true);
  const { activePack } = useLanguage();
  const { isPremium } = useAuth();

  // Defense-in-depth: redirect if user deep-links to a locked lesson
  if (
    activePack &&
    lessonId &&
    !canAccessLesson(activePack, lessonId, isPremium)
  ) {
    return <Redirect href="/(tabs)/lessons" />;
  }

  const allLessons = useMemo(() => {
    if (!activePack) return [];
    return activePack.chapters.flatMap((c) =>
      c.review ? [...c.lessons, c.review] : c.lessons,
    );
  }, [activePack]);

  const currentLesson = allLessons.find((l) => l.id === lessonId);

  const questions = currentLesson ? currentLesson.questions : [];

  if (questions.length === 0) {
    return <Redirect href="/(tabs)/lessons" />;
  }

  if (isStudyingVocabulary) {
    return (
      <SafeAreaView style={styles.container}>
        <VocabularyIntroScreen
          key={lessonId}
          questions={questions}
          onStartLesson={() => setIsStudyingVocabulary(false)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LessonContent questions={questions} lessonId={lessonId} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
});
