import React, { useState, useEffect } from 'react';
import { getFirestore, addDoc, collection, query, where, getDocs, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import {
    AspectRatio, Box, Tag, Button, Card, Image, CardBody, CardFooter, SimpleGrid, Container, Heading, Tab, TabList, TabPanel, TabPanels, Tabs,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, Input,
    Select, Flex,
} from '@chakra-ui/react';
import { FaEllipsisV } from 'react-icons/fa';
import { BiTrash } from 'react-icons/bi';

const Lists = ({ user }) => {
    const [lists, setLists] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [newListDescription, setNewListDescription] = useState('');
    const [selectedListId, setSelectedListId] = useState('');

    const fetchBirdsForList = async (listId) => {
        const db = getFirestore();
        const q = query(collection(db, 'lists', listId, 'birds'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    };

    const fetchLists = async () => {
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
                listData.birds = await fetchBirdsForList(listData.id);
                listsData.push(listData);
            }
            setLists(listsData);
            if (listsData.length > 0) {
                setSelectedListId(listsData[0].id); // Select the first list by default
            }
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
        if (!selectedListId) return;

        try {
            const db = getFirestore();
            await deleteDoc(doc(db, 'lists', selectedListId));
            fetchLists(); // Re-fetch lists to update the UI after deletion
        } catch (error) {
            console.error('Error deleting list:', error);
        }
    };

    return (
        <Container maxW="container.xl" mt="40px" mb="40px">
            <Box display="flex" alignItems="center" justifyContent={{ base: 'flex-start', md: 'space-between' }} flexWrap="wrap" mb="20px">
                <Select size="lg" placeholder="Select List" value={selectedListId} style={{ paddingLeft: '10px', paddingRight: '10px' }} onChange={(e) => setSelectedListId(e.target.value)} maxW={{ base: '100%', md: '300px' }} mr={{ base: '0', md: '10px' }} mb={{ base: '10px', md: '0px' }}>
                    {lists.map((list) => (
                        <option key={list.id} value={list.id}>{list.name}</option>
                    ))}
                </Select>
                <Flex flexWrap="wrap" justifyContent={{ base: 'flex-start', md: 'flex-start' }}>
                    <Button size="lg" px="20px" mb={{ base: '10px', md: '0px' }} marginRight={{ base: '5px', md: '10px' }} onClick={() => setShowModal(true)}>Add New List</Button>
                    <Button size="lg" px="20px" marginLeft={{ base: '5px', md: '10px' }} onClick={handleDeleteList}>Delete List</Button>
                </Flex>
            </Box>

            <Tabs variant='soft-rounded' colorScheme='green' size='md'>
                <TabPanels>
                    {lists.map((list) => (
                        <TabPanel key={list.id}>
                            <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing="40px" mt="40px">
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
                                            {/* <p>Family: {bird.family}</p>
                                            <p>Order: {bird.order}</p>
                                            <p>Status: {bird.status}</p>
                                            {/* Add other relevant bird properties */}
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
                        </TabPanel>
                    ))}
                </TabPanels>
            </Tabs>

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