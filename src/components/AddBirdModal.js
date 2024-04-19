import React from 'react';
import {
	Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
	ModalBody, ModalFooter, FormControl, FormLabel, Input, Select,
} from '@chakra-ui/react';

const AddBirdModal = ({
	isOpen,
	onClose,
	lists,
	handleSelectList,
	selectedList,
	selectedBird,
	newListName,
	setNewListName,
	newListDescription,
	setNewListDescription,
	handleCreateListAndAddBird,
	handleAddToList
}) => {
	return (
		<Modal isOpen={isOpen} onClose={onClose} size={{ base: 'sm', md: 'md' }}>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>Add Bird to List</ModalHeader>
				<ModalCloseButton />
				<ModalBody>
					{lists.length > 0 ? (
						<FormControl isRequired>
							<FormLabel>Select a list</FormLabel>
							<Select placeholder="Select list" value={selectedList} onChange={handleSelectList}>
								{lists.map(list => (
									<option key={list.id} value={list.id}>{list.name}</option>
								))}
							</Select>
						</FormControl>
					) : (
						<>
							<FormControl isRequired>
								<FormLabel>List Name</FormLabel>
								<Input value={newListName} onChange={(e) => setNewListName(e.target.value)} />
							</FormControl>
							<FormControl mt={4}>
								<FormLabel>List Description</FormLabel>
								<Input value={newListDescription} onChange={(e) => setNewListDescription(e.target.value)} />
							</FormControl>
						</>
					)}
				</ModalBody>
				<ModalFooter>
					{lists.length > 0 ? (
						<Button colorScheme="blue" onClick={() => handleAddToList()}>Add to List</Button>
					) : (
						<Button colorScheme="blue" onClick={() => handleCreateListAndAddBird(selectedBird)}>Create List & Add Bird</Button>
					)}
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default AddBirdModal;