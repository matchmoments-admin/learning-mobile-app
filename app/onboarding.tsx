import { Paywall } from "@/components/subscription/Paywall";
import { Text } from "@/design-system/components/Text";
import { useTheme } from "@/design-system/ThemeProvider";
import { LANGUAGES } from "@/constants/Languages";
import { useAuth } from "@/ctx/AuthContext";
import { useLanguage } from "@/ctx/LanguageContext";
import { supabase } from "@/utils/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const SUBJECTS = [
  {
    id: "languages",
    title: "Languages",
    icon: "language-outline" as const,
    description: "Learn to speak a new language",
  },
  {
    id: "mathematics",
    title: "Mathematics",
    icon: "calculator-outline" as const,
    description: "Coming soon",
    disabled: true,
  },
  {
    id: "science",
    title: "Science",
    icon: "flask-outline" as const,
    description: "Coming soon",
    disabled: true,
  },
  {
    id: "history",
    title: "History",
    icon: "book-outline" as const,
    description: "Coming soon",
    disabled: true,
  },
];

const LANGUAGE_OPTIONS = Object.values(LANGUAGES).map((lang) => ({
  id: lang.code,
  title: lang.displayName,
  nativeName: lang.nativeName,
  hasContent: lang.hasContent,
}));

const LEVELS = [
  {
    id: "beginner",
    title: "Beginner",
    description: "I know a few words or nothing at all.",
  },
  {
    id: "intermediate",
    title: "Intermediate",
    description: "I can have basic conversations.",
  },
  {
    id: "advanced",
    title: "Advanced",
    description: "I can express myself fluently.",
  },
];

const MOTIVATIONS = [
  {
    id: "travel",
    title: "Travel",
    icon: "airplane-outline",
  },
  {
    id: "work",
    title: "Work",
    icon: "briefcase-outline",
  },
  {
    id: "family",
    title: "Family",
    icon: "people-outline",
  },
  {
    id: "culture",
    title: "Culture",
    icon: "book-outline",
  },
  {
    id: "hobby",
    title: "Hobby",
    icon: "game-controller-outline",
  },
];

const INTERESTS = [
  "Food & Dining",
  "Business",
  "Daily Life",
  "Technology",
  "Art",
  "Music",
  "Politics",
  "Sports",
];

