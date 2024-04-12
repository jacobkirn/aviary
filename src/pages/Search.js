import React, { useState, useEffect } from 'react';
import {
    Button, Container, Input, SimpleGrid, Box, Image, Heading,
    InputRightElement, Flex, Spinner, AspectRatio, Stack, Tag, Card, Select,
    CardBody, CardFooter, InputGroup, InputLeftElement, Text, IconButton, useToast
} from '@chakra-ui/react';
import { SearchIcon, CloseIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from '../firebase';
import NoSearch from '../images/no-search.png';
import NoResults from '../images/no-results.png';
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
    const [selectedRegion, setSelectedRegion] = useState('All Regions');
    const [lastSearchTerm, setLastSearchTerm] = useState('');
    const toast = useToast();

    useEffect(() => {
        fetchUserLists();
    }, []);

    useEffect(() => {
        // Trigger search when the region changes if there's an active search term or if a search has been performed before
        if (searchTerm.trim() !== '' || currentPage !== null) {
            setShouldSearchManually(true); // Indicate that a search should happen
            setCurrentPage(0); // Reset to the first page
        }
    }, [selectedRegion]); // Watch for changes in selectedRegion

    // The existing useEffect that triggers fetchData
    useEffect(() => {
        if (shouldSearchManually && currentPage !== null) {
            fetchData();
            setShouldSearchManually(false); // Reset the manual search trigger after fetching
        }
    }, [shouldSearchManually, currentPage, updatedBirdCount, selectedRegion]); // This already watches selectedRegion among other dependencies      

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
                title: "Bird Added",
                description: `"${bird.name}" has been successfully added.`,
                status: "success",
                duration: 5000,
                isClosable: true,
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
            let filteredBirds = response.data.entities;

            if (selectedRegion !== 'All Regions') {
                filteredBirds = filteredBirds.filter(bird => bird.region.includes(selectedRegion));
            }

            setBirds(filteredBirds);
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
        setLastSearchTerm(searchTerm); // Update lastSearchTerm here
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
    const clearSearch = () => {
        setSearchTerm('');
        setCurrentPage(null);
        setBirds([]);
        setIsLoading(false);
    };

    const [selectedBird, setSelectedBird] = useState(null);

    return (
        <Container maxW="container.xl" mt="40px" mb="40px">

            {/* Search Input and Region Filter */}

            <Flex
                justify="space-between"
                align="center"
                mb="40px"
                gap={{ base: '10px', md: '10px' }}
                direction={{ base: 'column-reverse', md: 'row' }}
            >
                <InputGroup size='lg' width={{ base: '100%', md: '75%' }}>
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
                <Select
                    size='lg'
                    style={{ paddingLeft: '0.75em', paddingRight: '0.75em' }}
                    width={{ base: '100%', md: '25%' }}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                >
                    <option value="All Regions">All Regions</option>
                    <option value="North America">North America</option>
                    <option value="Western Europe">Western Europe</option>
                </Select>
            </Flex>

            {/* Spinner while loading */}
            {isLoading && (
                <Flex justify="center" mt="120px">
                    <Spinner size="xl" color="blue.500" />
                </Flex>
            )}

            {!isLoading && (
                currentPage === null ? (
                    <div></div> // Placeholder for initial state before search
                ) : birds.length > 0 ? (
                    <SimpleGrid spacing="20px" columns={{ base: 1, md: 2, xl: 3 }}>
                        {birds.map((bird, index) => (
                            <BirdCard
                                key={index}
                                bird={bird}
                                onDetailsClick={() => handleOpenDrawer(bird)}
                                onAddClick={() => handleOpenModal(bird)}
                            />
                        ))}
                    </SimpleGrid>
                ) : (
                    <Flex direction="column" align="center" justify="center" mt="80px">
                        <Flex mb="20px" justifyContent={"center"}>
                            <Image src={NoResults} width={"250px"} />
                        </Flex>
                        <Text id="no-list" fontSize="xl" textAlign="center" px={4}>
                            "{lastSearchTerm}" returned no results.
                        </Text>
                        <Text id="no-list" fontSize="xl" textAlign="center" px={4}>
                            Try expanding your filters or checking your spelling.
                        </Text>
                    </Flex>
                )
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