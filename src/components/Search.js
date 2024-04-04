import React, { useState, useEffect } from 'react';
import {
    Button, Container, Input, SimpleGrid, Box, Image, Heading, Flex, Skeleton,
    AspectRatio, Stack, Tag, Card, CardBody, CardFooter, InputGroup, InputLeftElement,
    InputRightElement
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import GenericModal from './GenericModal';
import useFetchBirds from '../hooks/useFetchBirds'; // Adjust this path as necessary

// Define getColorScheme outside of the Search component
const getColorScheme = (status) => {
    switch (status) {
        case 'Low Concern':
            return 'green';
        case 'Common Bird in Steep Decline':
            return 'orange';
        case 'Declining':
            return 'yellow';
        case 'Red Watch List':
            return 'red';
        default:
            return 'gray'; // Default case for empty or unrecognized status
    }
};

const Search = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [triggerSearch, setTriggerSearch] = useState(false);
    const { birds, isLoading } = useFetchBirds(searchTerm, triggerSearch);

    const handleSearchClick = () => {
        if (!searchTerm.trim()) return; // Prevent searching with an empty string
        setTriggerSearch(true); // Initiate the search
    };

    // Resets triggerSearch to false after a search is made
    // to prepare for the next search trigger
    useEffect(() => {
        if (triggerSearch) setTriggerSearch(false);
    }, [triggerSearch]);

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSearchClick();
        }
    };

    return (
        <Container maxW="container.xl" mt="40px" mb="40px">
            <Flex justify="space-between" align="center" mb="40px">
                <InputGroup size='lg'>
                    <InputLeftElement pointerEvents="none" children={<SearchIcon color="gray.300" />} />
                    <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by bird name"
                        size="lg"
                        onKeyPress={handleKeyPress}
                    />
                    <InputRightElement width='4.5rem'>
                        <Button colorScheme='blue' size='sm' mr="2" borderRadius="4" onClick={handleSearchClick}>Search</Button>
                    </InputRightElement>
                </InputGroup>
            </Flex>
            <SimpleGrid columns={3} spacing="40px">
                {isLoading ? <SkeletonLoad /> : birds.map(bird => (
                    <BirdCard key={bird.id} bird={bird} />
                ))}
            </SimpleGrid>
        </Container>
    );
};

const SkeletonLoad = () => (
    Array.from({ length: 3 }).map((_, index) => (
        <Box key={index}>
            <Card variant={'outline'}>
                <AspectRatio ratio={1 / 1.1}><Skeleton height="100%" width="100%" /></AspectRatio>
                <CardBody p="6">
                    <Stack align="start" spacing="2">
                        <Skeleton height="20px" width="70%" />
                        <Skeleton height="20px" width="50%" />
                    </Stack>
                </CardBody>
            </Card>
        </Box>
    ))
);

const BirdCard = ({ bird }) => {
    return (
        <Box>
            <Card variant={'outline'} maxWidth="400px">
                <AspectRatio ratio={1 / 1.1}>
                    <Image
                        src={bird.imageUrl || 'https://via.placeholder.com/150'}
                        alt={`Image of ${bird.name}`}
                        objectFit="cover"
                        borderRadius="5px 5px 0px 0px"
                    />
                </AspectRatio>
                <CardBody p="6">
                    <Stack align="start" spacing="2">
                        <Heading as="h3" size="md" id="logo">{bird.name}</Heading>
                        <Tag mt="10px" colorScheme={getColorScheme(bird.status)}>{bird.status || "Status Unknown"}</Tag>
                    </Stack>
                </CardBody>
                {/* Implement any other button or action you need here */}
            </Card>
        </Box>
    );
};

export default Search;