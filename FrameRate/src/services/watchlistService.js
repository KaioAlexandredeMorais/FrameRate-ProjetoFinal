import { collection, doc, setDoc, deleteDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

const watchlistRef = collection(db, 'watchlist');

const itemId = (userId, movieId) => `${userId}_${movieId}`;

export async function addToWatchlist(userId, movie) {
  const item = {
    userId,
    movieId: movie.movieId,
    title: movie.title,
    posterPath: movie.posterPath ?? null,
    genres: movie.genres ?? [],
    year: movie.year ?? null,
  };
  await setDoc(doc(db, 'watchlist', itemId(userId, movie.movieId)), {
    ...item,
    addedAt: serverTimestamp(),
  });
  return { id: itemId(userId, movie.movieId), ...item, addedAt: new Date() };
}

export const removeFromWatchlist = (userId, movieId) =>
  deleteDoc(doc(db, 'watchlist', itemId(userId, movieId)));

export async function getUserWatchlist(userId) {
  const snap = await getDocs(query(watchlistRef, where('userId', '==', userId)));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.addedAt?.toMillis?.() ?? 0) - (a.addedAt?.toMillis?.() ?? 0));
}
