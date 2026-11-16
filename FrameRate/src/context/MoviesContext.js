// codigo-pedro 
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { useAuth } from './AuthContext';
import * as reviewService from '../services/reviewService';
import * as watchlistService from '../services/watchlistService';
import * as userService from '../services/userService';
import { computeStats, uniqueGenres } from '../utils/stats';
import { toDate } from '../utils/format';

const MoviesContext = createContext(null);

const defaultFilters = { genre: null, minRating: 0 };

const initialState = {
  reviews: [],
  watchlist: [],
  photo: null,
  filters: defaultFilters,
  loading: true,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'RESET':
      return { ...initialState, loading: false };
    case 'LOAD_START':
      return { ...state, loading: true, error: null };
    case 'LOAD_SUCCESS':
      return { ...state, ...action.payload, loading: false };
    case 'LOAD_ERROR':
      return { ...state, loading: false, error: action.error };

    case 'REVIEW_ADDED':
      return { ...state, reviews: [action.review, ...state.reviews] };
    case 'REVIEW_UPDATED':
      return {
        ...state,
        reviews: state.reviews.map((r) => (r.id === action.id ? { ...r, ...action.changes } : r)),
      };
    case 'REVIEW_REMOVED':
      return { ...state, reviews: state.reviews.filter((r) => r.id !== action.id) };

    case 'WATCHLIST_ADDED':
      return {
        ...state,
        watchlist: [action.item, ...state.watchlist.filter((i) => i.movieId !== action.item.movieId)],
      };
    case 'WATCHLIST_REMOVED':
      return { ...state, watchlist: state.watchlist.filter((i) => i.movieId !== action.movieId) };

    case 'PHOTO_SET':
      return { ...state, photo: action.photo };

    case 'FILTERS_SET':
      return { ...state, filters: { ...state.filters, ...action.filters } };
    case 'FILTERS_RESET':
      return { ...state, filters: defaultFilters };
    default:
      return state;
  }
}

const byWatchedDesc = (a, b) => (toDate(b.watchedAt)?.getTime() ?? 0) - (toDate(a.watchedAt)?.getTime() ?? 0);

export function MoviesProvider({ children }) {
  const { user } = useAuth();
  const uid = user?.uid;
  const [state, dispatch] = useReducer(reducer, initialState);

  // Carrega (ou limpa) os dados sempre que o usuário logado muda.
  useEffect(() => {
    if (!uid) {
      dispatch({ type: 'RESET' });
      return;
    }
    let cancelled = false;
    dispatch({ type: 'LOAD_START' });
    Promise.all([
      reviewService.getUserReviews(uid),
      watchlistService.getUserWatchlist(uid),
      userService.getUserProfile(uid),
    ])
      .then(([reviews, watchlist, profile]) => {
        if (!cancelled) {
          dispatch({ type: 'LOAD_SUCCESS', payload: { reviews, watchlist, photo: profile.photoBase64 ?? null } });
        }
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: 'LOAD_ERROR', error: 'Não foi possível carregar seus dados.' });
      });
    return () => {
      cancelled = true;
    };
  }, [uid]);

  // `movie` segue o formato { movieId, title, posterPath, genres: [nomes], year }.
  const addReview = useCallback(
    async (movie, { rating, text, watchedAt }) => {
      const data = {
        userId: uid,
        movieId: movie.movieId,
        title: movie.title,
        posterPath: movie.posterPath ?? null,
        genres: movie.genres ?? [],
        year: movie.year ?? null,
        rating,
        text,
        watchedAt,
      };
      const id = await reviewService.createReview(data);
      dispatch({ type: 'REVIEW_ADDED', review: { id, ...data, createdAt: new Date() } });
    },
    [uid]
  );

  const editReview = useCallback(async (id, changes) => {
    await reviewService.updateReview(id, changes);
    dispatch({ type: 'REVIEW_UPDATED', id, changes });
  }, []);

  const removeReview = useCallback(async (id) => {
    await reviewService.deleteReview(id);
    dispatch({ type: 'REVIEW_REMOVED', id });
  }, []);

  const addToWatchlist = useCallback(
    async (movie) => {
      const item = await watchlistService.addToWatchlist(uid, movie);
      dispatch({ type: 'WATCHLIST_ADDED', item });
    },
    [uid]
  );

  const removeFromWatchlist = useCallback(
    async (movieId) => {
      await watchlistService.removeFromWatchlist(uid, movieId);
      dispatch({ type: 'WATCHLIST_REMOVED', movieId });
    },
    [uid]
  );

  const setProfilePhoto = useCallback(
    async (base64) => {
      if (base64) await userService.saveProfilePhoto(uid, base64);
      else await userService.removeProfilePhoto(uid);
      dispatch({ type: 'PHOTO_SET', photo: base64 });
    },
    [uid]
  );

  const setFilters = useCallback((filters) => dispatch({ type: 'FILTERS_SET', filters }), []);
  const resetFilters = useCallback(() => dispatch({ type: 'FILTERS_RESET' }), []);

  const { reviews, watchlist, filters } = state;

  const derived = useMemo(() => {
    const filteredReviews = reviews
      .filter((r) => (filters.genre ? (r.genres || []).includes(filters.genre) : true))
      .filter((r) => r.rating >= filters.minRating)
      .sort(byWatchedDesc);
    const filteredWatchlist = watchlist.filter((i) =>
      filters.genre ? (i.genres || []).includes(filters.genre) : true
    );
    return {
      filteredReviews,
      filteredWatchlist,
      stats: computeStats(reviews),
      genres: uniqueGenres(reviews, watchlist),
    };
  }, [reviews, watchlist, filters]);

  const value = {
    ...state,
    ...derived,
    getReviewByMovie: (movieId) => reviews.find((r) => r.movieId === movieId),
    isInWatchlist: (movieId) => watchlist.some((i) => i.movieId === movieId),
    addReview,
    editReview,
    removeReview,
    addToWatchlist,
    removeFromWatchlist,
    setProfilePhoto,
    setFilters,
    resetFilters,
  };

  return <MoviesContext.Provider value={value}>{children}</MoviesContext.Provider>;
}

export function useMovies() {
  const ctx = useContext(MoviesContext);
  if (!ctx) throw new Error('useMovies deve ser usado dentro de MoviesProvider');
  return ctx;
}
