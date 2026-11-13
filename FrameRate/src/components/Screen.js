import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

function Screen({ children, style }) {
  return (
    <View style={[styles.container, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
});

export default Screen;
