import React, { useState, useEffect } from 'react';
import {
    Heading, Box, SimpleGrid, VStack, Link, UnorderedList, ListItem, Button, Image, Text, Tag, Flex
} from '@chakra-ui/react';
import axios from 'axios';
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { FcWikipedia } from "react-icons/fc";

export default function Home({ user, onNavigateToLists }) {
    const firstName = user ? user.displayName.split(' ')[0] : 'Guest';
    const [birdOfTheWeek, setBirdOfTheWeek] = useState(null);
    const apiKey = process.env.REACT_APP_NUTHATCH_API_KEY;

    useEffect(() => {
        const weekNumber = Math.floor((new Date()).getTime() / (1000 * 60 * 60 * 24 * 7));
        const randomSeed = weekNumber % 52;

        const fetchBirdOfTheWeek = async () => {
            try {
                const response = await axios.get(`https://nuthatch.lastelm.software/v2/birds?page=${randomSeed}&pageSize=1&hasImg=true`, {
                    headers: { 'api-key': apiKey }
                });
                if (response.data && response.data.entities.length > 0) {
                    setBirdOfTheWeek(response.data.entities[0]);
                } else {
                    setBirdOfTheWeek(null);
                }
            } catch (error) {
                console.error('Error fetching bird of the week:', error);
                setBirdOfTheWeek(null);
            }
        };

        fetchBirdOfTheWeek();
    }, []);

    useEffect(() => {
        console.log(birdOfTheWeek);
    }, [birdOfTheWeek]);

    return (
        <div>
            <Box>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: '20px', md: '80px' }}>
                    <Box order={{ base: 2, md: 1 }}>
                        <VStack align="start">
                            <Heading mt={{ base: '0px', md: '40px' }} mb={{ base: '10px', md: '20px' }} id="welcome">Welcome, {firstName}.</Heading>
                            <Heading size="md" id="home-heading">Explore Aviary</Heading>
                            <Text fontSize="lg">
                                Aviary was built to help bird enthusiasts track their sightings, ID new birds, and learn more about 1,000+ unique species!
                            </Text>
                            <UnorderedList mb="10px" fontSize="lg">
                                <ListItem>Create up to 25 lists</ListItem>
                                <ListItem>Earn milestones as you go</ListItem>
                                <ListItem>Filter by geographical region</ListItem>
                            </UnorderedList>
                            <Button size="lg" colorScheme="blue" px="20px" onClick={onNavigateToLists}>
                                View Lists
                            </Button>
                            <Heading mt="20px" size="md" id="home-heading">About the Project</Heading>
                            <Text fontSize="lg">
                                Aviary utilizes <Link href="https://nuthatch.lastelm.software/" color='blue.500' isExternal>Nuthatch API v2.3.0 <ExternalLinkIcon mx='2px' /></Link>, an open-source index of bird data and images. The database is currently in need of more contributors for photography, ID, and coding.
                            </Text>
                        </VStack>
                    </Box>
                    <Box order={{ base: 1, md: 2 }} mt="40px">
                        <VStack align="start">
                            {birdOfTheWeek ? (
                                <Box w="100%" className="bird-of-the-week" position="relative" borderRadius="lg" overflow="hidden">
                                    <Image
                                        className="Image"
                                        src={birdOfTheWeek?.images?.[0] ?? 'https://via.placeholder.com/150'}
                                        alt={birdOfTheWeek?.name || 'Bird Image'}
                                        objectFit="cover"
                                        w="100%"
                                    />
                                    <Box className="overlay" color="white" padding={{ base: '20px', md: '40px'}}>
                                        <Box>
                                            <Tag colorScheme='orange' mb="10px">Bird of the Week</Tag>
                                        </Box>
                                        <Box>
                                            <Heading size="lg" id="welcome" mb="20px">{birdOfTheWeek.name}</Heading>
                                            <Link href={`https://en.wikipedia.org/wiki/${encodeURIComponent(birdOfTheWeek.name)}`} isExternal>
                                                <Button leftIcon={<FcWikipedia fontSize="24px" />} colorScheme="gray" px="20px" size="lg">Learn More</Button>
                                            </Link>
                                        </Box>
                                    </Box>
                                </Box>
                            ) : (
                                <Text>Loading bird of the week...</Text>
                            )}
                        </VStack>
                    </Box>
                </SimpleGrid>
            </Box>
        </div>
    );
}