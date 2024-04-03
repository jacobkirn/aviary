import React, { useState, useEffect } from 'react';
import {
    Container,
    Text,
    Button,
    Input,
    SimpleGrid,
    Box,
    Image,
    Heading,
    VStack,
    Flex,
    Skeleton,
    AspectRatio,
    Stack,
    Card,
    CardBody,
    Badge
} from '@chakra-ui/react';
import axios from 'axios';

const NuthatchApiComponent = () => {
    const [birds, setBirds] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const pageSize = 24; // Number of birds to fetch per page
    const apiKey = '7d077ea8-7b2e-4a97-abee-a56aaf551f2a';

    useEffect(() => {
        fetchData();
    }, [currentPage]); // Fetch data when currentPage changes

    useEffect(() => {
        setCurrentPage(1); // Reset to the first page when the search term changes
    }, [searchTerm]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`https://nuthatch.lastelm.software/v2/birds?page=${currentPage}&pageSize=${pageSize}&hasImg=true&operator=AND&name=${searchTerm}`, {
                headers: {
                    'api-key': apiKey
                }
            });
            setBirds(response.data.entities);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            fetchData();
        }
    };

    const handleSearch = () => {
        fetchData();
    };

    return (
        <Container maxW="container.xl" mt="40px" mb="40px;">
            <Flex justify="space-between" align="center" mb="40px" gap="10px">
                <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by bird name"
                    size="lg"
                    onKeyPress={handleKeyPress}
                />
                <Button
                    onClick={handleSearch}
                    colorScheme="teal"
                    size="lg"
                >
                    Search
                </Button>
            </Flex>
            <SimpleGrid columns={[1, 2, 3]} spacing="40px">
                {isLoading
                    ? Array.from({ length: 3 }).map((_, index) => (
                        <Box key={index}>
                            <Card variant={'outline'}>
                                <AspectRatio ratio={4 / 3}>
                                    <Skeleton height="100%" width="100%" />
                                </AspectRatio>
                                <CardBody p="6">
                                    <Stack align="start" spacing="2">
                                        <Skeleton height="20px" width="70%" />
                                        <Skeleton height="20px" width="50%" />
                                    </Stack>
                                </CardBody>
                            </Card>
                        </Box>
                    ))
                    : birds.map((bird, index) => (
                        <Box key={index}>
                            <Card variant={'outline'}>
                                <AspectRatio ratio={4 / 3}>
                                    <Image
                                        src={bird.images && bird.images.length > 0 ? bird.images[0] : 'https://via.placeholder.com/150'}
                                        alt={bird.name}
                                        objectFit="cover"
                                    />
                                </AspectRatio>
                                <CardBody p="6">
                                    <VStack align="start" spacing="2">
                                        <Text fontSize="lg" fontWeight="bold">{bird.name}</Text>
                                        <Text fontSize="sm"><b>Scientific Name:</b> {bird.sciName}</Text>
                                        <Text fontSize="sm"><b>Order:</b> {bird.order}</Text>
                                        <Text fontSize="sm"><b>Family:</b> {bird.family}</Text>
                                        <Text fontSize="sm"><b>Status:</b> {bird.status}</Text>
                                        <Text fontSize="sm"><b>Region:</b> {bird.region.join(', ')}</Text>
                                    </VStack>
                                </CardBody>
                            </Card>
                        </Box>
                    ))
                }
            </SimpleGrid>
        </Container>
    );
};

export default NuthatchApiComponent;