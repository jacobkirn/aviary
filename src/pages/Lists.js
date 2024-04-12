import React, { useState, useEffect } from 'react';
import { getFirestore, addDoc, updateDoc, collection, query, where, getDocs, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import {
    AspectRatio, Box, Tag, Button, Card, Image, CardBody, CardFooter, SimpleGrid, Container, Heading, Text,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, Input,
    Select, Flex, useToast, Menu, MenuButton, MenuList, MenuItem, IconButton
} from '@chakra-ui/react';
import { FaPlus, FaCog } from 'react-icons/fa';
import { BiTrash } from "react-icons/bi";
import { IoMdAdd } from "react-icons/io";
import NoList from '../images/no-list.png';
import NoBird from '../images/no-birds.png';
import { format } from 'date-fns';
import BirdDrawer from '../components/BirdDrawer';
import { MdOutlinePlaylistAdd } from "react-icons/md";
import { FaEdit, FaCopy, FaTrashAlt } from 'react-icons/fa';

const Lists = ({ user, refreshLists, onAddBirdsClick }) => {
    const [lists, setLists] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [newListDescription, setNewListDescription] = useState('');
    const [selectedListId, setSelectedListId] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [listToDelete, setListToDelete] = useState(null);
    const [showBirdDeleteConfirmModal, setShowBirdDeleteConfirmModal] = useState(false);
    const [birdToDelete, setBirdToDelete] = useState({ listId: '', birdDocId: '' });
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedBirdForDetails, setSelectedBirdForDetails] = useState(null);
    const selectedListDetails = lists.find(list => list.id === selectedListId);
    const formattedDateCreated = selectedListDetails ? format(new Date(selectedListDetails.createdAt.seconds * 1000), 'PPP') : '';
    const toast = useToast();

    const fetchListsAndBirds = async () => {
        if (!user) return;
        const db = getFirestore();
        try {
            const q = query(collection(db, 'lists'), where('createdBy', '==', user.uid));
            const querySnapshot = await getDocs(q);
            const listsData = await Promise.all(querySnapshot.docs.map(async (doc) => {
                const listData = {
                    id: doc.id,
                    ...doc.data()
                };
                const birdsSnapshot = await getDocs(collection(db, 'lists', doc.id, 'birds'));
                listData.birds = birdsSnapshot.docs.map(birdDoc => ({
                    docId: birdDoc.id,
                    ...birdDoc.data()
                }));
                return listData;
            }));

            setLists(listsData);
            // Check if the currently selected list ID is still valid
            const listIds = listsData.map(list => list.id);
            if (!listIds.includes(selectedListId) && listIds.length > 0) {
                setSelectedListId(listIds[0]); // Reset to the first list if the current one is no longer valid
            }
            localStorage.setItem('selectedListId', selectedListId); // Update local storage with the current or reset list ID
        } catch (error) {
            console.error("Error fetching lists and birds:", error);
            toast({
                title: "Error fetching data",
                description: "Unable to fetch lists and birds. Please try again later.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    useEffect(() => {
        fetchListsAndBirds();
        // Restore the selected list ID from local storage on component mount
        const savedListId = localStorage.getItem('selectedListId');
        if (savedListId) {
            setSelectedListId(savedListId);
        }
    }, [user, refreshLists]);


    useEffect(() => {
        fetchListsAndBirds();
        const savedListId = localStorage.getItem('selectedListId');
        if (savedListId) {
            setSelectedListId(savedListId);
        }
    }, [user, refreshLists]);
    const handleAddOrUpdateList = async () => {
        if (!newListName.trim()) {
            toast({
                title: "Error",
                description: "List name is required.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }
        try {
            const db = getFirestore();
            if (isEditMode) {
                await updateDoc(doc(db, 'lists', selectedListId), {
                    name: newListName,
                    description: newListDescription,
                });
                toast({
                    title: "List Updated",
                    description: `"${newListName}" has been updated successfully.`,
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
            } else {
                const newListRef = await addDoc(collection(db, 'lists'), {
                    name: newListName,
                    description: newListDescription,
                    createdBy: user.uid,
                    createdAt: serverTimestamp(),
                });
                setSelectedListId(newListRef.id);
                toast({
                    title: "List Created",
                    description: `"${newListName}" has been created successfully.`,
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
            }
            setNewListName('');
            setNewListDescription('');
            setShowModal(false);
            setIsEditMode(false);
            fetchListsAndBirds();
        } catch (error) {
            toast({
                title: "Failed to complete action",
                description: "Unexpected error occurred.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const promptDeleteList = (listId) => {
        setListToDelete(listId);
        setShowConfirmModal(true);
    };

    const deleteList = async () => {
        if (!listToDelete) return;
        try {
            const db = getFirestore();
            await deleteDoc(doc(db, 'lists', listToDelete));
            toast({
                title: "List Deleted",
                description: "The list has been successfully deleted.",
                status: "info",
                duration: 5000,
                isClosable: true,
            });
            setListToDelete(null);
            setShowConfirmModal(false);
            setSelectedListId('');
            fetchListsAndBirds();
        } catch (error) {
            toast({
                title: "Failed to delete list",
                description: "Unexpected error occurred.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            setListToDelete(null);
            setShowConfirmModal(false);
        }
    };

    const handleEditListDetails = () => {
        if (!selectedListId) return;
        const list = lists.find(list => list.id === selectedListId);
        if (list) {
            setNewListName(list.name);
            setNewListDescription(list.description);
            setIsEditMode(true);
            setShowModal(true);
        }
    };

    const promptDeleteBird = (listId, birdDocId) => {
        setBirdToDelete({ listId, birdDocId });
        setShowBirdDeleteConfirmModal(true);
    };

    const removeBirdFromList = async () => {
        if (!birdToDelete.listId || !birdToDelete.birdDocId) return;
        try {
            const db = getFirestore();
            await deleteDoc(doc(db, `lists/${birdToDelete.listId}/birds/${birdToDelete.birdDocId}`));
            toast({
                title: "Bird Removed",
                description: "The bird has been removed from the list.",
                status: "info",
                duration: 5000,
                isClosable: true,
            });
            fetchListsAndBirds();
            setShowBirdDeleteConfirmModal(false);
        } catch (error) {
            console.error("Error removing bird from list:", error);
        }
    };

    const handleDuplicateListWithBirds = async () => {
        if (!selectedListId) return;

        const listToDuplicate = lists.find(list => list.id === selectedListId);
        if (!listToDuplicate) return;

        const db = getFirestore();
        try {
            // Duplicate the list
            const newListRef = await addDoc(collection(db, 'lists'), {
                name: `${listToDuplicate.name} (copy)`,
                description: listToDuplicate.description,
                createdBy: user.uid,
                createdAt: serverTimestamp(),
            });

            // Duplicate each bird
            for (const bird of listToDuplicate.birds) {
                await addDoc(collection(db, 'lists', newListRef.id, 'birds'), {
                    ...bird,
                    createdAt: serverTimestamp() // or you can preserve the original timestamp if needed
                });
            }

            toast({
                title: "List and Birds Duplicated",
                description: `"${listToDuplicate.name}" and its birds have been duplicated successfully.`,
                status: "success",
                duration: 5000,
                isClosable: true,
            });

            fetchListsAndBirds(); // Refresh the lists
        } catch (error) {
            toast({
                title: "Failed to duplicate list and birds",
                description: "Unexpected error occurred.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleSelectedListChange = (e) => {
        const newSelectedListId = e.target.value;
        setSelectedListId(newSelectedListId);
        localStorage.setItem('selectedListId', newSelectedListId); // Save to localStorage
    };

    const handleOpenDrawer = (bird) => {
        setSelectedBirdForDetails(bird);
        setIsDrawerOpen(true);
    };

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

    const getTagAndColor = (birdCount) => {
        let tag = '';
        let colorScheme = 'gray';
        if (birdCount >= 50) {
            tag = '🦅 Bird Braniac';
            colorScheme = 'yellow';
        } else if (birdCount >= 25) {
            tag = '🐥 Feathered Friend';
            colorScheme = 'cyan'; // Assuming 'silver' is a custom color you've defined in your theme
        } else if (birdCount >= 10) {
            tag = '🐣 Bird Nerd';
            colorScheme = 'orange'; // Assuming 'bronze' is a custom color you've defined in your theme
        } else if (birdCount >= 1) {
            tag = '🥚 Early Bird';
            colorScheme = 'purple';
        }
        return { tag, colorScheme };
    };

    let tag, colorScheme;
    if (selectedListDetails && selectedListDetails.birds.length > 0) {
        const tagColor = getTagAndColor(selectedListDetails.birds.length);
        tag = tagColor.tag;
        colorScheme = tagColor.colorScheme;
    }

    if (lists.length === 0) {
        return (
            <Container maxW="container.xl" mt="40px" mb="40px" textAlign="center">
                <Flex mb="20px" mt="80px" justifyContent={"center"}>
                    <img src={NoList} width={"200px"} />
                </Flex>
                <Text id="no-list" fontSize="xl">You don't have any lists... yet.</Text>
                <Button size="lg" leftIcon={<IoMdAdd />} colorScheme="blue" mt="20px" px="20px" onClick={() => setShowModal(true)}>
                    Create New List
                </Button>

                <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Create New List</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody pb={6}>
                            <FormControl isRequired>
                                <FormLabel>List Name</FormLabel>
                                <Input value={newListName} onChange={(e) => setNewListName(e.target.value)} />
                            </FormControl>
                            <FormControl mt={4}>
                                <FormLabel>Description</FormLabel>
                                <Input value={newListDescription} onChange={(e) => setNewListDescription(e.target.value)} />
                            </FormControl>
                        </ModalBody>
                        <ModalFooter>
                            <Button colorScheme="blue" mr={3} onClick={handleAddOrUpdateList}>
                                Create List
                            </Button>
                            <Button onClick={() => setShowModal(false)}>Cancel</Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </Container>
        );
    }

    return (
        <Container maxW="container.xl" mt="40px" mb="40px">
            <Box display="flex" alignItems="center" w="100%" mb="20px">
                <Select
                    size="lg"
                    value={selectedListId}
                    onChange={handleSelectedListChange}
                    flex={{ base: "1", md: "none" }}
                    width={{ base: "100%", md: "300px" }}
                    style={{ paddingLeft: '0.75em', paddingRight: '0.75em' }}
                    mr="10px"
                >
                    {lists.map((list) => (
                        <option key={list.id} value={list.id}>{list.name}</option>
                    ))}
                </Select>
                <Menu>
                    <MenuButton
                        as={IconButton}
                        icon={<FaCog />}
                        size="lg"
                        colorScheme="gray"
                        variant="outline"
                        flexShrink="0"
                    >
                        Settings
                    </MenuButton>
                    <MenuList size="lg">
                        <MenuItem minH='40px' icon={<FaEdit fontSize="16px" />} onClick={handleEditListDetails}>Edit List Details</MenuItem>
                        <MenuItem minH='40px' icon={<FaCopy fontSize="16px" />} onClick={handleDuplicateListWithBirds}>Duplicate List</MenuItem>
                        <MenuItem minH='40px' icon={<FaTrashAlt fontSize="16px" />} onClick={() => promptDeleteList(selectedListId)}>Delete List</MenuItem>
                    </MenuList>
                </Menu>
                <IconButton
                    icon={<MdOutlinePlaylistAdd />}
                    aria-label="Add new list"
                    onClick={() => setShowModal(true)}
                    size="lg"
                    colorScheme='gray'
                    variant={'outline'}
                    fontSize="28px"
                    flexShrink="0"
                    ml="10px"
                />
            </Box>

            <Flex alignItems="center" flexWrap="wrap" gap="10px" mt="20px" mb="20px">
                {selectedListDetails && (
                    <>
                        {selectedListDetails.description && (
                            <Box>
                                <Tag size="lg" variant='subtle' colorScheme='gray'>{selectedListDetails.description}</Tag>
                            </Box>
                        )}
                        <Box>
                            <Tag size="lg" variant='subtle' colorScheme='gray'>Birds: {selectedListDetails.birds.length}</Tag>
                        </Box>
                        <Box>
                            <Tag size="lg" variant='subtle' colorScheme='gray'>Created {formattedDateCreated || 'N/A'}</Tag>
                        </Box>
                        {selectedListDetails && selectedListDetails.birds.length > 0 && (
                            <Box>
                                <Tag size="lg" variant='subtle' colorScheme={colorScheme}>{tag}</Tag>
                            </Box>
                        )}
                    </>
                )}
            </Flex>

            {/* Display the selected list's birds or an empty state if there are no birds */}
            {selectedListDetails ? (
                selectedListDetails.birds.length > 0 ? (
                    <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing="20px" mt="20px">
                        {selectedListDetails.birds.map((bird) => (
                            <Card key={bird.docId} borderWidth="1px" variant="outline" borderRadius="lg" overflow="hidden">
                                <AspectRatio ratio={1 / 1.25}>
                                    <Image
                                        src={bird.images && bird.images.length > 0 ? bird.images[0] : 'https://via.placeholder.com/150'}
                                        alt={bird.name}
                                        objectFit="cover"
                                        style={{ borderRadius: '5px 5px 0px 0px' }}
                                    />
                                </AspectRatio>
                                <CardBody p="6">
                                    <Heading id="logo" as="h3" size="md" mb="8px">
                                        {bird.name}
                                    </Heading>
                                    <Tag mt="10px" colorScheme={getColorScheme(bird.status)}>{bird.status || "Conservation Status Unknown"}</Tag>
                                </CardBody>
                                <CardFooter mt="-24px">
                                    <Button
                                        size="lg"
                                        m="1"
                                        variant='outline'
                                        colorScheme='gray'
                                        flex={1}
                                        onClick={() => handleOpenDrawer(bird)}
                                    >
                                        Details
                                    </Button>
                                    <Button
                                        size="lg"
                                        m="1"
                                        variant='outline'
                                        colorScheme='gray'
                                        flex={1}
                                        onClick={() => promptDeleteBird(selectedListId, bird.docId)}>
                                        Remove
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </SimpleGrid>
                ) : (
                    <Flex direction="column" align="center" justify="center" mt="80px" mb="80px">
                        <Flex mb="20px" justifyContent={"center"}>
                            <img src={NoBird} width={"200px"} />
                        </Flex>
                        <Text id="no-list" fontSize="xl" textAlign={'center'}>No birds here. Try adding some!</Text>
                        <Button size="lg" leftIcon={<IoMdAdd />} colorScheme="blue" mt="20px" onClick={onAddBirdsClick}>
                            Add Birds
                        </Button>
                    </Flex>
                )
            ) : (
                <Text fontSize="xl"></Text>
            )}

            <BirdDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                selectedBirdForDetails={selectedBirdForDetails}
                showAddToListButton={false}
            />

            {/* Add List Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} size={{ base: 'sm', md: 'md' }}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>List Details</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <FormControl isRequired>
                            <FormLabel>List Name</FormLabel>
                            <Input value={newListName} onChange={(e) => setNewListName(e.target.value)} placeholder="Enter list name" />
                        </FormControl>
                        <FormControl mt={4}>
                            <FormLabel>Description</FormLabel>
                            <Input value={newListDescription} onChange={(e) => setNewListDescription(e.target.value)} placeholder="Enter list description" />
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={handleAddOrUpdateList}>
                            {isEditMode ? "Update List Details" : "Create New List"}
                        </Button>
                        <Button onClick={() => {
                            setShowModal(false);
                            setIsEditMode(false);
                            setNewListName('');
                            setNewListDescription('');
                        }}>Cancel</Button>
                    </ModalFooter>

                </ModalContent>
            </Modal>

            <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} size={{ base: 'sm', md: 'md' }}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Confirm Deletion</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        Are you sure you want to delete this list? This action cannot be undone.
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="red" mr={3} onClick={deleteList}>
                            Yes, Delete List
                        </Button>
                        <Button variant="ghost" onClick={() => setShowConfirmModal(false)}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            <Modal isOpen={showBirdDeleteConfirmModal} onClose={() => setShowBirdDeleteConfirmModal(false)} size={{ base: 'sm', md: 'md' }}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Confirm Bird Removal</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        Are you sure you want to remove this bird from the list? This action cannot be undone.
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="red" mr={3} onClick={removeBirdFromList}>
                            Remove Bird
                        </Button>
                        <Button variant="ghost" onClick={() => setShowBirdDeleteConfirmModal(false)}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Container>
    );
};

export default Lists;