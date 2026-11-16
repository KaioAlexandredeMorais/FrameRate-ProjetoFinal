
import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  query,
  where,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  runTransaction,
} from 'firebase/firestore';

import { db } from './firebase';

// Referência à coleção de listas personalizadas.
const customListsRef = collection(db, 'customLists');

// Cria uma nova lista para o usuário.
export async function createCustomList(userId, list) {
  const data = {
    userId,
    name: list.name.trim(),
    tag: list.tag ?? '',
    description: list.description ?? '',
    movies: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const ref = await addDoc(customListsRef, data);

  return {
    id: ref.id,
    ...data,
    createdAt: new Date(),
  };
}

// Busca somente as listas do usuário autenticado.
export async function getUserCustomLists(userId) {
  const q = query(
    customListsRef,
    where('userId', '==', userId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((item) => ({
      id: item.id,
      ...item.data(),
    }))
    .sort(
      (a, b) =>
        (b.createdAt?.toMillis?.() ?? 0) -
        (a.createdAt?.toMillis?.() ?? 0)
    );
}

// Atualiza nome, tag ou descrição.
export async function updateCustomList(listId, changes) {
  const allowed = ['name', 'tag', 'description'];

  const data = {};

  allowed.forEach((field) => {
    if (changes[field] !== undefined) {
      data[field] =
        field === 'name' ? changes[field].trim() : changes[field];
    }
  });

  data.updatedAt = serverTimestamp();

  await updateDoc(doc(db, 'customLists', listId), data);
}

// Adiciona um filme à lista, evitando duplicatas.
export async function addMovieToCustomList(listId, movie) {
  const ref = doc(db, 'customLists', listId);

  const newMovie = {
    movieId: movie.movieId,
    title: movie.title,
    posterPath: movie.posterPath ?? null,
    genres: movie.genres ?? [],
    year: movie.year ?? null,
  };

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);

    if (!snapshot.exists()) {
      throw new Error('Lista não encontrada.');
    }

    const movies = snapshot.data().movies ?? [];

    if (movies.some((item) => item.movieId === newMovie.movieId)) {
      return;
    }

    transaction.update(ref, {
      movies: [...movies, newMovie],
      updatedAt: serverTimestamp(),
    });
  });
}

// Remove um filme da lista.
export async function removeMovieFromCustomList(listId, movieId) {
  const ref = doc(db, 'customLists', listId);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);

    if (!snapshot.exists()) {
      throw new Error('Lista não encontrada.');
    }

    const movies = snapshot.data().movies ?? [];

    transaction.update(ref, {
      movies: movies.filter(
        (movie) => movie.movieId !== movieId
      ),
      updatedAt: serverTimestamp(),
    });
  });
}

// Exclui uma lista personalizada.
export async function deleteCustomList(listId) {
  await deleteDoc(doc(db, 'customLists', listId));
}
