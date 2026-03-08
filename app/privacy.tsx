import { Text } from "@/design-system/components/Text";
import { useTheme } from "@/design-system/ThemeProvider";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PrivacyPolicyScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top", "left", "right"]}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.lastUpdated, { color: colors.textTertiary }]}>
          Last updated: March 2026
        </Text>

        <Text style={[styles.body, { color: colors.textSecondary }]}>
          Lumora ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          1. Information We Collect
        </Text>
        <Text style={[styles.body, { color: colors.textSecondary }]}>
          When you create an account, we collect your name, email address, and authentication credentials. As you use the app, we collect your learning progress, lesson scores, streak data, and preferences such as your chosen language and interests. If you use pronunciation practice, audio is processed in real time and is not stored.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          2. How We Use Your Information
        </Text>
        <Text style={[styles.body, { color: colors.textSecondary }]}>
          We use your information to personalize your learning experience, track your progress across lessons and courses, adapt lesson difficulty based on your performance, provide AI-powered conversation practice and pronunciation feedback, and send you reminders about streaks and trial status.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          3. Third-Party Services
        </Text>
        <Text style={[styles.body, { color: colors.textSecondary }]}>
          We use the following third-party services to operate the app:{"\n\n"}
          • Supabase — authentication, database, and serverless functions{"\n"}
          • OpenRouter — AI language model API for conversation practice and lesson generation{"\n"}
          • Google Sign-In / Apple Sign-In — optional social authentication{"\n\n"}
          These services have their own privacy policies. We do not sell your personal data to any third party.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          4. Data Storage & Security
        </Text>
        <Text style={[styles.body, { color: colors.textSecondary }]}>
          Your data is stored securely using Supabase's infrastructure with row-level security policies. We also store learning data locally on your device for offline access. All network communication uses HTTPS encryption.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          5. Data Deletion
        </Text>
        <Text style={[styles.body, { color: colors.textSecondary }]}>
          You can delete your account and all associated data at any time from the Profile screen in the app. Account deletion is permanent and cannot be undone. Upon deletion, all your personal data, learning progress, and account information are removed from our servers.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          6. Children's Privacy
        </Text>
        <Text style={[styles.body, { color: colors.textSecondary }]}>
          Lumora is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          7. Changes to This Policy
        </Text>
        <Text style={[styles.body, { color: colors.textSecondary }]}>
          We may update this Privacy Policy from time to time. We will notify you of any material changes through the app.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          8. Contact Us
        </Text>
        <Text style={[styles.body, { color: colors.textSecondary }]}>
          If you have questions about this Privacy Policy, please contact us at brendan.milton1211@gmail.com.
        </Text>

        <View style={styles.bottomSpacing} />
      </ScrollView>
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
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
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
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  lastUpdated: {
    fontSize: 13,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginTop: 24,
    marginBottom: 8,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  bottomSpacing: {
    height: 40,
  },
});
