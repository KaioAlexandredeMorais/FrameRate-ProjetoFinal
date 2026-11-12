import {
  collection, addDoc, doc, updateDoc, deleteDoc,
  query, where, orderBy, getDocs, serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

const reviewsRef = collection(db, 'reviews');

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
  const q = query(reviewsRef, where('userId', '==', userId), orderBy('watchedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getMovieReviews(movieId) {
  const q = query(reviewsRef, where('movieId', '==', movieId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}