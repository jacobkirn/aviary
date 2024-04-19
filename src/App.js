import React, { useState, useEffect } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import Navbar from './components/Navbar';
import { signInWithGoogle, signOut } from './AuthService';
import { auth } from './firebase';
import Main from './pages/Main';
import NotLogged from './components/NotLogged';
import './styles.css';

function App() {
	const [user, setUser] = useState(null);

	useEffect(() => {
		const unsubscribe = auth.onAuthStateChanged((user) => {
			setUser(user);
		});

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