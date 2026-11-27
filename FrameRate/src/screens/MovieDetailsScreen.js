import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, FlatList, ScrollView, ActivityIndicator, Alert, Linking, Pressable, Modal, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Screen, AppButton } from '../components';
import MovieCard from '../components/MovieCard';
import { useAuth } from '../context/AuthContext';
import { useMovies } from '../context/MoviesContext';
import { getMovieDetails, getCollection, getImageUrl } from '../services/tmdbService';
import { getMovieReviews } from '../services/communityReviewsService';
import { formatDate as formatDateBR, toDate } from '../utils/format';
import { colors, spacing, typography } from '../theme';

const STAR_COLOR = '#FFC83D';

const TABS = [
  { key: 'details', label: 'Detalhes' },
  { key: 'reviews', label: 'Avaliações' },
  { key: 'trailers', label: 'Trailers' },
];

const PROVIDER_GROUPS = [
  { key: 'flatrate', label: 'Incluso na assinatura' },
  { key: 'rent', label: 'Alugar' },
  { key: 'buy', label: 'Comprar' },
];

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

function formatReleaseDate(isoDate) {
  if (!isoDate) return null;
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

function Stars({ rating = 0, size = 14 }) {
  return (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Ionicons key={n} name={n <= rating ? 'star' : 'star-outline'} size={size} color={STAR_COLOR} />
      ))}
    </View>
  );
}

