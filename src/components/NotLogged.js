import React from 'react';
import {
	Box,
	Button,
	Center,
	Container,
	UnorderedList,
	ListItem,
	Heading,
	Link,
	Text,
	VStack,
	useToast
} from '@chakra-ui/react';
import { FaGoogle } from 'react-icons/fa';
import { ExternalLinkIcon } from '@chakra-ui/icons'
import Logo from '../images/aviary-logo.png';

function NotLogged({ onSignIn }) {
	const toast = useToast();

	const handleSignIn = async () => {
		try {
			await onSignIn();
			toast({
				title: "Login Successful",
				description: "You have successfully logged in.",
				status: "success",
				duration: 3000,
				isClosable: true,
			});
		} catch (error) {
			console.error("Error signing in:", error);
			toast({
				title: "Login Error",
				description: "An error occurred while logging in. Please try again.",
				status: "error",
				duration: 5000,
				isClosable: true,
			});
		}
	};

	return (
		<div id="login-bg">
			<Container py={{ base: '80px', md: '0px' }}>
				<Center h="100vh">
					<VStack
						spacing="20px"
						align="stretch"
						maxW="md"
					>
						<Box
							bg="white"
							color="black"
							p="40px"
							borderWidth="1px"
							borderRadius="lg"
							boxShadow="lg"
						>
							<img src={Logo} width="20%" />
							<Heading mt="20px" size="lg" id="login">Welcome to Aviary</Heading>
							<Text mt="10px" fontSize="lg">
								Aviary was built to help bird enthusiasts track their sightings, ID new birds, and learn more about 1,000+ unique species — all for free!
							</Text>
							<UnorderedList mt="10px" mb="20px" ml="0px" fontSize="lg" textAlign="left" listStyleType="none">
								<ListItem mb="10px"><span id="emoji">📋</span> Create up to 25 lists</ListItem>
								<ListItem mb="10px"><span id="emoji">🏆</span> Earn milestones as you go</ListItem>
								<ListItem><span id="emoji">🌎</span> Filter by geographical region</ListItem>
							</UnorderedList>
							<Button
								leftIcon={<FaGoogle />}
								colorScheme="green"
								onClick={handleSignIn}
								size="lg"
								width="full"
							>
								Sign Up / Log In
							</Button>
						</Box>
						<Box
							bg="white"
							color="black"
							p="40px"
							borderWidth="1px"
							borderRadius="lg"
							boxShadow="lg"
						>
							<Heading size="md" id="home-heading">About the Project</Heading>
							<Text mt="10px" fontSize="lg">
								Aviary utilizes <Link href="https://nuthatch.lastelm.software/" color='blue.500' isExternal>Nuthatch API v2.3.0 <ExternalLinkIcon mx='2px' /></Link>, an open-source index of bird data and images. The database is currently in need of more contributors for photography, ID, and coding.
							</Text>
						</Box>
					</VStack>
				</Center>
			</Container>
		</div>
	);
}

export default NotLogged;