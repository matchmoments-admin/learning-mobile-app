import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/design-system/components/Text';
import { useTheme } from '@/design-system/ThemeProvider';

export default function ModalScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text type="title">This is a modal</Text>
      <Link href="/" dismissTo style={styles.link}>
        <Text type="link">Go to home screen</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
