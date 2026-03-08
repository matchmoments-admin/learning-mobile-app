import { ListeningOption } from "@/constants/ContentTypes";
import { useTheme } from "@/design-system/ThemeProvider";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "@/design-system/components/Text";

export default function ListeningMultipleChoiceMode({
  options,
  selectedOption,
  handleOptionPress,
  isLoading,
  showResult,
}: {
  options: ListeningOption[];
  selectedOption: number | null;
  handleOptionPress: (id: number) => void;
  isLoading: boolean;
  showResult: boolean;
}) {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.promptContainer}>
        <Text type="subtitle" style={styles.sectionTitle}>
          What did you just hear?
        </Text>
      </View>
      <ScrollView
        style={styles.optionsScrollView}
        contentContainerStyle={styles.optionsContentContainer}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!isLoading && !showResult}
      >
        {options.map((option) => {
          const isSelected = selectedOption === option.id;

          return (
            <Pressable
              key={option.id}
              style={[
                styles.optionButton,
                isSelected && styles.selectedOption,
                {
                  backgroundColor: colors.card,
                  borderColor: isSelected
                    ? colors.primary
                    : colors.border,
                  opacity: isLoading || showResult ? 0.7 : 1,
                  marginBottom: 16,
                  ...Platform.select({
                    ios: {
                      shadowColor: colors.shadow,
                    },
                  }),
                },
              ]}
              onPress={() => handleOptionPress(option.id)}
              disabled={isLoading || showResult}
              accessibilityRole="button"
              accessibilityLabel={`Answer option: ${option.translation}`}
              accessibilityState={{ selected: isSelected, disabled: isLoading || showResult }}
            >
              <Text style={styles.optionText}>
                {option.translation}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    marginBottom: 20,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  promptContainer: {
    justifyContent: "center",
    alignItems: "center",
    minHeight: 50,
  },
  optionsScrollView: {
    flex: 1,
  },
  optionsContentContainer: {
    paddingBottom: 0,
  },
  optionButton: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    overflow: "visible",
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  selectedOption: {
    ...Platform.select({
      ios: {
        shadowOpacity: 0.2,
      },
      android: {
        borderWidth: 3,
      },
    }),
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
});
