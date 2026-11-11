
import { View, Text, StyleSheet } from 'react-native';
import { Screen } from '../components';
import { colors, spacing, typography } from '../theme';

function ProfileScreen() {
  return (
    <Screen>
      <Text style={styles.title}>Meu perfil</Text>

      <View style={styles.profile}>
        <Text style={styles.avatar}>🎬</Text>

        <Text style={styles.name}>Cinéfilo</Text>

        <Text style={styles.description}>
          Apaixonado pelo mundo do cinema.
        </Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.infoText}>
          Bem-vindo ao FrameRate!
        </Text>

        <Text style={styles.description}>
          Aqui você poderá acompanhar sua jornada cinematográfica.
        </Text>
      </View>
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
  profile: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: 16,
    marginTop: spacing.xl,
  },
  avatar: {
    fontSize: 50,
    marginBottom: spacing.md,
  },
  name: {
    color: colors.text,
    fontSize: typography.subtitle,
    fontWeight: 'bold',
  },
  description: {
    color: colors.textSecondary,
    fontSize: typography.body,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  info: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 16,
    marginTop: spacing.lg,
  },
  infoText: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;