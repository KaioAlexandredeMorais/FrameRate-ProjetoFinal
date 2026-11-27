import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PosterThumb from './PosterThumb';
import { formatDate } from '../utils/format';
import { colors, spacing, typography } from '../theme';

function WatchlistItem({ item, onPress, onRemind, onRemove }) {
  return (
    <Pressable onPress={() => onPress(item)} style={styles.card}>
      <PosterThumb posterPath={item.posterPath} />

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
          {item.year ? <Text style={styles.year}> ({item.year})</Text> : null}
        </Text>
        {item.genres?.length > 0 && (
          <Text style={styles.genres} numberOfLines={1}>
            {item.genres.join(' · ')}
          </Text>
        )}
        <Text style={styles.date}>Adicionado em {formatDate(item.addedAt)}</Text>
      </View>

      <View style={styles.actions}>
        <Pressable onPress={() => onRemind(item)} hitSlop={8} style={styles.action} accessibilityLabel="Criar lembrete">
          <Ionicons name="notifications-outline" size={22} color={colors.primary} />
        </Pressable>
        <Pressable onPress={() => onRemove(item)} hitSlop={8} style={styles.action} accessibilityLabel="Remover da lista">
          <Ionicons name="trash-outline" size={22} color={colors.error} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  body: { flex: 1, marginLeft: spacing.md },
  title: { color: colors.text, fontSize: typography.body, fontWeight: 'bold' },
  year: { color: colors.textSecondary, fontWeight: 'normal' },
  genres: { color: colors.textSecondary, fontSize: typography.small + 1, marginTop: spacing.xs },
  date: { color: colors.textSecondary, fontSize: typography.small, marginTop: spacing.sm },
  actions: { justifyContent: 'space-between', alignItems: 'center' },
  action: { padding: spacing.xs },
});

export default WatchlistItem;
