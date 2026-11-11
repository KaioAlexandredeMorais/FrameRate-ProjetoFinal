
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';

function EmptyState({
  title = 'Nada por aqui!',
  message = 'Ainda não existem informações para mostrar.',
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: typography.subtitle,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    color: colors.textSecondary,
    fontSize: typography.body,
    textAlign: 'center',
  },
});

export default EmptyState;
