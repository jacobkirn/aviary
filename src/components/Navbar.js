import React from 'react';
import {
    Avatar,
    Box,
    Button,
    Flex,
    Heading,
    IconButton,
    Menu,
    MenuGroup,
    MenuDivider,
    MenuButton,
    MenuItem,
    MenuList,
    useColorMode,
    useDisclosure,
    useBreakpointValue,
    Drawer,
    DrawerBody,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
} from '@chakra-ui/react';
import { FaSun, FaMoon, FaGoogle, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { LuBird } from "react-icons/lu";
import { useToast } from "@chakra-ui/react";

const Navbar = ({ user, onSignIn, onSignOut }) => {
    const { colorMode, toggleColorMode } = useColorMode();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const isMobile = useBreakpointValue({ base: true, md: false });
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

    const handleSignOut = () => {
        // Call onSignOut function
        onSignOut();

        // Display toast for sign-out success
        toast({
            title: "Logout Successful",
            description: "You have successfully logged out.",
            status: "success",
            duration: 3000,
            isClosable: true,
        });
    };

    return (
        <Flex justifyContent="space-between" alignItems="center" p="4">
            <Flex alignItems="center">
                <LuBird size="24px" style={{ marginRight: '6px' }} /> {/* Add the bird icon */}
                <Heading id="logo" size="md" mb="0.5">Aviary</Heading>
            </Flex>

            <Flex alignItems="center">
                <IconButton
                    icon={colorMode === 'dark' ? <FaSun /> : <FaMoon />}
                    onClick={toggleColorMode}
                    aria-label="Toggle dark mode"
                    size="md"
                    
                />

                {user ? (
                    isMobile ? (
                        <IconButton
                            icon={<FaUser />}
                            aria-label="Account menu"
                            onClick={onOpen}
                            ml="10px"
                            size="md"
                            
                        />
                    ) : (
                        <Menu>
                            <MenuButton as={IconButton} icon={<FaUser />} aria-label="Account menu" 
                                size="md" ml="10px"/>
                            <MenuList>
                                <MenuItem color="red.500" icon={<FaSignOutAlt />} onClick={handleSignOut}>Sign Out</MenuItem>
                            </MenuList>
                        </Menu>

                    )
                ) : (
                    <Button
                        colorScheme={user ? undefined : "green"} // Change color to cyan if user is not logged in
                        leftIcon={<FaGoogle />}
                        onClick={handleSignIn}
                        size="md"
                        ml="10px"
                    >
                        Sign Up / Log In
                    </Button>
                )}
            </Flex>

            {isMobile && (
                <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
                    <DrawerOverlay />
                    <DrawerContent>
                        <DrawerCloseButton />
                        <DrawerBody p="4">
                            <Button w="full" onClick={handleSignOut} color="red.600" >
                                Sign Out Now
                            </Button>
                        </DrawerBody>
                    </DrawerContent>
                </Drawer>
            )}
        </Flex>
    );
};

export default Navbar;