import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Screen } from '../components';
import MovieCard from '../components/MovieCard';
import { colors, spacing, typography } from '../theme';
import { getTrendingMovies, getPopularMovies, getTopRatedMovies } from '../services/tmdbService';

const RATE_COLOR = '#FFC83D';

const SECTIONS = [
  { key: 'trending', title: 'Em alta esta semana', fetch: getTrendingMovies },
  { key: 'popular', title: 'Populares', fetch: getPopularMovies },
  { key: 'topRated', title: 'Mais bem avaliados', fetch: getTopRatedMovies },
];

const initialState = SECTIONS.reduce(
  (acc, s) => ({ ...acc, [s.key]: { data: [], loading: true, error: null } }),
  {}
);

function HomeScreen({ navigation }) {
  const [sections, setSections] = useState(initialState);

  const loadSection = useCallback(async (section) => {
    setSections((prev) => ({
      ...prev,
      [section.key]: { ...prev[section.key], loading: true, error: null },
    }));
    try {
      const data = await section.fetch();
      setSections((prev) => ({
        ...prev,
        [section.key]: { data, loading: false, error: null },
      }));
    } catch (e) {
      setSections((prev) => ({
        ...prev,
        [section.key]: { data: [], loading: false, error: e.message },
      }));
    }
  }, []);

  useEffect(() => {
    SECTIONS.forEach(loadSection);
  }, [loadSection]);

  const openDetails = (movie) =>
    navigation.navigate('MovieDetails', { movieId: movie.id });

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: spacing.xl }} >
      <View style={styles.header}>
        <View style={styles.brand}>
          <Image source={require('../../assets/framerate-logo.png')} style={styles.logoImage} resizeMode="contain" />
          <Text style={styles.logo}>
            <Text style={styles.frame}>Frame</Text>
            <Text style={styles.rate}>Rate</Text>
            <Text style={styles.dot}>.</Text>
          </Text>
        </View>

        <Text style={styles.subtitle}>
          Sua jornada pelo cinema começa aqui.
        </Text>
      </View>

      {SECTIONS.map((section) => {
        const { data, loading, error } = sections[section.key];

        return (
          <View key={section.key} style={styles.discoverSection}>
            <Text style={styles.sectionTitle}>{section.title}</Text>

            {loading && (
              <ActivityIndicator color={colors.primary} style={styles.loader} />
            )}

            {error && (
              <View>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={() => loadSection(section)}>
                  <Text style={styles.retryText}>Tentar novamente</Text>
                </TouchableOpacity>
              </View>
            )}

            {!loading && !error && (
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={data}
                keyExtractor={(item) => String(item.id)}
                ItemSeparatorComponent={() => (
                  <View style={{ width: spacing.md }} />
                )}
                renderItem={({ item }) => (
                  <MovieCard movie={item} onPress={openDetails} />
                )}
              />
            )}
          </View>
        );
      })}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 49,
    height: 40,
    marginRight: spacing.sm,
  },
  logo: {
    color: colors.text,
    fontSize: 32,
    fontWeight: 'bold',
  },
  frame: {
    color: colors.primary,
  },
  rate: {
    color: RATE_COLOR,
  },
  dot: {
    color: colors.primary,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.body,
    marginTop: spacing.xs,
  },
  discoverSection: {
    marginBottom: spacing.xl,
  },
  loader: {
    marginVertical: spacing.lg,
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: typography.body,
    marginBottom: spacing.sm,
  },
  retryText: {
    color: colors.primary,
    fontSize: typography.body,
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.subtitle,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
});

export default HomeScreen;