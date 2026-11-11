
import { View, Text, StyleSheet } from 'react-native';
import { Screen, AppButton } from '../components';
import { colors, spacing, typography } from '../theme';

function MovieDetailsScreen({ navigation }) {
  return (
    <Screen>
      <Text style={styles.title}>Detalhes do filme</Text>

      <View style={styles.poster}>
        <Text style={styles.posterIcon}>🎞️</Text>
        <Text style={styles.posterText}>
          Poster do filme
        </Text>
      </View>

      <Text style={styles.movieTitle}>Filme de exemplo</Text>

      <Text style={styles.description}>
        Aqui serão exibidas as informações do filme,
        como sinopse, lançamento, duração e avaliação.
      </Text>

      <AppButton
        title="Voltar"
        variant="secondary"
        onPress={() => navigation.goBack()}
      />
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
  poster: {
    height: 220,
    backgroundColor: colors.surface,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  posterIcon: {
    fontSize: 60,
  },
  posterText: {
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  movieTitle: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  description: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
});

export default MovieDetailsScreen;