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
      {user ? <Main /> : <NotLogged />}
    </ChakraProvider>
  );
}

export default App;