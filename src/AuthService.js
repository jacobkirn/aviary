import { auth } from './firebase';
import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';

export const signInWithGoogle = () => {
	const provider = new GoogleAuthProvider();
	return signInWithPopup(auth, provider);
};

export const signOut = () => {
	return firebaseSignOut(auth);
};