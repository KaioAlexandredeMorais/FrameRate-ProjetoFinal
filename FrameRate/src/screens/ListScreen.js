// codigo-pedro (substitui o placeholder anterior)
import { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen, EmptyState, Loading, FilterChips, ReviewCard, WatchlistItem } from '../components';
import { useMovies } from '../context/MoviesContext';
import { scheduleMovieReminder } from '../services/notificationService';
import { formatDate } from '../utils/format';
import { colors, spacing, typography } from '../theme';

const TABS = { REVIEWS: 'reviews', WATCHLIST: 'watchlist' };

const RATING_OPTIONS = [
  { value: 0, label: 'Qualquer nota' },
  { value: 3, label: '★ 3 ou mais' },
  { value: 4, label: '★ 4 ou mais' },
  { value: 5, label: '★ 5' },
];

const toSummary = (item) => ({
  movieId: item.movieId,
  title: item.title,
  posterPath: item.posterPath,
  genres: item.genres,
  year: item.year,
});

function ListScreen({ navigation }) {
  const [tab, setTab] = useState(TABS.REVIEWS);
  const {
    loading, error, reviews, watchlist, filteredReviews, filteredWatchlist,
    filters, genres, setFilters, removeFromWatchlist,
  } = useMovies();

  const isReviews = tab === TABS.REVIEWS;
  const data = isReviews ? filteredReviews : filteredWatchlist;
  const totalWithoutFilters = isReviews ? reviews.length : watchlist.length;

  const genreOptions = [{ value: null, label: 'Todos' }, ...genres.map((g) => ({ value: g, label: g }))];

  async function handleRemind(item) {
    try {
      const date = await scheduleMovieReminder(item.title);
      if (!date) {
        Alert.alert('Permissão necessária', 'Ative as notificações nas configurações do aparelho para receber lembretes.');
        return;
      }
      const hour = String(date.getHours()).padStart(2, '0');
      Alert.alert('Lembrete criado', `Vamos te avisar em ${formatDate(date)} às ${hour}h.`);
        } catch (e) {
      console.warn('Erro no lembrete:', e);
      Alert.alert('Erro', `Não foi possível criar o lembrete.\n\n${e.message}`);
    }
  }

  function handleRemove(item) {
    Alert.alert('Remover da lista', `Tirar "${item.title}" de "Quero ver"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: () => removeFromWatchlist(item.movieId).catch(() => Alert.alert('Erro', 'Não foi possível remover.')),
      },
    ]);
  }

  function renderItem({ item }) {
    if (isReviews) {
      return <ReviewCard review={item} onPress={(r) => navigation.navigate('ReviewForm', { movie: toSummary(r) })} />;
    }
    return (
      <WatchlistItem
        item={item}
        onPress={(i) => navigation.navigate('MovieDetails', { movieId: i.movieId })}
        onRemind={handleRemind}
        onRemove={handleRemove}
      />
    );
  }

  function renderEmpty() {
    if (totalWithoutFilters > 0) {
      return <EmptyState title="Nada encontrado" message="Nenhum filme combina com os filtros escolhidos." />;
    }
    return isReviews ? (
      <EmptyState title="Você ainda não avaliou nenhum filme" message="Abra um filme e toque em “Avaliar” para registrá-lo aqui." />
    ) : (
      <EmptyState title="Sua lista está vazia" message="Toque em “Quero ver” nos detalhes de um filme para guardá-lo aqui." />
    );
  }

  return (
    <Screen>
      <Text style={styles.title}>Minha Lista</Text>
      <Text style={styles.subtitle}>Sua história como espectador.</Text>

      <View style={styles.tabs}>
        {[
          { key: TABS.REVIEWS, label: `Avaliados (${reviews.length})` },
          { key: TABS.WATCHLIST, label: `Quero ver (${watchlist.length})` },
        ].map((t) => (
          <Pressable key={t.key} onPress={() => setTab(t.key)} style={[styles.tab, tab === t.key && styles.tabActive]}>
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      {genres.length > 0 && (
        <FilterChips options={genreOptions} selected={filters.genre} onSelect={(genre) => setFilters({ genre })} />
      )}
      {isReviews && reviews.length > 0 && (
        <FilterChips options={RATING_OPTIONS} selected={filters.minRating} onSelect={(minRating) => setFilters({ minRating })} />
      )}

      {loading ? (
        <Loading message="Carregando sua lista..." />
      ) : error ? (
        <EmptyState title="Ops!" message={error} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={data.length === 0 ? styles.emptyContainer : styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: typography.title, fontWeight: 'bold', marginTop: spacing.lg },
  subtitle: { color: colors.textSecondary, fontSize: typography.body, marginTop: spacing.sm, marginBottom: spacing.md },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: spacing.md,
  },
  tab: { flex: 1, paddingVertical: spacing.sm + 2, borderRadius: 9, alignItems: 'center' },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.textSecondary, fontWeight: '600', fontSize: 14 },
  tabTextActive: { color: colors.text },
  listContent: { paddingTop: spacing.sm, paddingBottom: spacing.xl },
  emptyContainer: { flexGrow: 1 },
});

export default ListScreen;
