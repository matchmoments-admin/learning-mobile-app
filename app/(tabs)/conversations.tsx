import { Paywall } from "@/components/subscription/Paywall";
import { Text } from "@/design-system/components/Text";
import { useTheme } from "@/design-system/ThemeProvider";
import { ConversationScenario } from "@/constants/ContentTypes";
import { useAuth } from "@/ctx/AuthContext";
import { useLanguage } from "@/ctx/LanguageContext";
import {
  createCustomScenarioId,
  listCustomScenarios,
  saveCustomScenario,
} from "@/lib/customScenarios";
import { supabase } from "@/utils/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

export default function ConversationsScreen() {
  const { isPremium } = useAuth();
  const { activePack, activeLanguage, hasRomanization } = useLanguage();
  const { colors } = useTheme();
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [isPhrasebookOpen, setIsPhrasebookOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] =
    useState<ConversationScenario | null>(null);
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [isGeneratingScenario, setIsGeneratingScenario] = useState(false);
  const [customMyRole, setCustomMyRole] = useState("");
  const [customAiRole, setCustomAiRole] = useState("");
  const [customScene, setCustomScene] = useState("");
  const [customScenarios, setCustomScenarios] = useState<
    ConversationScenario[]
  >([]);

  const scenarios = activePack?.scenarios ?? [];

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const load = async () => {
        try {
          const saved = await listCustomScenarios();
          if (isActive) setCustomScenarios(saved);
        } catch (err) {
          console.error("Failed to load custom scenarios:", err);
        }
      };

      void load();
      return () => {
        isActive = false;
      };
    }, []),
  );

  const handleScenarioPress = (scenario: ConversationScenario) => {
    if (scenario.isFree || isPremium) {
      setSelectedScenario(scenario);
    } else {
      setPaywallVisible(true);
    }
  };

  const handleStartConversation = () => {
    if (selectedScenario) {
      const id = selectedScenario.id;
      setSelectedScenario(null);
      setIsPhrasebookOpen(false);

      if (id.startsWith("custom_")) {
        router.push({
          pathname: "/conversation",
          params: { customScenarioId: id },
        });
        return;
      }

      router.push({
        pathname: "/conversation",
        params: { scenarioId: id },
      });
    }
  };

  const handleCreateCustom = () => {
    if (isPremium) {
      setIsCreatingCustom(true);
      return;
    }

    setPaywallVisible(true);
  };

  const handleStartCustomConversation = async () => {
    if (!customScene.trim() || isGeneratingScenario) return;

    setIsGeneratingScenario(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "scenario-generate",
        {
          body: {
            myRole: customMyRole,
            aiRole: customAiRole,
            sceneDescription: customScene,
            languageCode: activeLanguage.code,
          },
        },
      );

      if (error) {
        console.error("Error calling scenario-generate", error);
        toast.error("Could not generate scenario", {
          description: "Please try again in a moment",
        });
        return;
      }

      const id = createCustomScenarioId();
      const scenario: ConversationScenario = {
        id,
        title: data?.title,
        icon: "color-wand",
        isFree: false,
        description: data?.description,
        goal: data?.goal,
        tasks: data?.tasks,
        difficulty: data?.difficulty,
        phrasebook: data?.phrasebook,
      };

      await saveCustomScenario(scenario);
      setCustomScenarios((prev) => [scenario, ...prev]);

      setIsCreatingCustom(false);
      setIsPhrasebookOpen(false);
      setCustomMyRole("");
      setCustomAiRole("");
      setCustomScene("");
      setSelectedScenario(scenario);
    } catch (err) {
      console.error("Coudln't generate custom scenario:", err);
      toast.error("Could not start Free Talk", {
        description: "Please try again.",
      });
    } finally {
      setIsGeneratingScenario(false);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top", "left", "right"]}
    >
      <View style={{ flex: 1 }}>
        <View
          style={[styles.header, { borderBottomColor: colors.border }]}
        >
          <Text style={styles.headerTitle}>Topics</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {!isPremium && (
            <TouchableOpacity
              style={[
                styles.premiumBanner,
                { backgroundColor: colors.primary, shadowColor: colors.shadow },
              ]}
              onPress={() => setPaywallVisible(true)}
            >
              <View style={styles.premiumContent}>
                <Ionicons
                  name="chatbox"
                  size={24}
                  color={colors.textInverse}
                  style={{ marginBottom: 8 }}
                />
                <Text style={[styles.premiumTitle, { color: colors.textInverse }]}>
                  Get full access to Lumora
                </Text>
                <Text style={[styles.premiumSubtitle, { color: colors.textInverse, opacity: 0.8 }]}>
                  Unlock Lumora Premium to get access to custom scenarios and
                  more
                </Text>
                <View style={[styles.premiumButton, { backgroundColor: colors.background }]}>
                  <Text
                    style={[
                      styles.premiumButtonText,
                      { color: colors.primary },
                    ]}
                  >
                    Start free trial
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.freeTalkCard, { borderColor: colors.border }]}
            onPress={handleCreateCustom}
          >
            <View style={styles.freeTalkContent}>
              <Text type="defaultSemiBold" style={{ fontSize: 18 }}>
                Free Talk
              </Text>
              <Text
                style={{ color: colors.textSecondary, marginTop: 4 }}
              >
                Describe a scenario of your choice to create you custom Roleplay
                experience.
              </Text>
            </View>
            <View style={[styles.crystalBallContainer, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="color-wand" size={32} color="#A855F7" />
            </View>
          </TouchableOpacity>

          {/* Scenarios grid */}
          <View style={styles.gridContainer}>
            {[...customScenarios, ...scenarios].map((scenario) => (
              <TouchableOpacity
                key={scenario.id}
                style={[
                  styles.scenarioCard,
                  { borderColor: colors.border },
                ]}
                onPress={() => handleScenarioPress(scenario)}
              >
                {scenario.id.startsWith("custom_") && (
                  <View
                    style={[
                      styles.freeBadge,
                      { backgroundColor: colors.text + "22" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.freeBadgeText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      CUSTOM
                    </Text>
                  </View>
                )}
                {scenario.isFree && (
                  <View
                    style={[
                      styles.freeBadge,
                      { backgroundColor: colors.primary },
                    ]}
                  >
                    <Text style={[styles.freeBadgeText, { color: colors.textInverse }]}>FREE</Text>
                  </View>
                )}
                {!scenario.isFree && !isPremium && (
                  <View style={[styles.lockBadge]}>
                    <Ionicons
                      name="lock-closed"
                      size={24}
                      color={colors.textSecondary}
                    />
                  </View>
                )}
                <Text type="defaultSemiBold" style={styles.scenarioTitle}>
                  {scenario.title}
                </Text>
                <View style={styles.scenarioIconContainer}>
                  <Ionicons
                    name={scenario.icon}
                    size={40}
                    color={
                      scenario.isFree || isPremium
                        ? colors.primary
                        : colors.textSecondary
                    }
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Scenario Detail Modal */}
      <Modal
        visible={!!selectedScenario}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setSelectedScenario(null);
          setIsPhrasebookOpen(false);
        }}
      >
        <View style={{ flex: 1 }}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => {
                  if (isPhrasebookOpen) {
                    setIsPhrasebookOpen(false);
                    return;
                  }
                  setSelectedScenario(null);
                  setIsPhrasebookOpen(false);
                }}
                style={styles.backButton}
              >
                <Ionicons
                  name="chevron-back"
                  size={24}
                  color={colors.text}
                />
              </TouchableOpacity>
              <Text type="defaultSemiBold">
                {isPhrasebookOpen ? "Phrasebook" : ""}
              </Text>
              <View style={{ width: 40 }}></View>
            </View>
            <ScrollView
              key={isPhrasebookOpen ? "phrasebook" : "scenario"}
              contentContainerStyle={styles.modalContent}
            >
              {isPhrasebookOpen ? (
                (selectedScenario?.phrasebook ?? []).map((p, idx) => (
                  <View
                    key={`${p.nativeScript}-${idx}`}
                    style={[
                      styles.phraseRow,
                      {
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text style={styles.phraseNativeScript}>
                      {p.nativeScript}
                    </Text>
                    {hasRomanization() && p.romanization && (
                      <Text style={{ color: colors.textSecondary }}>
                        {p.romanization}
                      </Text>
                    )}
                    <Text style={{ color: colors.textSecondary }}>
                      {p.translation}
                    </Text>
                  </View>
                ))
              ) : (
                <>
                  <View style={styles.modalIconContainer}>
                    <Ionicons
                      name={selectedScenario?.icon}
                      size={64}
                      color={colors.primary}
                    />
                  </View>

                  <Text type={"title"} style={styles.modalTitle}>
                    {selectedScenario?.title}
                  </Text>

                  <View style={styles.section}>
                    <Text
                      type="defaultSemiBold"
                      style={styles.sectionHeader}
                    >
                      Scenario
                    </Text>
                    <Text style={{ color: colors.textSecondary }}>
                      {selectedScenario?.description}
                    </Text>
                  </View>

                  <View style={[styles.guidelinesCard, { backgroundColor: colors.warningLight }]}>
                    <Text
                      type="defaultSemiBold"
                      style={{ marginBottom: 8 }}
                    >
                      Free Talk Guidelines
                    </Text>
                    <View style={styles.guidelineItem}>
                      <Ionicons
                        name="warning-outline"
                        size={16}
                        color={colors.warning}
                      />
                      <Text style={[styles.guidelineText, { color: colors.warning }]}>
                        No inappropriate conversations
                      </Text>
                    </View>
                    <View style={styles.guidelineItem}>
                      <Ionicons
                        name="alert-circle-outline"
                        size={16}
                        color={colors.warning}
                      />
                      <Text style={[styles.guidelineText, { color: colors.warning }]}>
                        Not intended for advice
                      </Text>
                    </View>
                    <View style={styles.guidelineItem}>
                      <Ionicons
                        name="lock-closed-outline"
                        size={16}
                        color={colors.warning}
                      />
                      <Text style={[styles.guidelineText, { color: colors.warning }]}>
                        Don't share sensitive information
                      </Text>
                    </View>
                  </View>

                  <View style={styles.section}>
                    <Text
                      type="defaultSemiBold"
                      style={styles.sectionHeader}
                    >
                      Goal
                    </Text>
                    <View
                      style={[
                        styles.goalCard,
                        { borderColor: colors.border },
                      ]}
                    >
                      <Text type="defaultSemiBold">
                        {selectedScenario?.goal}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.section}>
                    <Text
                      type="defaultSemiBold"
                      style={styles.sectionHeader}
                    >
                      Tasks
                    </Text>
                    {selectedScenario?.tasks.map((task, index) => (
                      <View
                        key={index}
                        style={[
                          styles.taskCard,
                          {
                            borderColor: colors.border,
                          },
                        ]}
                      >
                        <Ionicons
                          size={20}
                          color={colors.textSecondary}
                          name="checkmark-circle-outline"
                        />
                        <Text>{task}</Text>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.phrasebookButton,
                      { backgroundColor: colors.text + "10" },
                    ]}
                    onPress={() => {
                      const entries = selectedScenario?.phrasebook ?? [];
                      if (!entries.length) {
                        toast.error("No phrasebook available", {
                          description:
                            "This scenario doesn't have phrasebook entries yet.",
                        });
                        return;
                      }
                      setIsPhrasebookOpen(true);
                    }}
                  >
                    <Ionicons
                      name="book-outline"
                      size={20}
                      color={colors.primary}
                    />
                    <Text
                      style={{
                        color: colors.primary,
                        fontWeight: "600",
                      }}
                    >
                      View Phrasebook
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>

            {!isPhrasebookOpen && (
              <View
                style={[styles.footer, { borderTopColor: colors.border }]}
              >
                <TouchableOpacity
                  style={[
                    styles.startButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={handleStartConversation}
                >
                  <Text style={[styles.startButtonText, { color: colors.textInverse }]}>Start</Text>
                </TouchableOpacity>
              </View>
            )}
          </SafeAreaView>
        </View>
      </Modal>

      {/* Custom Conversation Modal */}
      <Modal
        visible={isCreatingCustom}
        animationType="slide"
        presentationStyle={isGeneratingScenario ? "fullScreen" : "pageSheet"}
        onRequestClose={() => {
          if (isGeneratingScenario) return;
          setIsCreatingCustom(false);
        }}
      >
        <View style={{ flex: 1 }}>
          <SafeAreaView style={{ flex: 1 }}>
            <KeyboardAvoidingView
              behavior="padding"
              style={{ flex: 1 }}
              keyboardVerticalOffset={0}
            >
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={() => {
                    if (isGeneratingScenario) return;
                    setIsCreatingCustom(false);
                  }}
                  disabled={isGeneratingScenario}
                  style={[
                    styles.backButton,
                    isGeneratingScenario && {
                      opacity: 0.4,
                    },
                  ]}
                >
                  <Ionicons
                    name="chevron-back"
                    size={24}
                    color={colors.text}
                  />
                </TouchableOpacity>
                <Text type="defaultSemiBold">Create</Text>
                <View style={{ width: 40 }}></View>
              </View>

              <ScrollView
                contentContainerStyle={styles.modalContent}
                keyboardShouldPersistTaps="handled"
              >
                <Text
                  style={{ color: colors.textSecondary, marginBottom: 20 }}
                >
                  Fill out each role and describe in detail the scene and the
                  conversation you want to have.
                </Text>

                <View style={styles.inputGroup}>
                  <View
                    style={[
                      styles.inputContainer,
                      { borderColor: colors.border },
                    ]}
                  >
                    <Ionicons
                      name="person-outline"
                      size={20}
                      color={colors.textSecondary}
                    />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="My role"
                      placeholderTextColor={colors.textSecondary}
                      value={customMyRole}
                      onChangeText={setCustomMyRole}
                    />
                  </View>
                  <View
                    style={[
                      styles.inputContainer,
                      { borderColor: colors.border },
                    ]}
                  >
                    <Ionicons
                      name="happy-outline"
                      size={20}
                      color={colors.textSecondary}
                    />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="AI's role"
                      placeholderTextColor={colors.textSecondary}
                      value={customAiRole}
                      onChangeText={setCustomAiRole}
                    />
                  </View>

                  <View
                    style={[
                      styles.inputContainer,
                      {
                        borderColor: colors.border,
                        height: 120,
                        alignItems: "flex-start",
                        paddingTop: 16,
                      },
                    ]}
                  >
                    <Ionicons
                      name="image-outline"
                      size={20}
                      color={colors.textSecondary}
                      style={{ marginTop: 5 }}
                    />
                    <TextInput
                      style={[
                        styles.input,
                        {
                          color: colors.text,
                          height: "100%",
                          textAlignVertical: "top",
                        },
                      ]}
                      placeholder="Set the scene and the chat topic here"
                      placeholderTextColor={colors.textSecondary}
                      value={customScene}
                      multiline
                      onChangeText={setCustomScene}
                    />
                  </View>
                </View>
              </ScrollView>

              <View
                style={[styles.footer, { borderTopColor: colors.border }]}
              >
                <TouchableOpacity
                  style={[
                    styles.startButton,
                    {
                      backgroundColor: colors.primary,
                      opacity: customScene && !isGeneratingScenario ? 1 : 0.5,
                    },
                  ]}
                  disabled={!customScene || isGeneratingScenario}
                  onPress={handleStartCustomConversation}
                >
                  <Text style={[styles.startButtonText, { color: colors.textInverse }]}>
                    {isGeneratingScenario ? "Generating..." : "Start chatting"}
                  </Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </View>
      </Modal>

      <Paywall
        visible={paywallVisible}
        onClose={() => setPaywallVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 115,
    paddingTop: 20,
  },
  premiumBanner: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  premiumContent: {
    alignItems: "center",
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  premiumSubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  premiumButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  premiumButtonText: {
    fontWeight: "bold",
  },
  freeTalkCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  freeTalkContent: {
    flex: 1,
    paddingRight: 16,
  },
  crystalBallContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  scenarioCard: {
    width: "47%",
    maxWidth: 200,
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  freeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  freeBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  lockBadge: {
    alignSelf: "flex-start",
    padding: 4,
  },
  scenarioTitle: {
    fontSize: 20,
  },
  scenarioIconContainer: {
    alignSelf: "flex-end",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  modalContent: {
    padding: 24,
  },
  modalIconContainer: {
    alignSelf: "center",
    marginBottom: 24,
  },
  modalTitle: {
    textAlign: "center",
    marginBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 8,
    fontSize: 18,
  },
  guidelinesCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  guidelineItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  guidelineText: {
    fontSize: 13,
    flex: 1,
  },
  goalCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  phrasebookButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 12,
    marginBottom: 40,
  },
  phraseRow: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  phraseNativeScript: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
  startButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  inputGroup: {
    gap: 12,
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
});
