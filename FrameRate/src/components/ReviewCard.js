import { Pressable, StyleSheet, Text, View } from 'react-native';
import PosterThumb from './PosterThumb';
import StarRating from './StarRating';
import { formatDate } from '../utils/format';
import { colors, spacing, typography } from '../theme';

function ReviewCard({ review, onPress }) {
  return (
    <Pressable onPress={() => onPress(review)} style={styles.card}>
      <PosterThumb posterPath={review.posterPath} />

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {review.title}
          {review.year ? <Text style={styles.year}> ({review.year})</Text> : null}
        </Text>
        <StarRating value={review.rating} size={16} />
        <Text style={styles.date}>Assistido em {formatDate(review.watchedAt)}</Text>
        {review.text ? (
          <Text style={styles.text} numberOfLines={3}>
            {review.text}
          </Text>
        ) : null}
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
  title: { color: colors.text, fontSize: typography.body, fontWeight: 'bold', marginBottom: spacing.xs },
  year: { color: colors.textSecondary, fontWeight: 'normal' },
  date: { color: colors.textSecondary, fontSize: typography.small, marginTop: spacing.xs },
  text: { color: colors.textSecondary, fontSize: 14, lineHeight: 20, marginTop: spacing.sm },
});

export default ReviewCard;
