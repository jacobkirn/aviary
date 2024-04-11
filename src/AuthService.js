import { auth } from './firebase';
import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';

// Function to sign in with Google
export const signInWithGoogle = () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

// Function to sign out
export const signOut = () => {
  return firebaseSignOut(auth);
};