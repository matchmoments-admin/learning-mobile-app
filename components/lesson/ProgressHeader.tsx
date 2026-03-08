import { useTheme } from "@/design-system/ThemeProvider";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/design-system/components/Text";

export default function ProgressHeader({
  progress,
  currentCount,
  totalCount,
  onClose,
}: {
  progress: number;
  currentCount: number;
  totalCount: number;
  onClose: () => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
      <Pressable
        hitSlop={20}
        style={styles.closeButton}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close lesson"
      >
        <Ionicons name="close" size={18} color={colors.textTertiary} />
      </Pressable>
      <View
        style={styles.progressContainer}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: progress }}
        accessibilityLabel={`Question ${currentCount} of ${totalCount}`}
      >
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: colors.primary }]}></View>
        </View>
        <Text style={styles.progressText}>
          {currentCount}/{totalCount}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    marginRight: 16,
    padding: 4,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 15,
    fontWeight: "600",
    minWidth: 45,
  },
});
