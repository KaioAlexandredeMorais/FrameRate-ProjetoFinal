import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, AppButton } from '../components';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, typography } from '../theme';

function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <Screen>
      <Text style={styles.title}>Meu perfil</Text>

      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={44} color={colors.primary} />
        </View>
        <Text style={styles.name}>{user?.displayName || 'Cinéfilo'}</Text>
        <Text style={styles.description}>{user?.email}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.infoText}>
          Bem-vindo ao FrameRate!
        </Text>

        <Text style={styles.description}>
          Aqui você poderá acompanhar sua jornada cinematográfica.
        </Text>
      </View>

      <View style={[styles.logout, { marginTop: spacing.xl }]}>
        <AppButton title="Sair" variant="outline" onPress={logout} />
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
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
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