import { Paywall } from "@/components/subscription/Paywall";
import { ThemedText } from "@/components/themed-text";
import { LANGUAGES } from "@/constants/Languages";
import { Colors } from "@/constants/theme";
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
  const colors = Colors["light"];
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
      <ThemedText type="title" style={styles.title}>
        What should we call you?
      </ThemedText>
      <ThemedText style={styles.subtitle}>
        Your name will be used to personalize your lessons.
      </ThemedText>

      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.icon }]}
        placeholder="Your Name"
        placeholderTextColor="#9CA3AF"
        value={name}
        onChangeText={setName}
        autoFocus
      />
    </View>
  );

  const renderStep1Subject = () => (
    <View style={styles.stepContainer}>
      <ThemedText type="title" style={styles.title}>
        What would you like to learn?
      </ThemedText>

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
              selectedSubject === s.id && {
                borderColor: Colors.primaryAccentColor,
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
                  ? Colors.primaryAccentColor
                  : colors.icon
              }
            />
            <View style={{ flex: 1 }}>
              <ThemedText
                style={[
                  styles.optionTitle,
                  selectedSubject === s.id && {
                    color: Colors.primaryAccentColor,
                  },
                ]}
              >
                {s.title}
              </ThemedText>
              <ThemedText style={styles.optionDescription}>
                {s.description}
              </ThemedText>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderStep2Language = () => (
    <View style={styles.stepContainer}>
      <ThemedText type="title" style={styles.title}>
        Which language?
      </ThemedText>

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
              selectedLanguage === lang.id && {
                borderColor: Colors.primaryAccentColor,
              },
              !lang.hasContent && { opacity: 0.5 },
            ]}
            onPress={() => setSelectedLanguage(lang.id)}
          >
            <View style={{ flex: 1 }}>
              <ThemedText
                style={[
                  styles.optionTitle,
                  selectedLanguage === lang.id && {
                    color: Colors.primaryAccentColor,
                  },
                ]}
              >
                {lang.title}
              </ThemedText>
              <ThemedText style={styles.optionDescription}>
                {lang.hasContent ? lang.nativeName : "Coming soon"}
              </ThemedText>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderStep3Level = () => (
    <View style={styles.stepContainer}>
      <ThemedText type="title" style={styles.title}>
        How much {selectedLangConfig?.displayName ?? "do you"} know?
      </ThemedText>

      <ScrollView
        contentContainerStyle={{ rowGap: 16 }}
        style={{ marginTop: 20 }}
      >
        {LEVELS.map((l) => (
          <TouchableOpacity
            key={l.id}
            style={[
              styles.optionCard,
              level === l.id && {
                borderColor: Colors.primaryAccentColor,
              },
            ]}
            onPress={() => setLevel(l.id)}
          >
            <ThemedText
              style={[
                styles.optionTitle,
                level === l.id && { color: Colors.primaryAccentColor },
              ]}
            >
              {l.title}
            </ThemedText>
            <ThemedText style={[styles.optionDescription]}>
              {l.description}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderStep4Motivation = () => (
    <View style={styles.stepContainer}>
      <ThemedText type="title" style={styles.title}>
        Why are you learning?
      </ThemedText>
      <ThemedText style={styles.subtitle}>Select all that apply.</ThemedText>

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
                isSelected && {
                  borderColor: Colors.primaryAccentColor,
                },
              ]}
              onPress={() => toggleMotivation(m.id)}
            >
              <Ionicons
                name={m.icon as any}
                size={24}
                color={isSelected ? Colors.primaryAccentColor : colors.icon}
              />
              <ThemedText
                style={[
                  styles.optionTitle,
                  isSelected && { color: Colors.primaryAccentColor },
                ]}
              >
                {m.title}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderStep5Interests = () => (
    <View style={styles.stepContainer}>
      <ThemedText type="title" style={styles.title}>
        What are you interested in?
      </ThemedText>
      <ThemedText style={styles.subtitle}>Select all that apply.</ThemedText>

      <View style={styles.tagsContainer}>
        {INTERESTS.map((i) => {
          const isSelected = selectedInterests.includes(i);

          return (
            <TouchableOpacity
              key={i}
              style={[
                styles.tag,
                isSelected && {
                  backgroundColor: Colors.primaryAccentColor,
                  borderColor: Colors.primaryAccentColor,
                },
              ]}
              onPress={() => toggleInterest(i)}
            >
              <ThemedText
                style={[styles.tagText, isSelected && { color: "#FFF" }]}
              >
                {i}
              </ThemedText>
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
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: progressWidth as any,
                  backgroundColor: Colors.primaryAccentColor,
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

        <View style={[styles.footer, { zIndex: 10 }]}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              {
                backgroundColor: isNextEnabled()
                  ? Colors.primaryAccentColor
                  : "#E5E7EB",
              },
            ]}
            onPress={handleContinue}
            disabled={!isNextEnabled()}
          >
            <ThemedText style={styles.continueButtonText}>
              {step === TOTAL_STEPS - 1 ? "Get Started" : "Continue"}
            </ThemedText>
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
    backgroundColor: "#E5E7EB",
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
    color: Colors.subduedTextColor,
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
    borderColor: "#E5E7EB",
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
    color: Colors.subduedTextColor,
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
    borderColor: "#E5E7EB",
  },
  tagText: {
    fontSize: 16,
    fontWeight: "500",
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
    width: "100%",
  },
  continueButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
