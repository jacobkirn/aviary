import React, { useState, useEffect } from 'react';
import {
    Button, Container, Input, SimpleGrid, Box, Image, Heading,
    InputRightElement, Flex, Skeleton, AspectRatio, Stack, Tag, Card,
    CardBody, CardFooter, InputGroup, InputLeftElement, IconButton, useToast
} from '@chakra-ui/react';
import { SearchIcon, CloseIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from '../firebase';
import AddBirdModal from '../components/AddBirdModal';
import BirdDrawer from '../components/BirdDrawer';
import BirdCard from '../components/BirdCard';

const Search = ({ onAddBird }) => {
    const [birds, setBirds] = useState([]);
    const [currentPage, setCurrentPage] = useState(null);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [lists, setLists] = useState([]);
    const [selectedList, setSelectedList] = useState('');
    const [updatedBirdCount] = useState(null);
    const pageSize = 24;
    const apiKey = process.env.REACT_APP_NUTHATCH_API_KEY;
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
        if (shouldSearchManually && currentPage !== null) {
            fetchData();
            setShouldSearchManually(false);
        }
    }, [shouldSearchManually, currentPage, updatedBirdCount]);

    const fetchUserLists = async () => {
        if (!auth.currentUser) return;
        const db = getFirestore();
        try {
            const listsQuery = query(collection(db, 'lists'), where('createdBy', '==', auth.currentUser.uid));
            const querySnapshot = await getDocs(listsQuery);
            setLists(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error("Error fetching user lists:", error);
            toast({
                title: "Error fetching lists.",
                description: "Unable to fetch lists. Please try again later.",
                status: "error",
                duration: 9000,
                isClosable: true,
            });
        }
    };

    const db = getFirestore();

    const handleCreateListAndAddBird = async (bird) => {
        if (!newListName.trim()) {
          toast({
            title: "Name required",
            description: "Please provide a name for the new list.",
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

            fetchUserLists();
            setShowModal(false);
            setNewListName(''); 
            setNewListDescription('');
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
            toast({
                title: `${bird.name} has been successfully added.`,
                status: "success",
                duration: 5000
            });
            fetchUserLists();
            setShowModal(false);
            setIsDrawerOpen(false);
            onAddBird();
        } catch (error) {
            console.error("Error adding bird to list:", error);
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
        setCurrentPage(0);
        setShouldSearchManually(true);
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
        setShowModal(false); 
        setSelectedBird(null);
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

    const handleAddToListFromDrawer = () => {
        handleOpenModal(selectedBirdForDetails);
        setIsDrawerOpen(false);
    };

    const handleSearchChange = (e) => setSearchTerm(e.target.value);
    const clearSearch = () => setSearchTerm('');

    const [selectedBird, setSelectedBird] = useState(null);

    return (
        <Container maxW="container.xl" mt="40px" mb="40px">

            {/* Search Input */}

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

            {/* Birds Listing */}

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
                            <BirdCard
                                key={index}
                                bird={bird}
                                onDetailsClick={() => handleOpenDrawer(bird)}
                                onAddClick={() => handleOpenModal(bird)}
                            />
                        ))
                    }
                </SimpleGrid>
            )}

            {/* Modals and Drawers */}

            <AddBirdModal
                isOpen={showModal}
                onClose={handleCloseModal}
                lists={lists}
                handleSelectList={handleSelectList}
                selectedList={selectedList}
                selectedBird={selectedBird}
                newListName={newListName}
                setNewListName={setNewListName}
                newListDescription={newListDescription}
                setNewListDescription={setNewListDescription}
                handleCreateListAndAddBird={handleCreateListAndAddBird}
                handleAddToList={handleAddToList}
            />

            <BirdDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                selectedBirdForDetails={selectedBirdForDetails}
                onAddToListClick={handleAddToListFromDrawer}
                showAddToListButton={true}
            />
        </Container>
    );
};

export default Search;