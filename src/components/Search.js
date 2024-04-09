import React, { useState, useEffect } from 'react';
import {
    Button, Container, Input, SimpleGrid, Box, Image, Heading, VStack,
    InputRightElement, Flex, Skeleton, AspectRatio, Stack, Tag, Card,
    CardBody, CardFooter, InputGroup, InputLeftElement, Modal, ModalOverlay,
    ModalContent, ModalHeader, IconButton, ModalFooter, ModalBody,
    ModalCloseButton, FormControl, FormLabel, Select, Drawer,
    DrawerBody, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerContent,
    DrawerCloseButton, Text, useToast
} from '@chakra-ui/react';
import { SearchIcon, CloseIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from '../firebase';

const Search = ({ onAddBird }) => {
    const [birds, setBirds] = useState([]);
    const [currentPage, setCurrentPage] = useState(null); // Initialize with null
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [lists, setLists] = useState([]);
    const [selectedList, setSelectedList] = useState('');
    const [updatedBirdCount, setUpdatedBirdCount] = useState(null);
    const pageSize = 24; // Number of birds to fetch per page
    const apiKey = '7d077ea8-7b2e-4a97-abee-a56aaf551f2a';
    const [shouldSearchManually, setShouldSearchManually] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedBirdForDetails, setSelectedBirdForDetails] = useState(null);
    const [newListName, setNewListName] = useState('');
    const [newListDescription, setNewListDescription] = useState('');
    const toast = useToast();


    useEffect(() => {
        fetchUserLists();
    }, []);

    useEffect(() => {
        if (shouldSearchManually && currentPage !== null) { // Check if shouldSearchManually is true and currentPage is not null before fetching data
            fetchData();
            setShouldSearchManually(false); // Reset shouldSearchManually state after triggering search
        }
    }, [shouldSearchManually, currentPage, updatedBirdCount]);

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
            setLists(lists);
        } catch (error) {
            console.error("Error fetching user lists:", error);
        }
    };

    const db = getFirestore();

    const handleCreateListAndAddBird = async (bird) => {
        if (!newListName.trim()) {
            toast({
                title: "Please provide a name for the new list.",
                status: "warning",
                duration: 5000
            });
            return;
        }

        try {
            const db = getFirestore();
            // Create a new list
            const listRef = await addDoc(collection(db, 'lists'), {
                name: newListName,
                description: newListDescription,
                createdBy: auth.currentUser.uid,
                createdAt: serverTimestamp(),
            });

            // Add the bird to the new list
            await addDoc(collection(db, 'lists', listRef.id, 'birds'), {
                ...bird,
                addedAt: serverTimestamp(),
            });

            toast({
                title: `${bird.name} has been successfully added to the new list "${newListName}".`,
                status: "success",
                duration: 5000
            });

            // Optionally, re-fetch lists to reflect the update
            fetchUserLists();
            setShowModal(false); // Close the modal after adding
            setNewListName(''); // Reset the new list form fields
            setNewListDescription('');

            // Call the onAddBird callback to trigger list refresh in Home component
            onAddBird();

        } catch (error) {
            console.error("Error creating list and adding bird:", error);
            toast({
                title: "Error creating list and adding bird.",
                description: error.message,
                status: "error",
                duration: 9000,
                isClosable: true,
            });
        }
    };


    const handleOpenModal = async (bird) => {
        setSelectedBird(bird); // Set the selected bird
        await fetchUserLists(); // Fetch the latest lists every time the modal is opened
        setShowModal(true); // Open the modal to select a list
    };

    const addBirdToList = async (listId, bird) => {
        if (!listId || !bird) return;

        try {
            const birdsCollectionRef = collection(db, 'lists', listId, 'birds');
            await addDoc(birdsCollectionRef, {
                ...bird,
                addedAt: serverTimestamp(),
            });
            // Show success toast
            toast({
                title: `${bird.name} has been successfully added.`,
                status: "success",
                duration: 5000
            });
            // Optionally, re-fetch lists to reflect the update
            fetchUserLists();
            // Close the modal and/or drawer if open
            setShowModal(false);
            setIsDrawerOpen(false);

            // Call the onAddBird callback to trigger list refresh in Home component
            onAddBird();
        } catch (error) {
            console.error("Error adding bird to list:", error);
            // Optionally, show an error toast
            toast({
                title: "Error adding bird to list.",
                description: "An error occurred while trying to add the bird to your list.",
                status: "error",
                duration: 9000,
                isClosable: true,
            });
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
        setCurrentPage(0); // Set currentPage to start fetching from the first page
        setShouldSearchManually(true); // Set shouldSearchManually state to true to trigger manual search
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
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

    const handleAddBirdToList = async (bird) => {
        if (!selectedList) {
            alert("Please select a list first.");
            return;
        }

        try {
            await addBirdToList(selectedList, bird);
            alert("Bird added successfully.");
            setShowModal(false);
            setSelectedBird(null);
            fetchUserLists();
        } catch (error) {
            console.error("Error adding bird to list:", error);
        }
    };

    const displayValueOrPlaceholder = (value, placeholder = "No Data Available") =>
        value ? value : placeholder;


    const handleOpenDrawer = (bird) => {
        setSelectedBirdForDetails(bird);
        setIsDrawerOpen(true);
    };


    const handleSearchChange = (e) => setSearchTerm(e.target.value);
    const clearSearch = () => setSearchTerm('');

    const [selectedBird, setSelectedBird] = useState(null);

    return (
        <Container maxW="container.xl" mt="40px" mb="40px">
            <Flex justify="space-between" align="center" mb="40px">
                <InputGroup size='lg'>
                    <InputLeftElement pointerEvents="none">
                        <SearchIcon color="gray.300" />
                    </InputLeftElement>
                    <Input
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onKeyPress={handleKeyPress}
                        placeholder="Search by bird name"
                        size="lg"
                    />
                    {searchTerm && (
                        <InputRightElement>
                            <IconButton
                                icon={<CloseIcon />}
                                size="sm"
                                onClick={clearSearch}
                                variant="ghost"
                                aria-label="Clear search"
                            />
                        </InputRightElement>
                    )}
                </InputGroup>
            </Flex>
            {birds.length > 0 && (
                <SimpleGrid spacing="20px" columns={{ base: 1, md: 2, xl: 3 }}>
                    {isLoading
                        ? Array.from({ length: 3 }).map((_, index) => (
                            <Box key={index}>
                                <Card variant={'outline'}>
                                    <Skeleton height="300px" width="100%" />
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
                                <Card variant={'outline'} mt={{ base: '-20px', md: '0px' }}>
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
                                        <Button variant='outline' colorScheme='gray' flex={1} onClick={() => handleOpenDrawer(bird)}>
                                            Details
                                        </Button>
                                        <Button variant='outline' colorScheme='gray' flex={1} onClick={() => handleOpenModal(bird)}>Add</Button>
                                    </CardFooter>
                                </Card>
                            </Box>
                        ))
                    }
                </SimpleGrid>
            )}
            <Modal isOpen={showModal} onClose={handleCloseModal}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Add Bird to List</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {lists.length > 0 ? (
                            <FormControl>
                                <FormLabel>Select a list:</FormLabel>
                                <Select placeholder="Select list" value={selectedList} onChange={handleSelectList}>
                                    {lists.map(list => (
                                        <option key={list.id} value={list.id}>{list.name}</option>
                                    ))}
                                </Select>
                            </FormControl>
                        ) : (
                            <>
                                <FormControl>
                                    <FormLabel>New list name</FormLabel>
                                    <Input value={newListName} onChange={(e) => setNewListName(e.target.value)} />
                                </FormControl>
                                <FormControl mt={4}>
                                    <FormLabel>New list description (optional)</FormLabel>
                                    <Input value={newListDescription} onChange={(e) => setNewListDescription(e.target.value)} />
                                </FormControl>
                            </>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        {lists.length > 0 ? (
                            <Button colorScheme="blue" onClick={() => handleAddToList(selectedList, selectedBird)}>Add to List</Button>
                        ) : (
                            <Button colorScheme="blue" onClick={() => handleCreateListAndAddBird(selectedBird)}>Create List & Add Bird</Button>
                        )}
                    </ModalFooter>
                </ModalContent>
            </Modal>
            <Drawer
                isOpen={isDrawerOpen}
                placement="right"
                onClose={() => setIsDrawerOpen(false)}
                size="md" // You can adjust the size as needed
            >
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton m={3} />
                    <DrawerHeader mt={1}>Bird Details</DrawerHeader>
                    <DrawerBody>
                        {selectedBirdForDetails ? (
                            <>
                                <Image
                                    src={selectedBirdForDetails.images && selectedBirdForDetails.images.length > 0 ? selectedBirdForDetails.images[0] : 'https://via.placeholder.com/150'}
                                    alt={displayValueOrPlaceholder(selectedBirdForDetails.name)}
                                    objectFit="cover"
                                    borderRadius="md"
                                    mb="20px"
                                    h="500"
                                    w="100%"
                                />
                                <Heading as="h4" size="sm">Name</Heading>
                                <Text id="drawer-data">{displayValueOrPlaceholder(selectedBirdForDetails.name)}</Text>
                                <Heading as="h4" size="sm">Scientific Name</Heading>
                                <Text id="drawer-data">{displayValueOrPlaceholder(selectedBirdForDetails.sciName)}</Text>
                                <Heading as="h4" size="sm">Order</Heading>
                                <Text id="drawer-data">{displayValueOrPlaceholder(selectedBirdForDetails.order)}</Text>
                                <Heading as="h4" size="sm">Family</Heading>
                                <Text id="drawer-data">{displayValueOrPlaceholder(selectedBirdForDetails.family)}</Text>
                                <Heading as="h4" size="sm">Status</Heading>
                                <Text id="drawer-data">{displayValueOrPlaceholder(selectedBirdForDetails.status)}</Text>
                                <Heading as="h4" size="sm">Region(s)</Heading>
                                <Text id="drawer-data">{selectedBirdForDetails.region && selectedBirdForDetails.region.length > 0 ? selectedBirdForDetails.region.join(', ') : "No Data Available"}</Text>
                                <Heading as="h4" size="sm">Wingspan</Heading>
                                <Text id="drawer-data">{selectedBirdForDetails.wingspanMin && selectedBirdForDetails.wingspanMax ? `${selectedBirdForDetails.wingspanMin} - ${selectedBirdForDetails.wingspanMax} cm` : "No Data Available"}</Text>
                                <Heading as="h4" size="sm">Length</Heading>
                                <Text id="drawer-data">{selectedBirdForDetails.lengthMin && selectedBirdForDetails.lengthMax ? `${selectedBirdForDetails.lengthMin} - ${selectedBirdForDetails.lengthMax} cm` : "No Data Available"}</Text>
                            </>
                        ) : (
                            <Text>No bird selected</Text>
                        )}
                    </DrawerBody>
                    <DrawerFooter>
                        <Flex width="full"> {/* Ensure the Flex container takes up the full width */}
                            <Button
                                colorScheme='blue'
                                width="full" // Ensure the button takes up the full width of its Flex container
                                onClick={() => {
                                    handleOpenModal(selectedBirdForDetails);
                                    setIsDrawerOpen(false);
                                }}
                            >
                                Add to List
                            </Button>
                        </Flex>
                    </DrawerFooter>

                </DrawerContent>
            </Drawer>
        </Container>
    );
};

export default Search;

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
}