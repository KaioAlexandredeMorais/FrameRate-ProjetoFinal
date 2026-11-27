import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';

function AppInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  multiline = false,
  error,
  autoCapitalize,
  maxLength,
  editable = true,
}) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TextInput
        style={[styles.input, multiline && styles.multiline, error && styles.inputError, !editable && styles.disabled]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        autoCapitalize={autoCapitalize}
        maxLength={maxLength}
        editable={editable}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    color: colors.text,
    fontSize: typography.body,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: spacing.md,
    fontSize: typography.body,
  },
  inputError: {
    borderColor: colors.error,
  },
  disabled: {
    opacity: 0.6,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  error: {
    color: colors.error,
    fontSize: typography.small,
    marginTop: spacing.xs,
  },
});

export default AppInput;
