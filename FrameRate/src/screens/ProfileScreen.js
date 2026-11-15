// codigo-pedro (substitui o placeholder anterior)
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Screen, AppButton, AppInput, Avatar } from '../components';
import { useAuth } from '../context/AuthContext';
import { useMovies } from '../context/MoviesContext';
import { authErrorMessage } from '../services/authService';
import { deleteAccount } from '../services/userService';
import { colors, spacing, typography } from '../theme';

// Limite seguro: um documento do Firestore aceita até 1 MB.
const MAX_PHOTO_BASE64 = 700000;

function StatTile({ label, value }) {
  return (
    <View style={styles.tile}>
      <Text style={styles.tileValue} numberOfLines={1}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

function ProfileScreen() {
  const { user, logout } = useAuth();
  const { photo, stats, watchlist, setProfilePhoto } = useMovies();

  const [photoBusy, setPhotoBusy] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [password, setPassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  async function pickPhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Permita o acesso à galeria para escolher uma foto.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.2,
      base64: true,
    });
    if (result.canceled) return;

    const base64 = result.assets[0]?.base64;
    if (!base64 || base64.length > MAX_PHOTO_BASE64) {
      Alert.alert('Imagem muito grande', 'Escolha uma foto menor ou recorte uma área menor da imagem.');
      return;
    }

    setPhotoBusy(true);
    try {
      await setProfilePhoto(base64);
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar a foto. Tente novamente.');
    } finally {
      setPhotoBusy(false);
    }
  }

  async function removePhoto() {
    setPhotoBusy(true);
    try {
      await setProfilePhoto(null);
    } catch {
      Alert.alert('Erro', 'Não foi possível remover a foto.');
    } finally {
      setPhotoBusy(false);
    }
  }

  function handleAvatarPress() {
    const options = [{ text: 'Escolher da galeria', onPress: pickPhoto }];
    if (photo) options.push({ text: 'Remover foto', style: 'destructive', onPress: removePhoto });
    options.push({ text: 'Cancelar', style: 'cancel' });
    Alert.alert('Foto de perfil', undefined, options);
  }

  async function handleDeleteAccount() {
    if (!password) {
      setDeleteError('Digite sua senha para confirmar.');
      return;
    }
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteAccount(password);
      // Sem navegação manual: ao remover a conta, o AuthContext volta a `user = null`
      // e o RootNavigator troca para a tela de login sozinho.
    } catch (e) {
      const wrongPassword = e.code === 'auth/invalid-credential' || e.code === 'auth/wrong-password';
      setDeleteError(wrongPassword ? 'Senha incorreta.' : authErrorMessage(e));
      setDeleting(false);
    }
  }

  const average = stats.total > 0 ? stats.average.toFixed(1) : '—';

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <Text style={styles.title}>Meu perfil</Text>

        <View style={styles.profile}>
          <Avatar photo={photo} onPress={photoBusy ? undefined : handleAvatarPress} />
          <Text style={styles.name}>{user?.displayName || 'Cinéfilo'}</Text>
          <Text style={styles.email}>{photoBusy ? 'Salvando foto...' : user?.email}</Text>
        </View>

        <Text style={styles.sectionTitle}>Suas estatísticas</Text>
        <View style={styles.tiles}>
          <StatTile label="Filmes avaliados" value={stats.total} />
          <StatTile label="Nota média" value={average} />
          <StatTile label="Gênero favorito" value={stats.favoriteGenre ?? '—'} />
          <StatTile label="Quero ver" value={watchlist.length} />
        </View>

        <View style={styles.actions}>
          <AppButton title="Sair" variant="outline" onPress={logout} />
        </View>

        <View style={styles.danger}>
          <Text style={styles.dangerTitle}>Zona de perigo</Text>
          {confirmingDelete ? (
            <>
              <Text style={styles.dangerText}>
                Isso apaga sua conta, suas avaliações e sua lista “Quero ver”. Não dá para desfazer.
              </Text>
              <AppInput
                label="Confirme sua senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                error={deleteError}
                editable={!deleting}
              />
              <AppButton title="Excluir minha conta" variant="danger" onPress={handleDeleteAccount} loading={deleting} />
              <View style={styles.cancel}>
                <AppButton
                  title="Cancelar"
                  variant="outline"
                  disabled={deleting}
                  onPress={() => {
                    setConfirmingDelete(false);
                    setPassword('');
                    setDeleteError('');
                  }}
                />
              </View>
            </>
          ) : (
            <AppButton title="Excluir conta" variant="outline" onPress={() => setConfirmingDelete(true)} />
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xl },
  title: { color: colors.text, fontSize: typography.title, fontWeight: 'bold', marginTop: spacing.lg },
  profile: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: 16,
    marginTop: spacing.lg,
  },
  name: { color: colors.text, fontSize: typography.subtitle, fontWeight: 'bold', marginTop: spacing.md },
  email: { color: colors.textSecondary, fontSize: typography.body, marginTop: spacing.xs },
  sectionTitle: { color: colors.text, fontSize: typography.subtitle, fontWeight: 'bold', marginTop: spacing.lg, marginBottom: spacing.sm },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  tile: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  tileValue: { color: colors.primary, fontSize: typography.title, fontWeight: 'bold' },
  tileLabel: { color: colors.textSecondary, fontSize: typography.small + 1, marginTop: spacing.xs },
  actions: { marginTop: spacing.md },
  danger: {
    marginTop: spacing.xl,
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.error,
  },
  dangerTitle: { color: colors.error, fontWeight: 'bold', fontSize: typography.body, marginBottom: spacing.sm },
  dangerText: { color: colors.textSecondary, fontSize: 14, lineHeight: 20, marginBottom: spacing.md },
  cancel: { marginTop: spacing.sm },
});

export default ProfileScreen;
