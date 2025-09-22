import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth'
import { doc, setDoc, Timestamp } from 'firebase/firestore'
import { auth, db } from './config'
import { COLLECTIONS } from './firestore'

export async function signUp(email: string, password: string, name?: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  const user = userCredential.user
  
  // Create user document in Firestore
  await setDoc(doc(db, COLLECTIONS.USERS, user.uid), {
    email: user.email,
    name: name || '',
    avatarUrl: user.photoURL || '',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  })
  
  return user
}

export async function signIn(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  return userCredential.user
}

export async function signOut() {
  await firebaseSignOut(auth)
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}

export function getCurrentUser() {
  return auth.currentUser
}
