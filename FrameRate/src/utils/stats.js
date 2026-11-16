// codigo-pedro ]
// Estatísticas exibidas no perfil, calculadas a partir das reviews do usuário.
export function computeStats(reviews) {
  const total = reviews.length;
  if (total === 0) {
    return { total: 0, average: 0, favoriteGenre: null, fiveStars: 0 };
  }

  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / total;

  const genreCount = {};
  reviews.forEach((r) => (r.genres || []).forEach((g) => (genreCount[g] = (genreCount[g] || 0) + 1)));
  const favoriteGenre = Object.entries(genreCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return {
    total,
    average,
    favoriteGenre,
    fiveStars: reviews.filter((r) => r.rating === 5).length,
  };
}

export function uniqueGenres(...lists) {
  const set = new Set();
  lists.forEach((list) => list.forEach((item) => (item.genres || []).forEach((g) => set.add(g))));
  return [...set].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}
