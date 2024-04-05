import React, { useState, useEffect } from 'react';
import {
    Button, Container, Input, SimpleGrid, Box, Image, Heading, Flex, Skeleton,
    AspectRatio, Stack, Tag, Card, CardBody, CardFooter, CloseButton, InputGroup, InputLeftElement,
    InputRightElement
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import useFetchBirds from '../hooks/useFetchBirds';

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
            return 'gray';
    }
};

const Search = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [triggerSearch, setTriggerSearch] = useState(false);
    const { birds, isLoading } = useFetchBirds(searchTerm, triggerSearch);

    const handleSearchClick = () => {
        if (!searchTerm.trim()) return;
        setTriggerSearch(true);
    };

    const clearSearch = () => {
        setSearchTerm('');
    };

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
                    {searchTerm && (
                        <InputRightElement>
                            <CloseButton size="sm" onClick={clearSearch} />
                        </InputRightElement>
                    )}
                </InputGroup>
            </Flex>
            <SimpleGrid spacing="40px" columns={{ base: 1, md: 2, xl: 3 }}>
                {isLoading ? <SkeletonLoad /> : birds.map(bird => (
                    <BirdCard key={bird.id} bird={bird} />
                ))}
            </SimpleGrid>
        </Container>
    );
};

const SkeletonLoad = () => (
    Array.from({ length: 6 }).map((_, index) => (
        <Box key={index}>
            <Card variant={'outline'}>
                <AspectRatio ratio={1 / 1.1}><Skeleton height="100%" width="100%" /></AspectRatio>
                <CardBody p="6">
                    <Stack align="start" spacing="20px">
                        <Skeleton height="28px" width="70%" />
                        <Skeleton height="20px" width="28%" />
                    </Stack>
                </CardBody>
                <CardFooter p="6">
                    <Flex justifyContent="space-between">
                        <Skeleton height="7px" width="100%" />
                    </Flex>
                </CardFooter>
            </Card>
        </Box>
    ))
);

const BirdCard = ({ bird }) => {
    return (
        <Box>
            <Card variant={'outline'}>
                <AspectRatio ratio={1 / 1.1}>
                    <Image
                        src={bird.imageUrl || 'https://via.placeholder.com/150'}
                        alt={`Image of ${bird.name}`}
                        objectFit="cover"
                        borderRadius="5px 5px 0px 0px"
                    />
                </AspectRatio>
                <CardBody>
                    <Stack align="start" spacing="2">
                        <Heading as="h3" size="md" id="logo">{bird.name}</Heading>
                        <Tag mt="10px" colorScheme={getColorScheme(bird.status)}>{bird.status || "Status Unknown"}</Tag>
                    </Stack>
                    <CardFooter gap="10px" mt="24px" p="0">
                        <Button variant='outline' colorScheme='gray' flex={1}>
                            Details
                        </Button>
                        <Button variant='outline' colorScheme='gray' flex={1}>Add</Button>
                    </CardFooter>
                </CardBody>
            </Card>
        </Box>
    );
};

export default Search;