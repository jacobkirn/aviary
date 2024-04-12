import React from 'react';
import {
    Heading,
    Box,
    SimpleGrid,
    VStack,
    Link,
    UnorderedList,
    ListItem,
    Button,
    Text,
} from '@chakra-ui/react';

export default function Home({ user, onNavigateToLists  }) {
    const firstName = user ? user.displayName.split(' ')[0] : 'Guest';


    return (
        <div>
            <Box>
                <Heading mt="40px" mb="20px" id="welcome">Welcome, {firstName}.</Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
                    <Box>
                        <VStack align="start" spacing="10px">
                            <Heading size="md" id="logo">Explore Aviary</Heading>
                            <Text fontSize="lg">
                                Aviary was built to help bird enthusiasts track their sightings, identify new birds, and learn more about 1,000+ unique species!
                                <UnorderedList mt="10px">
                                    <ListItem>Create up to 25 lists</ListItem>
                                    <ListItem>Earn milestones as you go</ListItem>
                                    <ListItem>Filter by geographical region</ListItem>
                                </UnorderedList>
                            </Text>
                            <Button colorScheme="blue" mt="10px" px="20px" onClick={onNavigateToLists}>
                                Get Started
                            </Button>
                        </VStack>
                    </Box>
                    <Box>
                        <VStack align="start" spacing="10px">
                        <Heading size="md" id="logo">About the Project</Heading>
                            <Text fontSize="lg">
                                Aviary utilizes Nuthatch API v2.3.0, an open-source index of bird data and images. The database is currently in need of more contributors for photography, ID, and coding.
                            </Text>
                            <Link href="https://nuthatch.lastelm.software/" isExternal>
                                <Button colorScheme="orange" mt="10px" px="20px">Learn more about Nuthatch API</Button>
                            </Link>
                            <Link href="https://www.buymeacoffee.com/aviaryDev" isExternal>
                                <Button colorScheme="green" mt="10px" px="20px">Buy me a coffee</Button>
                            </Link>
                        </VStack>
                    </Box>
                </SimpleGrid>
            </Box>
        </div>
    );
}