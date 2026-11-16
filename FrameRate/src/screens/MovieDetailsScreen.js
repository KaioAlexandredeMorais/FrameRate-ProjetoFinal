import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Alert, // mudou-pedro: Alert
  Linking,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Screen, AppButton } from '../components';
import { useMovies } from '../context/MoviesContext'; // mudou-pedro
import { colors, spacing, typography } from '../theme';
import MovieCard from '../components/MovieCard';
import { getMovieDetails, getCollection, getImageUrl } from '../services/tmdbService';

const PROVIDER_GROUPS = [
  { key: 'flatrate', label: 'Incluso na assinatura' },
  { key: 'rent', label: 'Alugar' },
  { key: 'buy', label: 'Comprar' },
];

// Prefere trailers oficiais; se não houver nenhum, usa teasers
function pickTrailers(videos = []) {
  const youtube = videos.filter((v) => v.site === 'YouTube');
  const trailers = youtube.filter((v) => v.type === 'Trailer');
  const list = trailers.length > 0 ? trailers : youtube.filter((v) => v.type === 'Teaser');
  return [...list].sort((a, b) => Number(b.official) - Number(a.official)).slice(0, 3);
}

function openYoutube(key) {
  Linking.openURL(`https://www.youtube.com/watch?v=${key}`).catch(() =>
    Alert.alert('Erro', 'Não foi possível abrir o YouTube.')
  );
}

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
  const [collection, setCollection] = useState(null);
  const [relatedTab, setRelatedTab] = useState('collection');
  const [playingKey, setPlayingKey] = useState(null);
  const { width: windowWidth } = useWindowDimensions();
  // mudou-pedro: estado global (avaliação e lista "Quero ver")
  const { getReviewByMovie, isInWatchlist, addToWatchlist, removeFromWatchlist } = useMovies();
  const [watchlistBusy, setWatchlistBusy] = useState(false);

  const load = useCallback(async () => {
    if (!movieId) {
      setError('Filme não informado.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getMovieDetails(movieId);
      setMovie(data);
      setCollection(null);
      setPlayingKey(null);
      // A coleção é secundária: se falhar, a tela continua normal
      if (data.belongs_to_collection?.id) {
        getCollection(data.belongs_to_collection.id)
          .then(setCollection)
          .catch(() => {});
      }
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

  const trailers = pickTrailers(movie.videos?.results);
  const providerGroups = PROVIDER_GROUPS.map((g) => ({
    ...g,
    items: movie['watch/providers']?.results?.BR?.[g.key] || [],
  })).filter((g) => g.items.length > 0);
  const recommendations = (movie.recommendations?.results || []).slice(0, 12);
  const collectionParts = (collection?.parts || [])
    .filter((p) => p.id !== movie.id)
    .sort((a, b) => (a.release_date || '').localeCompare(b.release_date || ''));
  const hasCollection = collectionParts.length > 0;
  const activeTab = hasCollection ? relatedTab : 'related';
  const relatedMovies = activeTab === 'collection' ? collectionParts : recommendations;
  const playerWidth = windowWidth - spacing.md * 2; // Screen usa spacing.md de padding

  // mudou-pedro: início (resumo do filme + ação de "Quero ver")
  // Resumo salvo junto com a avaliação / item da lista "Quero ver".
  const summary = {
    movieId: movie.id,
    title: movie.title,
    posterPath: movie.poster_path,
    genres: (movie.genres || []).map((g) => g.name),
    year: year ? Number(year) : null,
  };
  const reviewed = Boolean(getReviewByMovie(movie.id));
  const inWatchlist = isInWatchlist(movie.id);

  async function toggleWatchlist() {
    setWatchlistBusy(true);
    try {
      if (inWatchlist) await removeFromWatchlist(movie.id);
      else await addToWatchlist(summary);
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar sua lista. Tente novamente.');
    } finally {
      setWatchlistBusy(false);
    }
  }
  // mudou-pedro: fim

  // push empilha o novo filme, então "Voltar" retorna ao filme anterior
  const openMovie = (m) => {
    if (navigation.push) navigation.push('MovieDetails', { movieId: m.id });
    else navigation.navigate('MovieDetails', { movieId: m.id });
  };

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

      {trailers.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Trailers</Text>
          {trailers.map((video) => (
            <View key={video.id} style={styles.trailerCard}>
              {playingKey === video.key ? (
                <YoutubePlayer
                  height={Math.round((playerWidth * 9) / 16)}
                  width={playerWidth}
                  videoId={video.key}
                  play
                />
              ) : (
                <Pressable onPress={() => setPlayingKey(video.key)} style={styles.trailerThumbWrap}>
                  <Image
                    source={{ uri: `https://img.youtube.com/vi/${video.key}/hqdefault.jpg` }}
                    style={styles.trailerThumb}
                  />
                  <View style={styles.playBadge}>
                    <Ionicons name="play" size={28} color="#fff" />
                  </View>
                </Pressable>
              )}
              <View style={styles.trailerFooter}>
                <Text style={styles.trailerName} numberOfLines={2}>
                  {video.name}
                </Text>
                <Pressable onPress={() => openYoutube(video.key)} hitSlop={8}>
                  <Text style={styles.youtubeLink}>Abrir no YouTube</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </>
      )}

      {providerGroups.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Onde assistir</Text>
          {providerGroups.map((group) => (
            <View key={group.key} style={styles.providerGroup}>
              <Text style={styles.providerLabel}>{group.label}</Text>
              <View style={styles.providerRow}>
                {group.items.map((p) => (
                  <View key={p.provider_id} style={styles.providerItem}>
                    {p.logo_path ? (
                      <Image
                        source={{ uri: getImageUrl(p.logo_path, 'w92') }}
                        style={styles.providerLogo}
                      />
                    ) : (
                      <View style={styles.providerLogo} />
                    )}
                    <Text style={styles.providerName} numberOfLines={2}>
                      {p.provider_name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
          <Text style={styles.credit}>
            Disponibilidade no Brasil, fornecida por JustWatch. Pode variar por período.
          </Text>
        </>
      )}

      {(hasCollection || recommendations.length > 0) && (
        <>
          {hasCollection ? (
            <View style={styles.tabs}>
              {[
                { key: 'collection', label: 'Coleção' },
                { key: 'related', label: 'Relacionados' },
              ].map((tab) => (
                <Pressable
                  key={tab.key}
                  onPress={() => setRelatedTab(tab.key)}
                  style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                >
                  <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                    {tab.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : (
            <Text style={styles.sectionTitle}>Relacionados</Text>
          )}

          {activeTab === 'collection' && (
            <Text style={styles.collectionName}>{collection.name}</Text>
          )}

          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={relatedMovies}
            keyExtractor={(item) => String(item.id)}
            style={styles.relatedList}
            ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
            renderItem={({ item }) => <MovieCard movie={item} onPress={openMovie} width={110} />}
          />
        </>
      )}

      {/* mudou-pedro: botões Avaliar / Quero ver */}
      <View style={styles.buttonSpacing}>
        <AppButton
          title={reviewed ? 'Editar minha avaliação' : 'Avaliar'}
          onPress={() => navigation.navigate('ReviewForm', { movie: summary })}
        />
      </View>
      {!reviewed && (
        <View style={styles.buttonSpacing}>
          <AppButton
            title={inWatchlist ? 'Remover de "Quero ver"' : 'Quero ver'}
            variant="secondary"
            onPress={toggleWatchlist}
            loading={watchlistBusy}
          />
        </View>
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
  trailerCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  trailerThumbWrap: {
    width: '100%',
    aspectRatio: 16 / 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trailerThumb: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.surface,
  },
  playBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 3,
  },
  trailerFooter: {
    padding: spacing.md,
  },
  trailerName: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '600',
  },
  youtubeLink: {
    color: colors.primary,
    fontSize: typography.body,
    fontWeight: 'bold',
    marginTop: spacing.xs + 2,
  },
  providerGroup: {
    marginBottom: spacing.md,
  },
  providerLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  providerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  providerItem: {
    width: 72,
    marginRight: spacing.md,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  providerLogo: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  providerName: {
    color: colors.text,
    fontSize: 11,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  credit: {
    color: colors.textSecondary,
    fontSize: 11,
    marginBottom: spacing.md,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 4,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.background,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: typography.body,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.text,
  },
  collectionName: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  relatedList: {
    marginBottom: spacing.xl,
  },
  buttonSpacing: {
    marginBottom: spacing.xl,
  },
});

export default MovieDetailsScreen;