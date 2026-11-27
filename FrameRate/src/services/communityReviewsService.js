import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { db } from './firebase';

const millis = (value) =>
  value?.toMillis?.() ?? (value instanceof Date ? value.getTime() : 0);

export async function getMovieReviews(movieId) {
  const q = query(
    collection(db, 'reviews'),
    where('movieId', '==', movieId),
    limit(50)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .sort((a, b) => millis(b.createdAt) - millis(a.createdAt));
}