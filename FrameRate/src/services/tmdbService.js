const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';
const API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY;

function buildQuery(params) {
  return Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}

async function request(path, params = {}) {
  if (!API_KEY) {
    throw new Error('Chave da TMDB ausente. Defina EXPO_PUBLIC_TMDB_API_KEY no .env');
  }

  const query = buildQuery({ api_key: API_KEY, language: 'pt-BR', ...params });
  const response = await fetch(`${BASE_URL}${path}?${query}`);

  if (!response.ok) {
    throw new Error(`Erro ao consultar a TMDB (${response.status})`);
  }

  return response.json();
}

export function getImageUrl(path, size = 'w500') {
  return path ? `${IMAGE_BASE_URL}/${size}${path}` : null;
}

export async function getTrendingMovies(page = 1) {
  const data = await request('/trending/movie/week', { page });
  return data.results;
}

export async function getPopularMovies(page = 1) {
  const data = await request('/movie/popular', { page });
  return data.results;
}

export async function getTopRatedMovies(page = 1) {
  const data = await request('/movie/top_rated', { page });
  return data.results;
}

export async function searchMovies(query, page = 1) {
  const data = await request('/search/movie', {
    query,
    page,
    include_adult: false,
  });
  return data.results;
}

export async function getMovieDetails(movieId) {
  return request(`/movie/${movieId}`, { append_to_response: 'credits' });
}