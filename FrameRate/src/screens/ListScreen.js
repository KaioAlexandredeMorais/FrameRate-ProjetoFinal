import { useState } from 'react';
import { Alert, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen, EmptyState, Loading, FilterChips, ReviewCard, WatchlistItem } from '../components';
import { useMovies } from '../context/MoviesContext';
import { scheduleMovieReminder } from '../services/notificationService';
import { formatDate } from '../utils/format';
import { colors, spacing, typography } from '../theme';

const TABS = {
  REVIEWS: 'reviews',
  WATCHLIST: 'watchlist',
  CUSTOM: 'custom',
};

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

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [listName, setListName] = useState('');
  const [listTag, setListTag] = useState('');
  const [listDescription, setListDescription] = useState('');
  const { loading, error, reviews, watchlist, customLists, filteredReviews, filteredWatchlist, filters, genres, setFilters, removeFromWatchlist, createCustomList } = useMovies();
  const isReviews = tab === TABS.REVIEWS;
  const isWatchlist = tab === TABS.WATCHLIST;

async function handleCreateCustomList() {
  if (!listName.trim()) {
    Alert.alert('Atenção', 'Digite um nome para sua lista.');
    return;
  }

  try {
    await createCustomList({
      name: listName,
      tag: listTag,
      description: listDescription,
    });

    setListName('');
    setListTag('');
    setListDescription('');
    setShowCreateModal(false);

    Alert.alert('Sucesso', 'Sua lista foi criada!');
  } catch (e) {
    Alert.alert('Erro', 'Não foi possível criar sua lista.');
    console.warn(e);
  }
}

const data = isReviews
  ? filteredReviews
  : isWatchlist
    ? filteredWatchlist
    : customLists;

const totalWithoutFilters = isReviews
  ? reviews.length
  : isWatchlist
    ? watchlist.length
    : customLists.length;

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
    return (
      <ReviewCard review={item} onPress={(r) => navigation.navigate('ReviewForm', { movie: toSummary(r) })} />
    );
  }

  if (isWatchlist) {
    return (
      <WatchlistItem
        item={item}
        onPress={(i) =>
          navigation.navigate('MovieDetails', { movieId: i.movieId })
        }
        onRemind={handleRemind}
        onRemove={handleRemove}
      />
    );
  }

  return (
    <View style={styles.customListCard}>
      <Text style={styles.customListTitle}>{item.name}</Text>
      <Text style={styles.customListTag}>#{item.tag}</Text>
      <Text style={styles.customListDescription}>
        {item.description}
      </Text>
      <Text style={styles.customListCount}>
        {item.movies?.length || 0} filmes
      </Text>
    </View>
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
      <Modal visible={showCreateModal} transparent animationType="slide" onRequestClose={() => setShowCreateModal(false)}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Criar nova lista
            </Text>

            <TextInput style={styles.input} placeholder="Nome da lista" placeholderTextColor={colors.textSecondary} value={listName} onChangeText={setListName} />

            <TextInput style={styles.input} placeholder="Tag (ex.: ação, favoritos)" placeholderTextColor={colors.textSecondary} value={listTag} onChangeText={setListTag} />

            <TextInput style={[styles.input, styles.descriptionInput]} placeholder="Descrição da lista" placeholderTextColor={colors.textSecondary} value={listDescription} onChangeText={setListDescription} multiline />

            <Pressable style={styles.createButton} onPress={handleCreateCustomList}>
              <Text style={styles.createButtonText}>
                Salvar lista
              </Text>
            </Pressable>

            <Pressable onPress={() => setShowCreateModal(false)} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>
                Cancelar
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <Text style={styles.title}>Minha Lista</Text>
      <Text style={styles.subtitle}>Sua história como espectador.</Text>

      <View style={styles.tabs}>
        {[
        { key: TABS.REVIEWS, label: `Avaliados (${reviews.length})` },
        { key: TABS.WATCHLIST, label: `Quero ver (${watchlist.length})` },
        { key: TABS.CUSTOM, label: `Minhas listas (${customLists.length})` },
      ].map((t) => (
          <Pressable key={t.key} onPress={() => setTab(t.key)} style={[styles.tab, tab === t.key && styles.tabActive]}>
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </Pressable>
        ))}
           </View>

      {tab === TABS.CUSTOM && (
        <Pressable
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={styles.createButtonText}>+ Criar lista</Text>
        </Pressable>
      )}
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
        <FlatList data={data} keyExtractor={(item) => item.id} renderItem={renderItem} ListEmptyComponent={renderEmpty} contentContainerStyle={data.length === 0 ? styles.emptyContainer : styles.listContent} showsVerticalScrollIndicator={false} />
      )}
    </Screen>
  );
}


const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: 'bold',
    marginTop: spacing.lg,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.body,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    borderRadius: 9,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  tabTextActive: {
    color: colors.text,
  },
  customListCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  customListTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  customListTag: {
    color: colors.primary,
    marginTop: spacing.xs,
  },
  customListDescription: {
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  customListCount: {
    color: colors.textSecondary,
    marginTop: spacing.sm,
    fontWeight: '600',
  },
    createButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: spacing.md,
  },

  createButtonText: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 16,
  },

  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: spacing.lg,
  },

  modalContent: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 16,
  },

  modalTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },

  input: {
    backgroundColor: colors.background,
    color: colors.text,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },

  descriptionInput: {
    minHeight: 90,
    textAlignVertical: 'top',
  },

  cancelButton: {
    alignItems: 'center',
    padding: spacing.md,
  },

  cancelButtonText: {
    color: colors.textSecondary,
  },
  listContent: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  emptyContainer: {
    flexGrow: 1,
  },
});


export default ListScreen;
