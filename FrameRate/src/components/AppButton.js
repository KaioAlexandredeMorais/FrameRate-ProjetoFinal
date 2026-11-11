
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';

function AppButton({ title, onPress, variant = 'primary', disabled = false }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        variant === 'secondary' && styles.secondary,
        disabled && styles.disabled,
      ]}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondary: {
    backgroundColor: colors.surfaceLight,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: 'bold',
  },
});

export default AppButton;
