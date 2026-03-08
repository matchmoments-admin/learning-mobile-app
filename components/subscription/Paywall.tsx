import { useTheme } from "@/design-system/ThemeProvider";
import { useAuth } from "@/ctx/AuthContext";
import { supabase } from "@/utils/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const { width } = Dimensions.get("window");

interface Feature {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: "language-outline",
    title: "All Languages",
    description: "Unlock Spanish, Hindi, and every future language",
  },
  {
    icon: "book-outline",
    title: "Full Curriculum",
    description: "Access all 12 chapters in every course",
  },
  {
    icon: "people-outline",
    title: "AI Conversations",
    description: "Practice real-world scenarios with an AI conversation partner",
  },
  {
    icon: "mic-outline",
    title: "Pronunciation Coach",
    description: "Get instant AI feedback on your pronunciation",
  },
  {
    icon: "trending-up-outline",
    title: "Personalized Lessons",
    description: "Lessons adapted to fix your frequent mistakes",
  },
  {
    icon: "analytics-outline",
    title: "Progress Reports",
    description: "Track your learning journey with detailed analytics",
  },
];

export function Paywall({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const [isStartingTrial, setIsStartingTrial] = useState(false);

  const { refreshProfile } = useAuth();

  const handleStartTrial = async () => {
    try {
      setIsStartingTrial(true);

      const { error } = await supabase.functions.invoke("start-trial", {
        body: { planId: "premium_trial" },
      });

      if (error) throw error;

      await refreshProfile();
      onClose();
    } catch (err) {
      console.error("Failed to start trial:", err);
      toast.error("Could not start trial. Please try again.");
    } finally {
      setIsStartingTrial(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable style={[styles.closeButton, { backgroundColor: colors.backgroundSecondary }]} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Go Premium</Text>
          <Text style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.introSection}>
            <Text style={[styles.title, { color: colors.text }]}>
              Unlock all languages{" "}
              <Text style={{ color: colors.primary }}>&</Text>
            </Text>
            <Text style={[styles.subtitle, { color: colors.text }]}>
              the full curriculum
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <View key={index} style={[styles.featureCard, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow }]}>
                <View style={[styles.featureIcon, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons
                    name={feature.icon}
                    size={24}
                    color={colors.primary}
                  />
                </View>
                <Text style={[styles.featureTitle, { color: colors.text }]}>{feature.title}</Text>
                <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                  {feature.description}
                </Text>
              </View>
            ))}
          </View>

          {/* CTA button */}
          <Pressable
            style={[styles.ctaButton, { backgroundColor: colors.primary, shadowColor: colors.primary }, isStartingTrial && { opacity: 0.7 }]}
            onPress={handleStartTrial}
            disabled={isStartingTrial}
          >
            <Ionicons
              name="star"
              size={20}
              color="#fff"
              style={styles.ctaIcon}
            />
            <Text style={styles.ctaText}>
              {isStartingTrial ? "Starting..." : "Start my free week"}
            </Text>
          </Pressable>

          {/* Footer */}
          <Text style={[styles.footer, { color: colors.text }]}>Try 7 days free. Cancel anytime.</Text>
          <Text style={[styles.footerNote, { color: colors.textSecondary }]}>
            We'll send you a reminder before your trial ends.
          </Text>
          <Text style={[styles.comingSoon, { color: colors.textTertiary }]}>
            Subscriptions coming soon
          </Text>

          {/* Legal links */}
          <View style={styles.legalLinks}>
            <Pressable onPress={() => { onClose(); router.push("/terms"); }}>
              <Text style={[styles.legalLink, { color: colors.textTertiary }]}>Terms of Service</Text>
            </Pressable>
            <Text style={[styles.legalSeparator, { color: colors.textTertiary }]}>•</Text>
            <Pressable onPress={() => { onClose(); router.push("/privacy"); }}>
              <Text style={[styles.legalLink, { color: colors.textTertiary }]}>Privacy Policy</Text>
            </Pressable>
          </View>

          <View style={styles.bottomSpacing}></View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  introSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
  },
  featuresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  featureCard: {
    width: (width - 52) / 2,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 32,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  ctaIcon: {
    marginRight: 8,
  },
  ctaText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  footer: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  footerNote: {
    fontSize: 13,
    textAlign: "center",
    marginBottom: 16,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  comingSoon: {
    fontSize: 13,
    textAlign: "center",
    marginBottom: 24,
  },
  legalLinks: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  legalLink: {
    fontSize: 12,
    textDecorationLine: "underline",
  },
  legalSeparator: {
    fontSize: 12,
  },
  bottomSpacing: {
    height: 40,
  },
});
