
import { Text, StyleSheet } from 'react-native';
import { Screen, EmptyState } from '../components';
import { colors, spacing, typography } from '../theme';

function DiaryScreen() {
  return (
    <Screen>
      <Text style={styles.title}>Meu diário</Text>

      <Text style={styles.subtitle}>
        Sua história como espectador.
      </Text>

      <EmptyState
        title="Seu diário está vazio"
        message="Os filmes que você assistir e avaliar aparecerão aqui."
      />
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
  },
});

export default DiaryScreen;