import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { getImageUrl } from '../services/tmdbService';
import { colors, spacing } from '../theme';

export default function MovieCard({ movie, onPress, width = 120 }) {
  const posterUrl = getImageUrl(movie.poster_path, 'w342');
  const [failed, setFailed] = useState(false);
  const showPoster = posterUrl && !failed;

  return (
    <Pressable onPress={() => onPress(movie)} style={{ width }}>
      {showPoster ? (
        <Image source={{ uri: posterUrl }} style={styles.poster} onError={() => setFailed(true)} />
      ) : (
        <View style={[styles.poster, styles.placeholder]}>
          <Image source={require('../../assets/no-image-small.png')} style={styles.placeholderIcon} resizeMode="contain" />
        </View>
      )}
      <Text style={styles.title} numberOfLines={2}>
        {movie.title}
      </Text>
      {movie.vote_average > 0 && (
        <Text style={styles.rating}>★ {movie.vote_average.toFixed(1)}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  poster: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  placeholderIcon: { width: 44, height: 44, opacity: 0.9 },
  title: { color: colors.text, fontSize: 13, marginTop: spacing.xs + 2 },
  rating: { color: colors.primary, fontSize: 12, marginTop: 2 },
});