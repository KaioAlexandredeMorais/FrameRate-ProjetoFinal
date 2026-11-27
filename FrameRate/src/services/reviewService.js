import { collection, addDoc, doc, updateDoc, deleteDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

const reviewsRef = collection(db, 'reviews');

const toMillis = (ts) => ts?.toMillis?.() ?? 0;

export async function createReview(data) {
  const ref = await addDoc(reviewsRef, {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export const updateReview = (id, data) => updateDoc(doc(db, 'reviews', id), data);

export const deleteReview = (id) => deleteDoc(doc(db, 'reviews', id));

export async function getUserReviews(userId) {
  const snap = await getDocs(query(reviewsRef, where('userId', '==', userId)));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => toMillis(b.watchedAt) - toMillis(a.watchedAt));
}

export async function getMovieReviews(movieId) {
  const snap = await getDocs(query(reviewsRef, where('movieId', '==', movieId)));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
}
