import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { Screen, AppInput, EmptyState } from '../components';
import MovieCard from '../components/MovieCard';
import { colors, spacing, typography } from '../theme';
import { searchMovies } from '../services/tmdbService';

const MIN_CHARS = 2;
const DEBOUNCE_MS = 500;

function SearchScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const term = search.trim();

    if (term.length < MIN_CHARS) {
      setResults([]);
      setSearched(false);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const data = await searchMovies(term);
        if (!cancelled) {
          setResults(data);
          setError(null);
          setSearched(true);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message);
          setResults([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search]);

  const openDetails = (movie) =>
    navigation.navigate('MovieDetails', { movieId: movie.id });

  const renderBody = () => {
    if (loading) {
      return <ActivityIndicator color={colors.primary} style={styles.loader} />;
    }

    if (error) {
      return (
        <EmptyState title="Não foi possível buscar" message={error} />
      );
    }

    if (!searched) {
      return (
        <EmptyState title="Encontre seu próximo filme" message="Digite pelo menos 2 letras para pesquisar no catálogo." />
      );
    }

    if (results.length === 0) {
      return (
        <EmptyState title="Nenhum filme encontrado" message="Tente buscar por outro título." />
      );
    }

    return (
      <View style={styles.grid}>
        {results.map((movie) => (
          <View key={movie.id} style={styles.cell}>
            <MovieCard movie={movie} onPress={openDetails} width="100%" />
          </View>
        ))}
      </View>
    );
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: spacing.xl }}>
      <Text style={styles.title}>Buscar filmes</Text>

      <AppInput label="Pesquisar" placeholder="Digite o nome de um filme..." value={search} onChangeText={setSearch} />

      {renderBody()}
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  cell: {
    width: '31%',
    marginBottom: spacing.lg,
  },
});

export default SearchScreen;