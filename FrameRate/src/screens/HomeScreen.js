
import { View, Text, StyleSheet } from 'react-native';
import { Screen, AppButton } from '../components';
import { colors, spacing, typography } from '../theme';

function HomeScreen({ navigation }) {
  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.logo}>
          FrameRate<Text style={styles.dot}>.</Text>
        </Text>

        <Text style={styles.subtitle}>
          Sua jornada pelo cinema começa aqui.
        </Text>
      </View>

      <View style={styles.welcome}>
        <Text style={styles.title}>Olá, cinéfilo! 🎬</Text>

        <Text style={styles.description}>
          Descubra filmes, registre suas experiências e
          organize sua jornada pelo mundo do cinema.
        </Text>

        <AppButton
          title="Explorar filme de exemplo"
          onPress={() => navigation.navigate('MovieDetails')}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sua jornada</Text>
        <Text style={styles.description}>
          Seus filmes assistidos e sua lista de desejos
          aparecerão aqui.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  logo: {
    color: colors.text,
    fontSize: 32,
    fontWeight: 'bold',
  },
  dot: {
    color: colors.primary,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.body,
    marginTop: spacing.xs,
  },
  welcome: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 16,
    marginBottom: spacing.xl,
  },
  title: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  description: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  section: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 16,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.subtitle,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
});

export default HomeScreen;