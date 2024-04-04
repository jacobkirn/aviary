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
    InputLeftElement,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Select
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons'; // Import icons
import axios from 'axios';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from '../firebase'; // Make sure this path is correct
import { addBirdToList } from '../firestoreServices'; // Adjust the path as needed

const NuthatchApiComponent = () => {
    const [birds, setBirds] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [lists, setLists] = useState([]);
    const [selectedList, setSelectedList] = useState('');
    const [updatedBirdCount, setUpdatedBirdCount] = useState(null);
    const pageSize = 24; // Number of birds to fetch per page
    const apiKey = '7d077ea8-7b2e-4a97-abee-a56aaf551f2a';

    useEffect(() => {
        fetchUserLists();
    }, []); // This ensures fetchUserLists is called when the component mounts

    useEffect(() => {
        fetchData();
    }, [currentPage, updatedBirdCount]);

    const fetchUserLists = async () => {
        if (!auth.currentUser) return;

        const db = getFirestore();
        try {
            const listsQuery = query(collection(db, 'lists'), where('createdBy', '==', auth.currentUser.uid));
            const querySnapshot = await getDocs(listsQuery);
            const lists = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setLists(lists); // Make sure this line is correctly setting the fetched lists
        } catch (error) {
            console.error("Error fetching user lists:", error);
        }

        console.log(lists); // Log the fetched lists
    };

    const db = getFirestore();

    const handleOpenModal = async (birdId) => {
        setSelectedBird(birdId); // Set the selected bird ID
        await fetchUserLists(); // Fetch the latest lists every time the modal is opened
        setShowModal(true); // Open the modal to select a list
    };       

    const addBirdToList = async (listId, birdId) => {
        if (!listId || !birdId) return; // Basic validation

        try {
            const birdsCollectionRef = collection(db, 'lists', listId, 'birds');
            await addDoc(birdsCollectionRef, {
                birdId: birdId,
                addedAt: serverTimestamp(),
            });
            console.log("Bird added to the list successfully");
        } catch (error) {
            console.error("Error adding bird to list:", error);
        }
    };

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

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleSelectList = (event) => {
        setSelectedList(event.target.value);
    };

    const handleAddToList = async () => {
        if (!selectedList) {
            alert("Please select a list.");
            return;
        }
        if (!selectedBird) {
            alert("No bird selected.");
            return;
        }

        await addBirdToList(selectedList, selectedBird);
        setShowModal(false); // Close the modal after adding
        setSelectedBird(null); // Reset selected bird
    };

    const handleAddBirdToList = async (birdId) => {
        if (!selectedList) {
            alert("Please select a list first.");
            return;
        }
    
        try {
            await addBirdToList(selectedList, birdId);
            alert("Bird added successfully.");
            setShowModal(false); // Assuming this closes the modal where you select a list to add a bird
            setSelectedBird(null); // Resetting selected bird state
            fetchUserLists(); // Fetching lists again to update the UI
        } catch (error) {
            console.error("Error adding bird to list:", error);
        }
    };    

    const [selectedBird, setSelectedBird] = useState(null);


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
                        <Button colorScheme='linkedin' pr="10px" size='sm' mr="2" borderRadius="4px" onClick={handleSearch}>
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
                            <Card variant={'outline'} maxWidth="400px">
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
                                        <Heading id="logo" as="h3" size="md" p="0">
                                            {bird.name}
                                        </Heading>
                                        <Tag mt="10px" colorScheme={getColorScheme(bird.status)}>{bird.status || "Conservation Status Unknown"}</Tag>
                                    </Stack>
                                </CardBody>
                                <CardFooter gap="10px" mt="-20px">
                                    <Button variant='outline' colorScheme='gray' flex={1}>
                                        Details
                                    </Button>
                                    <Button variant='outline' colorScheme='gray' flex={1} onClick={() => handleOpenModal(bird.id)}>Add</Button>
                                </CardFooter>
                            </Card>
                        </Box>
                    ))
                }
            </SimpleGrid>
            {/* Modal for selecting list */}
            <Modal isOpen={showModal} onClose={handleCloseModal}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Add Bird to List</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl>
                            <FormLabel>Select a list:</FormLabel>
                            <Select placeholder="Select list" value={selectedList} onChange={handleSelectList}>
                                {lists.map(list => (
                                    <option key={list.id} value={list.id}>{list.name}</option>
                                ))}
                            </Select>
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" onClick={handleAddToList}>Add to List</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Container>
    );
};

export default NuthatchApiComponent;

// Function to determine Tag color scheme based on conservation status
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
        case '':
            return 'gray';
    }
};