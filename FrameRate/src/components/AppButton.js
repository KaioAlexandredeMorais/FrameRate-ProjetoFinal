import { Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';


function AppButton({ title, onPress, variant = 'primary', disabled = false, loading = false }) {
  const inactive = disabled || loading;

  return (
    <Pressable onPress={onPress} disabled={inactive}
      style={[
        styles.button,
        variant === 'secondary' && styles.secondary,
        variant === 'outline' && styles.outline,
        variant === 'danger' && styles.danger,
        inactive && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.text} />
      ) : (
        <Text style={[styles.text, variant === 'outline' && styles.outlineText]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  secondary: {
    backgroundColor: colors.surfaceLight,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  danger: {
    backgroundColor: colors.error,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: 'bold',
  },
  outlineText: {
    color: colors.textSecondary,
  },
});

export default AppButton;
