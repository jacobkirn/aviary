// src/firebase.js
// Firebase v9+ modular imports
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  // Your Firebase config
  apiKey: "AIzaSyCNZRzhCZvKreryQ_bp3n21MMJOvkM7OCw",
  authDomain: "aviary-3c34f.firebaseapp.com",
  projectId: "aviary-3c34f",
  storageBucket: "aviary-3c34f.appspot.com",
  messagingSenderId: "1099475585383",
  appId: "1:1099475585383:web:199470791864c4d44887c2",
  measurementId: "G-5VGT9N7ZRG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export the auth function to use in the AuthService.js
const auth = getAuth(app);
export { auth, app };
