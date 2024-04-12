import React from 'react';
import {
  Box,
  Button,
  Center,
  Container,
  Heading,
  Text,
  VStack,
  useToast
} from '@chakra-ui/react';
import { FaGoogle } from 'react-icons/fa';
import Logo from '../images/aviary-logo.png';

// Convert to function component to use hooks effectively
function NotLogged({ onSignIn }) {
  const toast = useToast();

  const handleSignIn = async () => {
    try {
      // Call onSignIn function, assuming it returns a promise
      await onSignIn();

      // Display toast for sign-in success
      toast({
        title: "Login Successful",
        description: "You have successfully logged in.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      // Handle any errors that occur during sign-in
      console.error("Error signing in:", error);
      // Optionally, display an error toast
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
      <Container>
      <Center h="100vh"> {/* This centers the card vertically and horizontally in the viewport */}
        <Box
        bg="white"
          w="100%"
          maxW="md"
          p="40px"
          borderWidth="1px"
          borderRadius="lg"
          boxShadow="lg"
          textAlign="center"
        >
          <VStack>
            <img src={Logo} width="25%"/>
            <Heading mt="20px" size="lg" id="login">Welcome to Aviary</Heading>
            <Text mb="20px" fontSize="18px">
              Connect your Google account to create lists and search our extensive bird database.
            </Text>
            <Button
              leftIcon={<FaGoogle />}
              colorScheme="green"
              onClick={handleSignIn} // use local handler that invokes toast
              size="lg"
            >
              Continue with Google
            </Button>
          </VStack>
        </Box>
      </Center>
    </Container>
    </div>
  );
}

export default NotLogged;