function MovieDetailsScreen({ navigation, route }) {
  const movieId = route?.params?.movieId;
  const { user } = useAuth();
  const { width: windowWidth } = useWindowDimensions();
  const { getReviewByMovie, isInWatchlist, addToWatchlist, removeFromWatchlist, customLists = [], addMovieToCustomList, removeMovieFromCustomList } = useMovies();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageFailed, setImageFailed] = useState(false);
  const [collection, setCollection] = useState(null);
  const [relatedTab, setRelatedTab] = useState('collection');
  const [playingKey, setPlayingKey] = useState(null);
  const [tab, setTab] = useState('details');
  const [listModalVisible, setListModalVisible] = useState(false);
  const [busyKey, setBusyKey] = useState(null);
  const [community, setCommunity] = useState({ items: [], loading: false, error: null });
  const [reviewsReload, setReviewsReload] = useState(0);
  const myReview = movieId ? getReviewByMovie(movieId) : undefined;
  const myReviewKey = myReview ? `${myReview.id}|${myReview.rating}|${myReview.text ?? ''}` : 'none';

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

  useEffect(() => {
    if (!movieId) return undefined;

    let cancelled = false;
    setCommunity((prev) => ({ ...prev, loading: true, error: null }));
    getMovieReviews(Number(movieId))
      .then((items) => {
        if (!cancelled) setCommunity({ items, loading: false, error: null });
      })
      .catch(() => {
        if (!cancelled) {
          setCommunity((prev) => ({
            ...prev,
            loading: false,
            error: 'Não foi possível carregar as avaliações.',
          }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [movieId, myReviewKey, reviewsReload]);

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      </Screen>
    );
  }

  if (error || !movie) {
    return (
      <Screen>
        <Text style={styles.errorText}>{error || 'Filme não encontrado.'}</Text>
        <AppButton title="Tentar novamente" onPress={load} />
      </Screen>
    );
  }

  const imageUrl = getImageUrl(movie.backdrop_path || movie.poster_path, 'w780');
  const year = movie.release_date ? movie.release_date.slice(0, 4) : null;
  const runtime = formatRuntime(movie.runtime);
  const releaseDate = formatReleaseDate(movie.release_date);
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
  const activeRelatedTab = hasCollection ? relatedTab : 'related';
  const relatedMovies = activeRelatedTab === 'collection' ? collectionParts : recommendations;
  const playerWidth = windowWidth - spacing.md * 2;

  const summary = {
    movieId: movie.id,
    title: movie.title,
    posterPath: movie.poster_path,
    genres: (movie.genres || []).map((g) => g.name),
    year: year ? Number(year) : null,
  };
  const reviewed = Boolean(myReview);
  const inWatchlist = isInWatchlist(movie.id);
  const inCustomList = (list) => (list.movies || []).some((m) => m.movieId === movie.id);
  const inAnyList = inWatchlist || customLists.some(inCustomList);

  const listOptions = [
    ...(!reviewed
      ? [{ key: 'watchlist', label: 'Quero ver', subtitle: null, icon: 'bookmark', checked: inWatchlist }]
      : []),
    ...customLists.map((list) => ({
      key: list.id,
      label: list.name,
      subtitle: list.tag ? `#${list.tag}` : null,
      icon: 'list',
      checked: inCustomList(list),
    })),
  ];

  async function toggleListOption(option) {
    if (busyKey) return;
    setBusyKey(option.key);
    try {
      if (option.key === 'watchlist') {
        if (option.checked) await removeFromWatchlist(movie.id);
        else await addToWatchlist(summary);
      } else if (option.checked) {
        await removeMovieFromCustomList(option.key, movie.id);
      } else {
        await addMovieToCustomList(option.key, summary);
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar a lista. Tente novamente.');
    } finally {
      setBusyKey(null);
    }
  }

  const openMovie = (m) => {
    if (navigation.push) navigation.push('MovieDetails', { movieId: m.id });
    else navigation.navigate('MovieDetails', { movieId: m.id });
  };

  const publicItems = community.items.filter((r) => r.isPublic !== false);
  const communityItems = community.items.filter(
    (r) => r.isPublic !== false || r.userId === user?.uid
  );
  const communityAverage =
    publicItems.length > 0
      ? publicItems.reduce((sum, r) => sum + (r.rating || 0), 0) / publicItems.length
      : null;
  const reviewsCount = community.loading || community.error ? null : publicItems.length;

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: spacing.xl }}>
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

        <View style={styles.actions}>
          <Pressable style={[styles.actionButton, { marginRight: spacing.sm }]} onPress={() => setListModalVisible(true)}>
            <Ionicons name={inAnyList ? 'bookmark' : 'bookmark-outline'} size={22} color={inAnyList ? colors.primary : colors.text} />
            <Text style={styles.actionLabel}>{inAnyList ? 'Na lista' : '+ Lista'}</Text>
          </Pressable>

          <Pressable style={styles.actionButton} onPress={() => navigation.navigate('ReviewForm', { movie: summary })}>
            <Ionicons name={reviewed ? 'star' : 'star-outline'} size={22} color={reviewed ? STAR_COLOR : colors.text} />
            <Text style={styles.actionLabel}>{reviewed ? 'Avaliado' : 'Avaliar'}</Text>
          </Pressable>
        </View>

        <View style={styles.tabBar}>
          {TABS.map((t) => (
            <Pressable key={t.key} onPress={() => setTab(t.key)} style={[styles.tabItem, tab === t.key && styles.tabItemActive]}>
              <Text style={[styles.tabLabel, tab === t.key && styles.tabLabelActive]}>
                {t.key === 'reviews' && reviewsCount !== null
                  ? `${t.label} (${reviewsCount})`
                  : t.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {tab === 'details' && (
          <>
            {director && (
              <Text style={[styles.info, styles.directorText]}>Direção: {director.name}</Text>
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
          </>
        )}

        {tab === 'reviews' && (
          <View style={styles.tabContent}>
            {community.loading && (
              <ActivityIndicator color={colors.primary} style={styles.loader} />
            )}

            {!community.loading && community.error && (
              <View>
                <Text style={styles.errorText}>{community.error}</Text>
                <Pressable onPress={() => setReviewsReload((n) => n + 1)}>
                  <Text style={styles.retryText}>Tentar novamente</Text>
                </Pressable>
              </View>
            )}

            {!community.loading && !community.error && communityItems.length === 0 && (
              <Text style={styles.description}>
                Ainda não há avaliações para este filme. Seja o primeiro a avaliar!
              </Text>
            )}

            {!community.loading && !community.error && communityItems.length > 0 && (
              <>
                {communityAverage !== null && (
                  <Text style={styles.communitySummary}>
                    ★ {communityAverage.toFixed(1)} · {publicItems.length}{' '}
                    {publicItems.length === 1 ? 'avaliação' : 'avaliações'} no FrameRate
                  </Text>
                )}

                {communityItems.map((review) => {
                  const name = review.userName || 'Cinéfilo';
                  const mine = review.userId === user?.uid;
                  const watched = toDate(review.watchedAt);
                  return (
                    <View key={review.id} style={styles.reviewCard}>
                      <View style={styles.reviewHeader}>
                        <View style={styles.reviewAvatar}>
                          <Text style={styles.reviewAvatarText}>
                            {name.trim().charAt(0).toUpperCase() || '?'}
                          </Text>
                        </View>
                        <View style={styles.reviewAuthor}>
                          <Text style={styles.reviewName} numberOfLines={1}>
                            {name}
                            {mine ? <Text style={styles.reviewMine}> · Você</Text> : null}
                            {review.isPublic === false ? (
                              <Text style={styles.reviewDate}> · Privada</Text>
                            ) : null}
                          </Text>
                          {watched ? (
                            <Text style={styles.reviewDate}>Assistido em {formatDateBR(watched)}</Text>
                          ) : null}
                        </View>
                        <Stars rating={review.rating} />
                      </View>
                      {review.text ? <Text style={styles.reviewText}>{review.text}</Text> : null}
                    </View>
                  );
                })}
              </>
            )}
          </View>
        )}

        {tab === 'trailers' && (
          <View style={styles.tabContent}>
            {trailers.length === 0 && (
              <Text style={styles.description}>Nenhum trailer disponível para este filme.</Text>
            )}

            {trailers.map((video) => (
              <View key={video.id} style={styles.trailerCard}>
                {playingKey === video.key ? (
                  <YoutubePlayer height={Math.round((playerWidth * 9) / 16)} width={playerWidth} videoId={video.key} play />
                ) : (
                  <Pressable onPress={() => setPlayingKey(video.key)} style={styles.trailerThumbWrap}>
                    <Image source={{ uri: `https://i.ytimg.com/vi/${video.key}/hqdefault.jpg` }} style={styles.trailerThumb} resizeMode="cover" />
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
          </View>
        )}

        {(hasCollection || recommendations.length > 0) && (
          <>
            {hasCollection ? (
              <View style={styles.segmented}>
                {[
                  { key: 'collection', label: 'Coleção' },
                  { key: 'related', label: 'Relacionados' },
                ].map((s) => (
                  <Pressable key={s.key} onPress={() => setRelatedTab(s.key)} style={[styles.segment, activeRelatedTab === s.key && styles.segmentActive]}>
                    <Text style={[styles.segmentText, activeRelatedTab === s.key && styles.segmentTextActive]}>
                      {s.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <Text style={styles.sectionTitle}>Relacionados</Text>
            )}

            {activeRelatedTab === 'collection' && (
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
      </ScrollView>

      <Modal visible={listModalVisible} transparent animationType="fade" onRequestClose={() => setListModalVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setListModalVisible(false)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <Text style={styles.modalTitle}>Adicionar à lista</Text>
            <Text style={styles.modalSubtitle} numberOfLines={1}>
              {movie.title}
            </Text>

            <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
              {listOptions.map((option) => (
                <Pressable key={option.key} style={styles.optionRow} onPress={() => toggleListOption(option)} disabled={Boolean(busyKey)}>
                  <Ionicons name={option.icon === 'bookmark' ? 'bookmark-outline' : 'list-outline'} size={22} color={colors.text} />
                  <View style={styles.optionText}>
                    <Text style={styles.optionLabel} numberOfLines={1}>
                      {option.label}
                    </Text>
                    {option.subtitle ? (
                      <Text style={styles.optionSubtitle} numberOfLines={1}>
                        {option.subtitle}
                      </Text>
                    ) : null}
                  </View>
                  {busyKey === option.key ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : (
                    <Ionicons name={option.checked ? 'checkmark-circle' : 'ellipse-outline'} size={24} color={option.checked ? colors.primary : colors.textSecondary} />
                  )}
                </Pressable>
              ))}

              {customLists.length === 0 && (
                <Text style={styles.modalHint}>
                  Você ainda não criou listas personalizadas. Crie uma na aba Lista.
                </Text>
              )}
            </ScrollView>

            <AppButton title="Concluir" variant="secondary" onPress={() => setListModalVisible(false)} />
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loader: {
    marginTop: spacing.xl,
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 24,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  retryText: {
    color: colors.primary,
    fontSize: typography.body,
    fontWeight: 'bold',
  },
  poster: {
    height: 220,
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginTop: spacing.sm,
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
    marginBottom: spacing.sm,
  },
  year: {
    color: colors.textSecondary,
    fontWeight: 'normal',
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: spacing.sm,
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
  directorText: {
    marginTop: spacing.md,
  },
  genres: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.xs,
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

  // Ações (lista e avaliar)
  actions: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: spacing.sm + 2,
  },
  actionLabel: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },

  // Abas
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.sm,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  tabItemActive: {
    borderBottomColor: colors.primary,
  },
  tabLabel: {
    color: colors.textSecondary,
    fontSize: typography.body,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: colors.text,
  },
  tabContent: {
    marginTop: spacing.sm,
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
    marginBottom: spacing.sm,
  },

  // Elenco
  castList: {
    marginBottom: spacing.md,
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

  // Avaliações da comunidade
  communitySummary: {
    color: colors.textSecondary,
    fontSize: typography.body,
    marginBottom: spacing.md,
  },
  reviewCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  reviewAvatarText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  reviewAuthor: {
    flex: 1,
    marginRight: spacing.sm,
  },
  reviewName: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '600',
  },
  reviewMine: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  reviewDate: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  reviewText: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22,
    marginTop: spacing.sm,
  },
  stars: {
    flexDirection: 'row',
  },

  // Trailers
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
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

  // Relacionados / coleção
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 4,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: colors.background,
  },
  segmentText: {
    color: colors.textSecondary,
    fontSize: typography.body,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: colors.text,
  },
  collectionName: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  relatedList: {
    marginBottom: spacing.md,
  },

  // Onde assistir
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

  // Modal de listas
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    maxHeight: '75%',
  },
  modalTitle: {
    color: colors.text,
    fontSize: typography.subtitle,
    fontWeight: 'bold',
  },
  modalSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.body,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  modalList: {
    flexGrow: 0,
    marginBottom: spacing.md,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  optionText: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  optionLabel: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '600',
  },
  optionSubtitle: {
    color: colors.primary,
    fontSize: 12,
    marginTop: 2,
  },
  modalHint: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.md,
  },
});

export default MovieDetailsScreen;