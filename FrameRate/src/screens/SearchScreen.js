
import { View, Text, StyleSheet } from 'react-native';
import { Screen, AppInput, EmptyState } from '../components';
import { colors, spacing, typography } from '../theme';
import { useState } from 'react';

function SearchScreen() {
  const [search, setSearch] = useState('');

  return (
    <Screen>
      <Text style={styles.title}>Buscar filmes</Text>

      <AppInput
        label="Pesquisar"
        placeholder="Digite o nome de um filme..."
        value={search}
        onChangeText={setSearch}
      />

      <EmptyState
        title="Encontre seu próximo filme"
        message="A busca pelo catálogo de filmes será disponibilizada em breve."
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
});

export default SearchScreen;