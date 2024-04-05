import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { Box, Button, Card, CardBody, CardFooter, Container, Stack, SimpleGrid, Heading, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, Input, IconButton, Menu, MenuButton, MenuList, MenuItem, Icon } from '@chakra-ui/react';
import { FaEllipsisV } from 'react-icons/fa';
import { BiTrash } from 'react-icons/bi';

const Lists = ({ user }) => {
    const [lists, setLists] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [newListDescription, setNewListDescription] = useState('');
    const [selectedListId, setSelectedListId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const fetchLists = async () => {
        if (!user) return;

        const db = getFirestore();
        try {
            const q = query(collection(db, 'lists'), where('createdBy', '==', user.uid));
            const querySnapshot = await getDocs(q);
            const listsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setLists(listsData);
        } catch (error) {
            console.error('Error fetching lists:', error);
        }
    };

    useEffect(() => {
        fetchLists();
    }, [user]);

    const handleAddList = async () => {
        try {
            const db = getFirestore();
            await addDoc(collection(db, 'lists'), {
                name: newListName,
                description: newListDescription,
                createdBy: user.uid,
                createdAt: serverTimestamp(),
            });
            fetchLists(); // Re-fetch lists to see the new list
            setShowModal(false); // Close the modal after adding
            setNewListName(''); // Reset form fields
            setNewListDescription('');
        } catch (error) {
            console.error('Error adding list:', error);
        }
    };

    const handleDeleteList = async () => {
        try {
            const db = getFirestore();
            await deleteDoc(doc(db, 'lists', selectedListId));
            fetchLists(); // Re-fetch lists to update the UI after deletion
        } catch (error) {
            console.error('Error deleting list:', error);
        } finally {
            setSelectedListId(null); // Reset selected list ID after deletion
            setShowDeleteModal(false); // Close the delete confirmation modal
        }
    };

    const openDeleteConfirmation = (listId) => {
        setSelectedListId(listId);
        setShowDeleteModal(true);
    };

    return (
        <Container maxW="container.xl">
            <Button mt="40px" mb="40px" colorScheme="blue" onClick={() => setShowModal(true)} px={5} py={2}>Add New List</Button>
            <SimpleGrid spacing="40px" columns={{ base: 1, md: 2, xl: 3 }}>
                {lists.map(list => (
                    <Card key={list.id} variant={'outline'}>
                        <CardBody p="6">
                            <Stack align="start" spacing="2">
                                <Heading as="h3" size="md" id="logo">{list.name}</Heading>
                                <p>{list.description}</p>
                                <p>Created: {list.createdAt ? new Date(list.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown'}</p>
                            </Stack>
                        </CardBody>
                        <CardFooter mt="-20px" gap="10px">
                            <Button flex={1} variant='outline' size="sm" colorScheme="blue">View List</Button>
                            <Menu placement="bottom-start">
                                <MenuButton as={IconButton} aria-label="Options" icon={<FaEllipsisV transform="rotate(90)" />} colorScheme="gray" variant={'ghost'} size="sm" />
                                <MenuList>
                                    <MenuItem onClick={() => openDeleteConfirmation(list.id)} color="red.500">
                                        <Icon as={BiTrash} mr={2} /> Delete
                                    </MenuItem>
                                </MenuList>
                            </Menu>
                        </CardFooter>
                    </Card>
                ))}
            </SimpleGrid>
            {/* Modal for adding new list */}
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
                        <FormControl mt="4">
                            <FormLabel>List Description</FormLabel>
                            <Input value={newListDescription} onChange={(e) => setNewListDescription(e.target.value)} />
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" onClick={handleAddList}>Add</Button>
                        <Button colorScheme="gray" ml={3} onClick={() => setShowModal(false)}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            {/* Modal for delete confirmation */}
            <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Delete List</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl>
                            <FormLabel>Are you sure you want to delete this list?</FormLabel>
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="red" onClick={handleDeleteList}>Yes, Delete</Button>
                        <Button colorScheme="gray" ml={3} onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Container>
    );
};

export default Lists;