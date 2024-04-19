import React from 'react';
import {
	Avatar,
	Box,
	Button,
	Flex,
	Heading,
	IconButton,
	Menu,
	MenuDivider,
	MenuButton,
	MenuItem,
	MenuList,
	useColorMode,
	useDisclosure,
	useBreakpointValue,
	DrawerHeader,
	Drawer,
	DrawerBody,
	DrawerOverlay,
	DrawerContent,
	DrawerCloseButton,
} from '@chakra-ui/react';
import { FaSun, FaMoon, FaUser, FaSignOutAlt, FaBug } from 'react-icons/fa';
import { LuBird } from "react-icons/lu";
import { useToast } from "@chakra-ui/react";

const Navbar = ({ user, onSignOut }) => {
	const { colorMode, toggleColorMode } = useColorMode();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const isMobile = useBreakpointValue({ base: true, md: false });
	const toast = useToast();

	const handleSignOut = () => {
		onSignOut();
		toast({
			title: "Logout Successful",
			description: "You have successfully logged out.",
			status: "success",
			duration: 3000,
			isClosable: true,
		});
	};

	const handleReportBug = () => {
		window.location.href = `mailto:kirnjaco@msu.edu?subject=Bug Report for Aviary App&body=Hi Team,%0D%0A%0D%0AI would like to report a bug I encountered in the Aviary app. Here are the details:%0D%0A%0D%0A[Please describe the issue here]%0D%0A%0D%0AThank you!`;
	};

	return (
		<Flex justifyContent="space-between" alignItems="center" p="4">
			<Flex alignItems="center">
				<LuBird size="24px" style={{ marginRight: '6px' }} />
				<Heading id="logo" size="md" mb="0.5">Aviary</Heading>
			</Flex>

			<Flex alignItems="center">
				<IconButton
					icon={colorMode === 'dark' ? <FaSun /> : <FaMoon />}
					onClick={toggleColorMode}
					aria-label="Toggle dark mode"
					size="md"
				/>

				{user && (
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
							<MenuButton as={IconButton} icon={<FaUser />} aria-label="Account menu" size="md" ml="10px" />
							<MenuList>
								<MenuItem icon={<FaBug />} onClick={handleReportBug}>Report Bug</MenuItem>
								<MenuDivider />
								<MenuItem color="red.500" icon={<FaSignOutAlt />} onClick={handleSignOut}>Sign Out</MenuItem>
							</MenuList>
						</Menu>
					)
				)}
			</Flex>

			{isMobile && (
				<Drawer isOpen={isOpen} placement="right" onClose={onClose}>
					<DrawerOverlay />
					<DrawerContent>
						<DrawerCloseButton m={3} />
						<DrawerHeader mt={1.5}>Account Settings</DrawerHeader>
						<DrawerBody pt="0" pl="16px">
							<Menu>
								<MenuItem minH="48px" icon={<FaBug />} onClick={handleReportBug}>Report Bug</MenuItem>
								<MenuDivider />
								<MenuItem minH="48px" color="red.500" icon={<FaSignOutAlt />} onClick={handleSignOut}>Sign Out</MenuItem>
							</Menu>
						</DrawerBody>
					</DrawerContent>
				</Drawer>
			)}
		</Flex>
	);
};

export default Navbar;