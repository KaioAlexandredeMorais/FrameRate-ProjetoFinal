import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { colors, spacing } from '../theme';

function FilterChips({ options, selected, onSelect }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {options.map((option) => {
        const active = option.value === selected;
        return (
          <Pressable key={String(option.value)} onPress={() => onSelect(option.value)} style={[styles.chip, active && styles.chipActive]}>
            <Text style={[styles.label, active && styles.labelActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0, marginBottom: spacing.sm },
  content: { paddingVertical: spacing.xs },
  chip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm - 2,
    marginRight: spacing.sm,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  label: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  labelActive: { color: colors.text },
});

export default FilterChips;
