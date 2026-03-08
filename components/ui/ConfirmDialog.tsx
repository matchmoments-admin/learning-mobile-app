import { useTheme } from "@/design-system/ThemeProvider";
import { Text } from "@/design-system/components/Text";
import { Modal, Pressable, StyleSheet, View } from "react-native";

export default function ConfirmDialog({
  visible,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onCancel,
  onConfirm,
  destructive = false,
}: {
  visible: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}) {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text type="defaultSemiBold" style={styles.title}>
            {title}
          </Text>
          {description ? (
            <Text style={[styles.description, { opacity: 0.8 }]}>
              {description}
            </Text>
          ) : null}

          <View style={styles.actions}>
            <Pressable
              style={[
                styles.button,
                styles.cancel,
                { backgroundColor: colors.backgroundSecondary },
              ]}
              onPress={onCancel}
            >
              <Text type="defaultSemiBold">{cancelLabel}</Text>
            </Pressable>

            <Pressable
              style={[
                styles.button,
                {
                  backgroundColor: destructive
                    ? colors.error
                    : colors.primary,
                },
              ]}
              onPress={onConfirm}
            >
              <Text
                type="defaultSemiBold"
                color={colors.textInverse}
              >
                {confirmLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    borderRadius: 16,
    padding: 16,
  },
  title: {
    fontSize: 18,
  },
  description: {
    marginTop: 8,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 16,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  cancel: {},
});
