import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, FlatList, ScrollView, ActivityIndicator } from 'react-native';
import { Screen, AppButton } from '../components';
import { colors, spacing, typography } from '../theme';
import { getMovieDetails, getImageUrl } from '../services/tmdbService';

function formatRuntime(minutes) {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
}

function formatDate(isoDate) {
  if (!isoDate) return null;
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

function MovieDetailsScreen({ navigation, route }) {
  const movieId = route?.params?.movieId;
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageFailed, setImageFailed] = useState(false);

  const load = useCallback(async () => {
    if (!movieId) {
      setError('Filme não informado.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      setMovie(await getMovieDetails(movieId));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [movieId]);

  useEffect(() => {
    load();
  }, [load]);

  const backButton = (
    <AppButton title="Voltar" variant="secondary" onPress={() => navigation.goBack()} />
  );

  if (loading) {
    return (
      <Screen>
        <Text style={styles.title}>Detalhes do filme</Text>
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      </Screen>
    );
  }

  if (error || !movie) {
    return (
      <Screen>
        <Text style={styles.title}>Detalhes do filme</Text>
        <Text style={styles.description}>
          {error || 'Filme não encontrado.'}
        </Text>
        <AppButton title="Tentar novamente" onPress={load} />
        <View style={styles.buttonSpacing}>{backButton}</View>
      </Screen>
    );
  }

  const imageUrl = getImageUrl(movie.backdrop_path || movie.poster_path, 'w780');
  const year = movie.release_date ? movie.release_date.slice(0, 4) : null;
  const runtime = formatRuntime(movie.runtime);
  const releaseDate = formatDate(movie.release_date);
  const director = movie.credits?.crew?.find((p) => p.job === 'Director');
  const cast = (movie.credits?.cast || []).slice(0, 15);

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: spacing.xl }}>
      <Text style={styles.title}>Detalhes do filme</Text>

      {imageUrl && !imageFailed ? (
        <Image source={{ uri: imageUrl }} style={styles.poster} onError={() => setImageFailed(true)} />
      ) : (
        <View style={[styles.poster, styles.posterPlaceholder]}>
          <Image source={require('../../assets/no-image-small.png')} style={styles.noImageIcon} resizeMode="contain" />
        </View>
      )}

      <Text style={styles.movieTitle}>
        {movie.title}
        {year ? <Text style={styles.year}> ({year})</Text> : null}
      </Text>

      <View style={styles.infoRow}>
        {movie.vote_average > 0 && (
          <Text style={styles.rating}>★ {movie.vote_average.toFixed(1)}</Text>
        )}
        {runtime && <Text style={styles.info}>{runtime}</Text>}
        {releaseDate && <Text style={styles.info}>{releaseDate}</Text>}
      </View>

      {movie.genres?.length > 0 && (
        <View style={styles.genres}>
          {movie.genres.map((genre) => (
            <View key={genre.id} style={styles.genreChip}>
              <Text style={styles.genreText}>{genre.name}</Text>
            </View>
          ))}
        </View>
      )}

      {director && (
        <Text style={styles.info}>Direção: {director.name}</Text>
      )}

      <Text style={styles.sectionTitle}>Sinopse</Text>
      <Text style={styles.description}>
        {movie.overview || 'Sinopse não disponível em português.'}
      </Text>

      {cast.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Elenco</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={cast}
            keyExtractor={(item) => String(item.credit_id || item.id)}
            style={styles.castList}
            renderItem={({ item }) => {
              const photo = getImageUrl(item.profile_path, 'w185');
              return (
                <View style={styles.castItem}>
                  {photo ? (
                    <Image source={{ uri: photo }} style={styles.castPhoto} />
                  ) : (
                    <View style={[styles.castPhoto, styles.castPlaceholder]} />
                  )}
                  <Text style={styles.castName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.castRole} numberOfLines={2}>
                    {item.character}
                  </Text>
                </View>
              );
            }}
          />
        </>
      )}

      <View style={styles.buttonSpacing}>{backButton}</View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: 'bold',
    marginVertical: spacing.lg,
  },
  loader: {
    marginTop: spacing.xl,
  },
  poster: {
    height: 220,
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: spacing.lg,
  },
  posterPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageIcon: {
    width: 90,
    height: 90,
    opacity: 0.9,
  },
  movieTitle: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  year: {
    color: colors.textSecondary,
    fontWeight: 'normal',
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  rating: {
    color: colors.primary,
    fontSize: typography.body,
    fontWeight: 'bold',
    marginRight: spacing.md,
  },
  info: {
    color: colors.textSecondary,
    fontSize: typography.body,
    marginRight: spacing.md,
  },
  genres: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  genreChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  genreText: {
    color: colors.text,
    fontSize: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.subtitle,
    fontWeight: 'bold',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  description: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  castList: {
    marginBottom: spacing.xl,
  },
  castItem: {
    width: 90,
    marginRight: spacing.md,
  },
  castPhoto: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.surface,
  },
  castPlaceholder: {
    opacity: 0.6,
  },
  castName: {
    color: colors.text,
    fontSize: 12,
    textAlign: 'center',
    marginTop: spacing.xs + 2,
  },
  castRole: {
    color: colors.textSecondary,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
  },
  buttonSpacing: {
    marginBottom: spacing.xl,
  },
});

export default MovieDetailsScreen;