const TOTAL_STEPS = 6;

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const { setActiveLanguageCode } = useLanguage();

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [level, setLevel] = useState<string | null>(null);
  const [motivations, setMotivations] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [showPaywall, setShowPaywall] = useState(false);

  const { refreshProfile } = useAuth();

  const handleBack = () => {
    if (step > 0) {
      // Skip language step when going back if not on languages subject
      if (step === 3 && selectedSubject !== "languages") {
        setStep(1);
      } else {
        setStep(step - 1);
      }
    } else {
      router.back();
    }
  };

  const isNextEnabled = () => {
    if (step === 0) return name.trim().length > 0;
    if (step === 1) return !!selectedSubject;
    if (step === 2) return !!selectedLanguage;
    if (step === 3) return !!level;
    if (step === 4) return motivations.length > 0;
    if (step === 5) return selectedInterests.length > 0;
    return false;
  };

  const saveProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: name,
        motivations: motivations,
        interests: selectedInterests,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Set active language in context
      if (selectedLanguage) {
        setActiveLanguageCode(selectedLanguage);
      }

      await refreshProfile();

      setShowPaywall(true);
    } catch (err) {
      console.error("Error saving profile:", err);
      toast.error("Failed to save your profile. Please try again.");
    }
  };

  const handleContinue = () => {
    if (step === 1 && selectedSubject !== "languages") {
      // Skip language selection for non-language subjects
      setStep(3);
    } else if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    } else {
      saveProfile();
    }
  };

  const toggleMotivation = (id: string) => {
    if (motivations.includes(id)) {
      setMotivations(motivations.filter((m) => m !== id));
    } else {
      setMotivations([...motivations, id]);
    }
  };

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const selectedLangConfig = selectedLanguage
    ? LANGUAGES[selectedLanguage]
    : null;

  const renderStep0Name = () => (
    <View style={styles.stepContainer}>
      <Text type="title" style={styles.title}>
        What should we call you?
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Your name will be used to personalize your lessons.
      </Text>

      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.icon }]}
        placeholder="Your Name"
        placeholderTextColor={colors.textTertiary}
        value={name}
        onChangeText={setName}
        autoFocus
      />
    </View>
  );

  const renderStep1Subject = () => (
    <View style={styles.stepContainer}>
      <Text type="title" style={styles.title}>
        What would you like to learn?
      </Text>

      <ScrollView
        contentContainerStyle={{ rowGap: 16 }}
        style={{ marginTop: 20 }}
      >
        {SUBJECTS.map((s) => (
          <TouchableOpacity
            key={s.id}
            disabled={s.disabled}
            style={[
              styles.optionCard,
              styles.motivationCard,
              { borderColor: colors.border },
              selectedSubject === s.id && {
                borderColor: colors.primary,
              },
              s.disabled && { opacity: 0.5 },
            ]}
            onPress={() => setSelectedSubject(s.id)}
          >
            <Ionicons
              name={s.icon as any}
              size={24}
              color={
                selectedSubject === s.id
                  ? colors.primary
                  : colors.icon
              }
            />
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.optionTitle,
                  selectedSubject === s.id && {
                    color: colors.primary,
                  },
                ]}
              >
                {s.title}
              </Text>
              <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                {s.description}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderStep2Language = () => (
    <View style={styles.stepContainer}>
      <Text type="title" style={styles.title}>
        Which language?
      </Text>

      <ScrollView
        contentContainerStyle={{ rowGap: 16 }}
        style={{ marginTop: 20 }}
      >
        {LANGUAGE_OPTIONS.map((lang) => (
          <TouchableOpacity
            key={lang.id}
            disabled={!lang.hasContent}
            style={[
              styles.optionCard,
              styles.motivationCard,
              { borderColor: colors.border },
              selectedLanguage === lang.id && {
                borderColor: colors.primary,
              },
              !lang.hasContent && { opacity: 0.5 },
            ]}
            onPress={() => setSelectedLanguage(lang.id)}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.optionTitle,
                  selectedLanguage === lang.id && {
                    color: colors.primary,
                  },
                ]}
              >
                {lang.title}
              </Text>
              <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                {lang.hasContent ? lang.nativeName : "Coming soon"}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderStep3Level = () => (
    <View style={styles.stepContainer}>
      <Text type="title" style={styles.title}>
        How much {selectedLangConfig?.displayName ?? "do you"} know?
      </Text>

      <ScrollView
        contentContainerStyle={{ rowGap: 16 }}
        style={{ marginTop: 20 }}
      >
        {LEVELS.map((l) => (
          <TouchableOpacity
            key={l.id}
            style={[
              styles.optionCard,
              { borderColor: colors.border },
              level === l.id && {
                borderColor: colors.primary,
              },
            ]}
            onPress={() => setLevel(l.id)}
          >
            <Text
              style={[
                styles.optionTitle,
                level === l.id && { color: colors.primary },
              ]}
            >
              {l.title}
            </Text>
            <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
              {l.description}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderStep4Motivation = () => (
    <View style={styles.stepContainer}>
      <Text type="title" style={styles.title}>
        Why are you learning?
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Select all that apply.</Text>

      <ScrollView
        contentContainerStyle={{ rowGap: 16 }}
        style={{ marginTop: 10 }}
      >
        {MOTIVATIONS.map((m) => {
          const isSelected = motivations.includes(m.id);

          return (
            <TouchableOpacity
              key={m.id}
              style={[
                styles.optionCard,
                styles.motivationCard,
                { borderColor: colors.border },
                isSelected && {
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => toggleMotivation(m.id)}
            >
              <Ionicons
                name={m.icon as any}
                size={24}
                color={isSelected ? colors.primary : colors.icon}
              />
              <Text
                style={[
                  styles.optionTitle,
                  isSelected && { color: colors.primary },
                ]}
              >
                {m.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderStep5Interests = () => (
    <View style={styles.stepContainer}>
      <Text type="title" style={styles.title}>
        What are you interested in?
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Select all that apply.</Text>

      <View style={styles.tagsContainer}>
        {INTERESTS.map((i) => {
          const isSelected = selectedInterests.includes(i);

          return (
            <TouchableOpacity
              key={i}
              style={[
                styles.tag,
                { borderColor: colors.border },
                isSelected && {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => toggleInterest(i)}
            >
              <Text
                style={[styles.tagText, isSelected && { color: colors.textInverse }]}
              >
                {i}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  // Calculate effective progress (accounting for skipped steps)
  const effectiveStep = step;
  const progressWidth = `${((effectiveStep + 1) / TOTAL_STEPS) * 100}%`;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          {step > 0 && (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          )}
          <View style={[styles.progressBarContainer, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressBar,
                {
                  width: progressWidth as any,
                  backgroundColor: colors.primary,
                },
              ]}
            ></View>
          </View>
        </View>
        <View style={styles.mainContent}>
          <Animated.View
            key={step}
            entering={FadeIn}
            exiting={FadeOut}
            style={{ flex: 1 }}
          >
            {step === 0 && renderStep0Name()}
            {step === 1 && renderStep1Subject()}
            {step === 2 && renderStep2Language()}
            {step === 3 && renderStep3Level()}
            {step === 4 && renderStep4Motivation()}
            {step === 5 && renderStep5Interests()}
          </Animated.View>
        </View>

        <View style={[styles.footer, { zIndex: 10, borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              {
                backgroundColor: isNextEnabled()
                  ? colors.primary
                  : colors.border,
                shadowColor: colors.shadow,
              },
            ]}
            onPress={handleContinue}
            disabled={!isNextEnabled()}
          >
            <Text style={[styles.continueButtonText, { color: colors.textInverse }]}>
              {step === TOTAL_STEPS - 1 ? "Get Started" : "Continue"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Paywall
        visible={showPaywall}
        onClose={() => router.replace("/lessons")}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    height: 60,
  },
  backButton: {
    marginRight: 16,
  },
  progressBarContainer: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 3,
  },
  mainContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  stepContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  input: {
    fontSize: 20,
    borderBottomWidth: 2,
    paddingVertical: 12,
    marginTop: 20,
  },
  optionCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
  },
  motivationCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 20,
  },
  tag: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 16,
    fontWeight: "500",
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
    width: "100%",
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
