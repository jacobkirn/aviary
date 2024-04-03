import React, { useState, useEffect } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import Navbar from './components/Navbar';
import { signInWithGoogle, signOut } from './AuthService';
import { auth } from './firebase';
import HomeBanner from './components/HomeBanner';
import NuthatchApiComponent from './components/NuthatchApiComponent';
import './styles.css'

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      setUser(user);
    });
  }, []);

  return (
    <ChakraProvider>
      <Navbar
        user={user}
        onSignIn={signInWithGoogle}
        onSignOut={() => signOut().then(() => setUser(null))}
      />
      <HomeBanner />
      <NuthatchApiComponent />
    </ChakraProvider>
  );
}

export default App;