import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button, Card, CardBody, CardFooter, Container, Stack, SimpleGrid, Tag, Heading, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, Input } from '@chakra-ui/react';

const Lists = ({ user }) => {
    const [lists, setLists] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [newListDescription, setNewListDescription] = useState('');

    useEffect(() => {
        const fetchLists = async () => {
            if (!user) return; // Exit early if user is not logged in
        
            try {
                const db = getFirestore();
                const q = query(collection(db, 'lists'), where('createdBy', '==', user.uid));
                const querySnapshot = await getDocs(q);
                const listsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                // Calculate the bird count for each list
                const listsWithBirdCount = await Promise.all(listsData.map(async (list) => {
                    const listRef = doc(db, 'lists', list.id);
                    const birdQuerySnapshot = await getDocs(collection(listRef, 'birds'));
                    const birdCount = birdQuerySnapshot.size;
                    return { ...list, birdCount };
                }));
        
                setLists(listsWithBirdCount);
            } catch (error) {
                console.error('Error fetching lists:', error);
            }
        };

        fetchLists(); // Call fetchLists when the component mounts or when user changes
    }, [user]);

    const handleAddList = async () => {
        try {
            const db = getFirestore();
            const newListRef = await addDoc(collection(db, 'lists'), {
                name: newListName,
                description: newListDescription,
                createdBy: user.uid,
                createdAt: serverTimestamp(),
            });
            const newListData = {
                id: newListRef.id,
                name: newListName,
                description: newListDescription,
                birdCount: 0, // Assuming new list has no birds initially
                createdAt: new Date()
            };
            setLists(prevLists => [...prevLists, newListData]);
            setNewListName('');
            setNewListDescription('');
            setShowModal(false);
        } catch (error) {
            console.error('Error adding list:', error);
        }
    };

    const handleDeleteList = async (listId) => {
        try {
            const db = getFirestore();
            await deleteDoc(doc(db, 'lists', listId));
            setLists(prevLists => prevLists.filter(list => list.id !== listId));
        } catch (error) {
            console.error('Error deleting list:', error);
        }
    };

    return (
        <Container maxW="container.xl">
            <Button mt="40px" mb="40px" colorScheme="blue" onClick={() => setShowModal(true)} px={5} py={2}>Add New List</Button>
            <SimpleGrid columns={3} spacing={6}>
                {lists.map(list => (
                    <Card key={list.id} variant={'outline'} maxWidth="400px">
                        <CardBody p="6">
                            <Stack align="start" spacing="2">
                                <Heading id="logo" as="h3" size="md" p="0">{list.name}</Heading>
                                <p>{list.description}</p>
                                <Tag colorScheme="blue">Birds: {list.birdCount}</Tag>
                                <p>Created: {list.createdAt instanceof Date ? list.createdAt.toLocaleDateString() : 'Unknown'}</p>
                            </Stack>
                        </CardBody>
                        <CardFooter>
                            <Button variant='outline' size="sm" colorScheme="red" onClick={() => handleDeleteList(list.id)}>Delete</Button>
                            <Button variant='outline' size="sm" colorScheme="blue" ml="2">View List</Button>
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
        </Container>
    );
};

export default Lists;