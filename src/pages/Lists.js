import React, { useState, useEffect } from 'react';
import { getFirestore, addDoc, collection, query, where, getDocs, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import {
    AspectRatio, Box, Tag, Button, Card, Image, CardBody, CardFooter, SimpleGrid, Container, Heading, Text,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, Input,
    Select, Flex, useToast, Wrap, WrapItem
} from '@chakra-ui/react';
import { FaPlus } from 'react-icons/fa';
import { BiTrash } from "react-icons/bi";
import { IoMdAdd } from "react-icons/io"; // Corrected import
import NoList from '../images/no-list.png';
import { format } from 'date-fns';
import BirdDrawer from '../components/BirdDrawer';


const Lists = ({ user, refreshLists }) => {
    const [lists, setLists] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [newListDescription, setNewListDescription] = useState('');
    const [selectedListId, setSelectedListId] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [listToDelete, setListToDelete] = useState(null);
    const [showBirdDeleteConfirmModal, setShowBirdDeleteConfirmModal] = useState(false);
    const [birdToDelete, setBirdToDelete] = useState({ listId: '', birdDocId: '' });
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedBirdForDetails, setSelectedBirdForDetails] = useState(null);
    const toast = useToast();

    const fetchListsAndBirds = async () => {
        if (!user) return;

        const db = getFirestore();
        try {
            const q = query(collection(db, 'lists'), where('createdBy', '==', user.uid));
            const querySnapshot = await getDocs(q);
            const listsData = [];
            for (const doc of querySnapshot.docs) {
                const listData = {
                    id: doc.id,
                    ...doc.data(),
                };
                // Fetch birds for each list
                const birdsSnapshot = await getDocs(collection(db, 'lists', doc.id, 'birds'));
                listData.birds = birdsSnapshot.docs.map(birdDoc => ({
                    docId: birdDoc.id, // This is the Firestore document ID.
                    ...birdDoc.data(),
                }));
                listsData.push(listData);
            }
            setLists(listsData);

            if (listsData.length === 1) {
                setSelectedListId(listsData[0].id);
            } else if (listsData.length === 0) {
                setSelectedListId(''); // Clear selection if no lists
            }
        } catch (error) {
            console.error('Error fetching lists:', error);
        }
    };

    useEffect(() => {
        fetchListsAndBirds();
    }, [user, refreshLists]);

    const handleAddList = async () => {
        if (!newListName.trim()) {
            toast({
                title: "List name is required.",
                status: "error",
                duration: 5000,
            });
            return;
        }

        try {
            const db = getFirestore();
            const newListRef = await addDoc(collection(db, 'lists'), {
                name: newListName,
                description: newListDescription,
                createdBy: user.uid,
                createdAt: serverTimestamp(),
            });

            // After successfully creating the list, set its ID as the selected list
            setSelectedListId(newListRef.id);
            toast({
                title: "List created successfully.",
                status: "success",
                duration: 5000,
            });
            setNewListName('');
            setNewListDescription('');
            setShowModal(false);
            fetchListsAndBirds();
        } catch (error) {
            console.error('Error creating new list:', error);
            toast({
                title: "Failed to create list.",
                description: "Unexpected error occurred.",
                status: "error",
                duration: 5000,
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
                title: "List deleted successfully.",
                status: "info",
                duration: 5000,
            });
            // Reset states and fetch updated lists
            setListToDelete(null);
            setShowConfirmModal(false);
            setSelectedListId('');
            fetchListsAndBirds();
        } catch (error) {
            console.error('Error deleting list:', error);
            toast({
                title: "Failed to delete list.",
                description: "Unexpected error occurred.",
                status: "error",
                duration: 5000,
            });
            // Reset state on error too
            setListToDelete(null);
            setShowConfirmModal(false);
        }
    };

    const removeBirdFromList = async () => {
        const { listId, birdDocId } = birdToDelete;
        if (!listId || !birdDocId) return;

        const db = getFirestore();
        const birdDocRef = doc(db, `lists/${listId}/birds/${birdDocId}`);

        try {
            await deleteDoc(birdDocRef);
            console.log("Bird successfully deleted from the list.");
            toast({
                title: "Bird deleted successfully.",
                description: "The bird has been removed from the list.",
                status: "success",
                duration: 5000,
            });
            fetchListsAndBirds(); // Re-fetch to update UI
            setShowBirdDeleteConfirmModal(false); // Close confirmation modal
        } catch (error) {
            console.error("Error removing bird from list:", error);
        }
    };

    const promptDeleteBird = (listId, birdDocId) => {
        setBirdToDelete({ listId, birdDocId });
        setShowBirdDeleteConfirmModal(true);
    };

    const selectedListDetails = lists.find(list => list.id === selectedListId);

    const formattedDateCreated = selectedListDetails ? format(new Date(selectedListDetails.createdAt.seconds * 1000), 'PPP') : '';

    const handleOpenDrawer = (bird) => {
        setSelectedBirdForDetails(bird);
        setIsDrawerOpen(true);
    };


    if (lists.length === 0) {
        return (
            <Container maxW="container.xl" mt="40px" mb="40px" textAlign="center">
                <Flex mb="20px" justifyContent={"center"}>
                    <img src={NoList} width={"300px"} />
                </Flex>
                <Text id="no-list" fontSize="xl" mb="0px">You don't have any lists... yet.</Text>
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
                            <Button colorScheme="blue" mr={3} onClick={handleAddList}>
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
            <Box display="flex" alignItems="center" justifyContent="flex-start" flexWrap="wrap" mb="20px">
                <Select
                    size="lg"
                    style={{ paddingLeft: '10px', paddingRight: '10px' }}
                    value={selectedListId}
                    onChange={(e) => setSelectedListId(e.target.value)}
                    maxW={{ base: '100%', md: '300px' }}
                    mr={{ base: '0', md: '10px' }}
                    mb={{ base: '0px', md: '0px' }}
                >
                    {lists.map((list) => (
                        <option key={list.id} value={list.id}>{list.name}</option>
                    ))}
                </Select>

                <Flex alignItems="center" flexWrap="wrap">
                    {lists.length > 0 && (
                        <Button
                            leftIcon={<BiTrash />}
                            onClick={() => promptDeleteList(selectedListId)}
                            colorScheme='gray'
                            variant={'outline'}
                            size="lg"
                            mr="10px"
                            mt={{ base: '20px', md: '0px' }}
                            mb={{ base: '0px', md: '0px' }}
                        >
                            Delete List
                        </Button>
                    )}

                    <Button
                        leftIcon={<IoMdAdd />}
                        size="lg"
                        colorScheme='gray'
                        variant={'outline'}
                        px="20px"
                        mt={{ base: '20px', md: '0px' }}
                        mb={{ base: '0px', md: '0px' }}
                        onClick={() => setShowModal(true)}
                    >
                        Add New List
                    </Button>
                </Flex>
            </Box>

            <Flex alignItems="center" flexWrap="wrap" gap="10px" mt="40px">
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
                    </>
                )}
            </Flex>

            {lists.map((list) => (
                <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing="20px" mt="40px">
                    {list.birds && list.birds.length > 0 && list.birds.map((bird) => (
                        <Card key={bird.docId} borderWidth="1px" variant="outline" borderRadius="lg" overflow="hidden">
                            <AspectRatio ratio={1 / 1.1}>
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
                            <CardFooter gap="10px" mt="-20px">
                                <Button
                                    variant='outline'
                                    colorScheme='gray'
                                    flex={1}
                                    onClick={() => handleOpenDrawer(bird)}
                                >
                                    Details
                                </Button>
                                <Button variant='outline' colorScheme='gray' flex={1} onClick={() => promptDeleteBird(list.id, bird.docId)}>
                                    Remove
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </SimpleGrid>
            ))}

            <BirdDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                selectedBirdForDetails={selectedBirdForDetails}
                showAddToListButton={false}
            />

            {/* Add List Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Add New List</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl>
                            <FormLabel>List Name</FormLabel>
                            <Input value={newListName} onChange={(e) => setNewListName(e.target.value)} />
                        </FormControl>
                        <FormControl mt={4}>
                            <FormLabel>List Description</FormLabel>
                            <Input value={newListDescription} onChange={(e) => setNewListDescription(e.target.value)} />
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={handleAddList}>Add</Button>
                        <Button onClick={() => setShowModal(false)}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)}>
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
            <Modal isOpen={showBirdDeleteConfirmModal} onClose={() => setShowBirdDeleteConfirmModal(false)}>
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