import React, { useState, useEffect } from 'react';
import { getFirestore, addDoc, collection, query, where, getDocs, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import {
    AspectRatio, Box, Tag, Button, Card, Image, CardBody, CardFooter, SimpleGrid, Container, Heading, Text,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, Input,
    Select, Flex, useToast
} from '@chakra-ui/react';
import { FaPlus } from 'react-icons/fa';
import { BiTrash } from "react-icons/bi";
import { IoMdAdd } from "react-icons/io"; // Corrected import
import NoList from '../images/no-list.png';


const Lists = ({ user, refreshLists }) => {
    const [lists, setLists] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [newListDescription, setNewListDescription] = useState('');
    const [selectedListId, setSelectedListId] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [listToDelete, setListToDelete] = useState(null);
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
                listData.birds = birdsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                listsData.push(listData);
            }
            setLists(listsData);
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
                isClosable: true,
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
                isClosable: true,
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
                title: "List deleted successfully.",
                status: "info",
                duration: 5000,
                isClosable: true,
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
                isClosable: true,
            });
            // Reset state on error too
            setListToDelete(null);
            setShowConfirmModal(false);
        }
    };

    if (lists.length === 0) {
        return (
            <Container maxW="container.xl" mt="40px" mb="40px" textAlign="center">
                <Flex justifyContent={"center"}>
                    <img src={NoList} width={"400px"} />
                </Flex>
                <Text fontSize="xl" mb="4">You currently have no lists.</Text>
                <Button leftIcon={<IoMdAdd />} colorScheme="blue" mt="20px" px="20px" onClick={() => setShowModal(true)}>
                    Create New List
                </Button>

                <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Create New List</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody pb={6}>
                            <FormControl>
                                <FormLabel>List Name</FormLabel>
                                <Input value={newListName} onChange={(e) => setNewListName(e.target.value)} />
                            </FormControl>
                            <FormControl mt={4}>
                                <FormLabel>Description (optional)</FormLabel>
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
                    placeholder='Select a list'
                    onChange={(e) => setSelectedListId(e.target.value)}
                    maxW={{ base: '100%', md: '300px' }}
                    mr={{ base: '0', md: '20px' }}
                    mb={{ base: '0px', md: '0px' }}
                >
                    {lists.map((list) => (
                        <option key={list.id} value={list.id}>{list.name}</option>
                    ))}
                </Select>
                {/* Ensure the Buttons are in a Flex container with margin to control spacing */}
                <Flex alignItems="center" flexWrap="wrap">
                    <Button
                        leftIcon={<BiTrash />}
                        onClick={() => promptDeleteList(selectedListId)}
                        mt={{ base: '20px', md: '0px' }}
                        mr={{ base: '10px', md: '20px' }}
                        mb={{ base: '0px', md: '0px' }}
                        size="lg"
                        px="20px"
                    >
                        Delete List
                    </Button>

                    <Button
                        leftIcon={<IoMdAdd />}
                        size="lg"
                        px="20px"
                        mt={{ base: '20px', md: '0px' }}
                        mb={{ base: '0px', md: '0px' }}
                        onClick={() => setShowModal(true)}
                    >
                        Add New List
                    </Button>
                </Flex>
            </Box>

            {lists.map((list) => (
                <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing="20px" mt="40px">
                    {list.birds && list.birds.length > 0 && list.birds.map((bird) => (
                        <Card key={bird.id} borderWidth="1px" variant="outline" borderRadius="lg" overflow="hidden">
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
                                <Button variant='outline' colorScheme='gray' flex={1}>
                                    Details
                                </Button>
                                <Button variant='outline' colorScheme='gray' flex={1}>Remove</Button>
                            </CardFooter>
                        </Card>
                    ))}
                </SimpleGrid>
            ))}

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