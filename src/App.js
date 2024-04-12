import React, { useState, useEffect } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import Navbar from './components/Navbar';
import { signInWithGoogle, signOut } from './AuthService';
import { auth } from './firebase';
import Main from './pages/Main';
import NotLogged from './components/NotLogged'; // Import the login prompt component
import './styles.css';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <ChakraProvider>
      {user ? (
        <>
          <Navbar
            user={user}
            onSignOut={() => signOut().then(() => setUser(null))}
          />
          <Main />
        </>
      ) : (
        <NotLogged onSignIn={signInWithGoogle} />
      )}
    </ChakraProvider>
  );
}

export default App;