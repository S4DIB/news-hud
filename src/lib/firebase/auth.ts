import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc, Timestamp } from 'firebase/firestore'
import { auth, db } from './config'
import { COLLECTIONS } from './firestore'

// Google Auth Provider
const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
  prompt: 'select_account'
})

// User Interface
export interface UserProfile {
  uid: string
  email: string
  displayName?: string
  photoURL?: string
  username?: string
  preferences: {
    theme: 'hud' | 'minimal' | 'classic'
    autoScroll: boolean
    scrollSpeed: number
    language: string
    timezone: string
    notifications: {
      email: boolean
      push: boolean
      digest: 'daily' | 'weekly' | 'never'
    }
  }
  interests: string[]
  sources: {
    reddit: boolean
    hackernews: boolean
    twitter: boolean
    newsletters: boolean
  }
  apiKeys?: {
    openai?: string
    gemini?: string
    anthropic?: string
  }
  createdAt: Timestamp
  updatedAt: Timestamp
  lastLoginAt: Timestamp
  isActive: boolean
  subscriptionTier: 'free' | 'premium'
}

const defaultUserPreferences = {
  theme: 'hud' as const,
  autoScroll: true,
  scrollSpeed: 60,
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  notifications: {
    email: true,
    push: false,
    digest: 'daily' as const
  }
}

const defaultUserSources = {
  reddit: true,
  hackernews: true,
  twitter: false,
  newsletters: true
}

// Create or update user profile in Firestore
async function createUserProfile(user: User, additionalData?: any): Promise<UserProfile> {
  const userDocRef = doc(db, COLLECTIONS.USERS, user.uid)
  
  const userProfile: UserProfile = {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || additionalData?.displayName || '',
    photoURL: user.photoURL || '',
    username: additionalData?.username || '',
    preferences: { ...defaultUserPreferences, ...additionalData?.preferences },
    interests: additionalData?.interests || ['technology', 'programming'],
    sources: { ...defaultUserSources, ...additionalData?.sources },
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    lastLoginAt: Timestamp.now(),
    isActive: true,
    subscriptionTier: 'free'
  }
  
  await setDoc(userDocRef, userProfile)
  return userProfile
}

// Update user's last login time
async function updateLastLogin(uid: string) {
  const userDocRef = doc(db, COLLECTIONS.USERS, uid)
  await updateDoc(userDocRef, {
    lastLoginAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  })
}

// Email/Password Sign Up
export async function signUp(email: string, password: string, additionalData?: any) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  const user = userCredential.user
  
  // Update display name if provided
  if (additionalData?.displayName) {
    await updateProfile(user, {
      displayName: additionalData.displayName
    })
  }
  
  // Create user profile in Firestore
  await createUserProfile(user, additionalData)
  
  return user
}

// Email/Password Sign In
export async function signIn(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  await updateLastLogin(userCredential.user.uid)
  return userCredential.user
}

// Google Sign In
export async function signInWithGoogle() {
  const userCredential = await signInWithPopup(auth, googleProvider)
  const user = userCredential.user
  
  // Check if user profile exists
  const userDocRef = doc(db, COLLECTIONS.USERS, user.uid)
  const userDoc = await getDoc(userDocRef)
  
  if (!userDoc.exists()) {
    // Create new user profile
    await createUserProfile(user)
  } else {
    // Update last login
    await updateLastLogin(user.uid)
  }
  
  return user
}

// Sign Out
export async function signOut() {
  return firebaseSignOut(auth)
}

// Get user profile from Firestore
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userDocRef = doc(db, COLLECTIONS.USERS, uid)
  const userDoc = await getDoc(userDocRef)
  
  if (userDoc.exists()) {
    return userDoc.data() as UserProfile
  }
  
  return null
}

// Update user profile
export async function updateUserProfile(uid: string, updates: Partial<UserProfile>) {
  const userDocRef = doc(db, COLLECTIONS.USERS, uid)
  await updateDoc(userDocRef, {
    ...updates,
    updatedAt: Timestamp.now()
  })
}

// Auth state listener
export function onAuthStateChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}

// Get current user
export function getCurrentUser(): User | null {
  return auth.currentUser
}
