import { collection, doc, getDoc, setDoc, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth, db } from './firebase';

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : {};
}

export const saveProfilePhoto = (uid, base64) =>
  setDoc(doc(db, 'users', uid), { photoBase64: base64 }, { merge: true });

export const removeProfilePhoto = (uid) =>
  setDoc(doc(db, 'users', uid), { photoBase64: null }, { merge: true });

async function deleteAllFrom(collectionName, uid) {
  const snap = await getDocs(query(collection(db, collectionName), where('userId', '==', uid)));
  for (let i = 0; i < snap.docs.length; i += 400) {
    const batch = writeBatch(db);
    snap.docs.slice(i, i + 400).forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
}

export async function deleteAccount(password) {
  const user = auth.currentUser;
  if (!user) throw new Error('Nenhum usuário autenticado.');

  const credential = EmailAuthProvider.credential(user.email, password);
  await reauthenticateWithCredential(user, credential);

  await deleteAllFrom('reviews', user.uid);
  await deleteAllFrom('watchlist', user.uid);

  const batch = writeBatch(db);
  batch.delete(doc(db, 'users', user.uid));
  await batch.commit();

  await deleteUser(user);
}
