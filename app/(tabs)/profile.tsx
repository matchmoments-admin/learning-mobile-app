import { Paywall } from "@/components/subscription/Paywall";
import { Text } from "@/design-system/components/Text";
import { useTheme } from "@/design-system/ThemeProvider";
import { useAuth } from "@/ctx/AuthContext";
import { useSpeakingListningStats } from "@/hooks/useSpeakingListeningStats";
import { useStreakState } from "@/hooks/useStreakState";
import { useXpState } from "@/hooks/useXpState";
import { supabase } from "@/utils/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

export default function ProfileContent() {
  const { colors } = useTheme();
  const { isPremium, premiumExpiresAt, profile, user } = useAuth();
  const [paywallVisible, setPaywallVisible] = useState(false);
  const { stats, loading } = useSpeakingListningStats();
  const { streakState } = useStreakState();
  const { xpState } = useXpState();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        await supabase.auth.signOut({ scope: "local" });
        toast.success("Signed out successfully");
        return;
      } else {
        toast.success("Signed out successfully");
      }
    } catch (error) {
      try {
        await supabase.auth.signOut({ scope: "local" });
        toast.success("Signed out successfully");
      } catch {
        toast.error("Failed to sign out. Please restart the app.");
      }
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top", "left", "right"]}
    >
      <View style={styles.container}>
        {/* Header */}
        <View
          style={[styles.header, { borderBottomColor: colors.border }]}
        >
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Info Card */}
          <View
            style={[
              styles.profileCard,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                shadowColor: colors.shadow,
              },
            ]}
          >
            <View
              style={[
                styles.avatarContainer,
                { backgroundColor: colors.primary },
              ]}
            >
              <Text style={[styles.avatarText, { color: colors.textInverse }]}>
                {profile.full_name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.userName}>{profile.full_name}</Text>
            <Text
              style={[styles.userEmail, { color: colors.textSecondary }]}
            >
              {user?.email}
            </Text>
          </View>

          {/* Statistics */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={styles.statValueContainer}>
                <Text style={styles.statValue}>
                  {xpState?.totalXp ?? 0}
                </Text>
              </View>
              <Text
                style={[styles.statLabel, { color: colors.textSecondary }]}
              >
                total XP
              </Text>
            </View>

            <View
              style={[
                styles.statSeparator,
                { backgroundColor: colors.border },
              ]}
            />

            <View style={styles.statItem}>
              <View style={styles.statValueContainer}>
                <Text style={styles.statValue}>
                  {streakState?.currentStreak ?? 0}
                </Text>
                <Ionicons
                  name="flame"
                  size={16}
                  color={colors.warning}
                  style={{ marginLeft: 2 }}
                />
              </View>
              <Text
                style={[styles.statLabel, { color: colors.textSecondary }]}
              >
                day streak
              </Text>
            </View>

            <View
              style={[
                styles.statSeparator,
                { backgroundColor: colors.border },
              ]}
            />

            <View style={styles.statItem}>
              <View style={styles.statValueContainer}>
                <Text style={styles.statValue}>
                  {xpState?.level ?? 1}
                </Text>
              </View>
              <Text
                style={[styles.statLabel, { color: colors.textSecondary }]}
              >
                level
              </Text>
            </View>
          </View>

          {/* Premium card */}
          <TouchableOpacity
            style={[
              styles.premiumCard,
              {
                backgroundColor: colors.primary,
                shadowColor: colors.shadow,
              },
            ]}
            onPress={() => {
              if (!isPremium) setPaywallVisible(true);
            }}
          >
            <View style={styles.premiumLeft}>
              <Ionicons name="star" size={24} color={colors.textInverse} />
              <View style={styles.premiumText}>
                <Text style={[styles.premiumTitle, { color: colors.textInverse }]}>
                  {isPremium ? "Premium Active" : "Get Premium"}
                </Text>
                <Text style={[styles.premiumSubtitle, { color: colors.textInverse }]}>
                  {isPremium
                    ? premiumExpiresAt
                      ? `Premium ends ${new Date(premiumExpiresAt).toLocaleDateString()}`
                      : "Unlocked premium features"
                    : "Unlock all chapters & AI conversations"}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textInverse} />
          </TouchableOpacity>

          {/* Settings Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Settings</Text>
            <View
              style={[
                styles.menuCard,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  shadowColor: colors.shadow,
                },
              ]}
            >
              <TouchableOpacity
                style={[styles.menuItem, { borderColor: colors.border }]}
                onPress={() =>
                  Alert.alert(
                    "Settings",
                    "Language, notifications, and app preferences",
                  )
                }
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons
                    name="settings-outline"
                    size={24}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.menuItemTitle}>
                    App Settings
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItemLast}
                onPress={() =>
                  Alert.alert(
                    "Help",
                    "Get help, contact support, and view FAQs",
                  )
                }
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons
                    name="help-circle-outline"
                    size={24}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.menuItemTitle}>
                    Help & Support
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign Out Button */}
          <TouchableOpacity
            onPress={handleSignOut}
            style={[styles.signOutButton, { borderColor: colors.border }]}
          >
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
            <Text style={[styles.signOutText, { color: colors.error }]}>Sign Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <Paywall
        visible={paywallVisible}
        onClose={() => setPaywallVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingBottom: 70,
  },
  profileCard: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 2,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    lineHeight: 36,
    textAlign: "center",
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    marginBottom: 20,
    gap: 24,
  },
  statItem: {
    alignItems: "center",
  },
  statValueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statChangePositive: {
    fontSize: 14,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: -2,
  },
  statSeparator: {
    width: 1,
    height: 24,
  },
  premiumCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 24,
    marginBottom: 32,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  premiumLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  premiumText: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 2,
  },
  premiumSubtitle: {
    fontSize: 13,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 12,
  },
  menuCard: {
    borderRadius: 24,
    borderWidth: 2,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
  },
  menuItemLast: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 2,
    gap: 8,
    marginTop: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
