import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, AppInput, AppButton, PosterThumb, StarRating } from '../components';
import { useMovies } from '../context/MoviesContext';
import { validateReview, REVIEW_TEXT_MAX } from '../utils/validators';
import { formatDate, parseDate, toDate } from '../utils/format';
import { colors, spacing, typography } from '../theme';

function maskDate(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function ReviewFormScreen({ navigation, route }) {
  const movie = route.params.movie;
  const { getReviewByMovie, addReview, editReview, removeReview, isInWatchlist, removeFromWatchlist } = useMovies();
  const existing = getReviewByMovie(movie.movieId);
  const isEditing = Boolean(existing);
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [text, setText] = useState(existing?.text ?? '');
  const [watchedAt, setWatchedAt] = useState(formatDate(toDate(existing?.watchedAt) ?? new Date()));
  const [isPublic, setIsPublic] = useState(existing?.isPublic !== false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSave() {
    const parsedDate = parseDate(watchedAt);
    const found = validateReview({ rating, text, watchedAt, parsedDate });
    setErrors(found);
    setFormError('');
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    try {
      const data = { rating, text: text.trim(), watchedAt: parsedDate, isPublic };
      if (isEditing) {
        await editReview(existing.id, data);
      } else {
        await addReview(movie, data);
        if (isInWatchlist(movie.movieId)) await removeFromWatchlist(movie.movieId).catch(() => {});
      }
      Alert.alert('Pronto!', isEditing ? 'Avaliação atualizada.' : 'Avaliação salva.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      setFormError('Não foi possível salvar. Verifique sua conexão e tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    Alert.alert('Excluir avaliação', `Remover sua avaliação de "${movie.title}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await removeReview(existing.id);
            navigation.goBack();
          } catch {
            setDeleting(false);
            setFormError('Não foi possível excluir. Tente novamente.');
          }
        },
      },
    ]);
  }

  return (
    <Screen>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <PosterThumb posterPath={movie.posterPath} width={72} />
            <View style={styles.headerText}>
              <Text style={styles.movieTitle}>{movie.title}</Text>
              {movie.year ? <Text style={styles.year}>{movie.year}</Text> : null}
            </View>
          </View>

          <Text style={styles.label}>Sua nota</Text>
          <StarRating value={rating} onChange={setRating} size={36} />
          {errors.rating ? <Text style={styles.error}>{errors.rating}</Text> : null}

          <View style={styles.spacer} />

          <AppInput label="Data em que assistiu" value={watchedAt} onChangeText={(v) => setWatchedAt(maskDate(v))} placeholder="dd/mm/aaaa" keyboardType="number-pad" maxLength={10} error={errors.watchedAt} />

          <AppInput label="Comentário (opcional)" value={text} onChangeText={setText} placeholder="O que você achou do filme?" multiline maxLength={REVIEW_TEXT_MAX} error={errors.text} />
          <Text style={styles.counter}>
            {text.length}/{REVIEW_TEXT_MAX}
          </Text>

          <Text style={styles.label}>Visibilidade</Text>
          <View style={styles.visibility}>
            {[
              { value: true, label: 'Pública', icon: 'earth-outline' },
              { value: false, label: 'Privada', icon: 'lock-closed-outline' },
            ].map((opt) => {
              const active = isPublic === opt.value;
              return (
                <Pressable
                  key={opt.label}
                  onPress={() => setIsPublic(opt.value)}
                  style={[styles.visibilityOption, active && styles.visibilityActive]}
                >
                  <Ionicons name={opt.icon} size={18} color={active ? colors.primary : colors.textSecondary} />
                  <Text style={[styles.visibilityText, active && styles.visibilityTextActive]}>{opt.label}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.visibilityHint}>
            {isPublic
              ? 'Outros usuários poderão ver esta avaliação na página do filme.'
              : 'Somente você poderá ver esta avaliação.'}
          </Text>

          {formError ? <Text style={[styles.error, styles.formError]}>{formError}</Text> : null}

          <AppButton title={isEditing ? 'Salvar alterações' : 'Salvar avaliação'} onPress={handleSave} loading={saving} disabled={deleting} />

          {isEditing && (
            <View style={styles.deleteButton}>
              <AppButton title="Excluir avaliação" variant="danger" onPress={handleDelete} loading={deleting} disabled={saving} />
            </View>
          )}
          <View style={{ height: spacing.xl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.lg },
  headerText: { flex: 1, marginLeft: spacing.md },
  movieTitle: { color: colors.text, fontSize: typography.title, fontWeight: 'bold' },
  year: { color: colors.textSecondary, fontSize: typography.body, marginTop: spacing.xs },
  label: { color: colors.text, fontSize: typography.body, fontWeight: '600', marginBottom: spacing.sm },
  spacer: { height: spacing.lg },
  counter: { color: colors.textSecondary, fontSize: typography.small, textAlign: 'right', marginTop: -spacing.sm, marginBottom: spacing.md },
  error: { color: colors.error, fontSize: typography.small, marginTop: spacing.xs },
  formError: { marginBottom: spacing.md, fontSize: 14 },
  deleteButton: { marginTop: spacing.md },
  visibility: { flexDirection: 'row', marginBottom: spacing.sm },
  visibilityOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm + 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
  },
  visibilityActive: { borderColor: colors.primary },
  visibilityText: { color: colors.textSecondary, fontSize: typography.body, fontWeight: '600', marginLeft: spacing.xs + 2 },
  visibilityTextActive: { color: colors.text },
  visibilityHint: { color: colors.textSecondary, fontSize: typography.small, marginBottom: spacing.lg },
});

export default ReviewFormScreen;