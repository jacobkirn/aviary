import React, { useState, useEffect } from 'react';
import {
    Button,
    Container,
    Input,
    SimpleGrid,
    Box,
    Image,
    Heading,
    VStack,
    InputRightElement,
    Flex,
    Skeleton,
    AspectRatio,
    Stack,
    Tag, // Import Tag component
    Card,
    CardBody,
    CardFooter,
    InputGroup,
    InputLeftElement
} from '@chakra-ui/react';
import { SearchIcon, SmallAddIcon, InfoOutlineIcon } from '@chakra-ui/icons'; // Import icons
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
    }, [currentPage]); 

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

    const handleSearch = () => {
        fetchData();
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            fetchData();
        }
    };

    return (
        <Container maxW="container.xl" mt="40px" mb="40px;">
            <Flex justify="space-between" align="center" mb="40px" gap="10px">
                <InputGroup size='lg'>
                    <InputLeftElement
                        pointerEvents="none"
                        children={<SearchIcon color="gray.300" />}
                    />
                    <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by bird name"
                        size="lg"
                        onKeyPress={handleKeyPress}
                    />
                    <InputRightElement width='4.5rem'>
                        <Button colorScheme='linkedin' pr="10px" size='sm' mr="2" onClick={handleSearch}>
                            Search
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </Flex>
            <SimpleGrid columns={3} spacing="40px">
                {isLoading
                    ? Array.from({ length: 3 }).map((_, index) => (
                        <Box key={index}>
                            <Card variant={'outline'}>
                                <AspectRatio ratio={1 / 1.1}>
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
                            <Card variant={'outline'} maxWidth="400px"> {/* Set maxWidth here */}
                                <AspectRatio ratio={1 / 1.1}>
                                    <Image
                                        src={bird.images && bird.images.length > 0 ? bird.images[0] : 'https://via.placeholder.com/150'}
                                        alt={bird.name}
                                        objectFit="cover"
                                        style={{ borderRadius: '5px 5px 0px 0px' }}
                                    />
                                </AspectRatio>
                                <CardBody p="6">
                                    <Stack align="start" spacing="2">
                                        <Heading id="logo" as="h3" size="md" p="0">{bird.name}</Heading>
                                        <Tag mt="10px" colorScheme={getColorScheme(bird.status)}>{bird.status || "Conservation Status Unknown"}</Tag> {/* Add Tag component */}
                                    </Stack>
                                </CardBody>
                                <CardFooter gap="10px" mt="-20px">
                                    <Button variant='outline' colorScheme='gray' flex={1}>
                                        Details
                                    </Button>
                                    <Button variant='outline' colorScheme='gray' flex={1}>
                                        Add
                                    </Button>
                                </CardFooter>
                            </Card>
                        </Box>
                    ))
                }
            </SimpleGrid>
        </Container>
    );
};

export default NuthatchApiComponent;

// Function to determine Tag color scheme based on conservation status
const getColorScheme = (status) => {
    switch(status) {
        case 'Low Concern':
            return 'green';
        case 'Common Bird in Steep Decline':
            return 'orange';
        case 'Declining':
            return 'yellow';
        case 'Red Watch List':
            return 'red';
        case '':
            return 'gray';
    }
};