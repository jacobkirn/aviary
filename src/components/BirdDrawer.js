import React from 'react';
import {
    Button, Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerContent,
    DrawerCloseButton, Image, Text, Heading, Flex
} from '@chakra-ui/react';
import { FaGoogle } from 'react-icons/fa';

const BirdDrawer = ({ isOpen, onClose, selectedBirdForDetails, onAddToListClick, showAddToListButton }) => {
    const displayValueOrPlaceholder = (value, placeholder = "No Data Available") =>
        value ? value : placeholder;

    const handleGoogleImageSearch = () => {
        const query = encodeURIComponent(selectedBirdForDetails.name);
        const url = `https://www.google.com/search?tbm=isch&q=${query}`;
        window.open(url, '_blank');
    };

    return (
        <Drawer isOpen={isOpen} placement="right" onClose={onClose} size={{ base: 'sm', md: 'md' }}>
            <DrawerOverlay />
            <DrawerContent>
                <DrawerCloseButton m={3} />
                <DrawerHeader mt={1.5}>Bird Details</DrawerHeader>
                <DrawerBody>
                    {selectedBirdForDetails ? (
                        <>
                            <Image
                                src={selectedBirdForDetails.images && selectedBirdForDetails.images.length > 0 ? selectedBirdForDetails.images[0] : 'https://via.placeholder.com/150'}
                                alt={displayValueOrPlaceholder(selectedBirdForDetails.name)}
                                objectFit="cover"
                                borderRadius="lg"
                                mb="0px"
                                h="500"
                                w="100%"
                            />
                            <Button leftIcon={<FaGoogle />}
                                bg="#eeeeee"
                                color="#000000"
                                _hover={{ bg: '#bbbbbb' }}
                                _active={{
                                    bg: '#aaaaaa',
                                }}
                                size="lg"
                                width="full"
                                mt="-76px"
                                borderRadius={'0px 0px 6px 6px'}
                                onClick={handleGoogleImageSearch}>
                                Search Google Images
                            </Button>
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
                {showAddToListButton && (
                    <DrawerFooter>
                        <Flex width="full">
                            <Button
                                size="lg"
                                colorScheme='blue'
                                width="full"
                                onClick={() => onAddToListClick()}
                            >
                                Add to List
                            </Button>

                        </Flex>
                    </DrawerFooter>
                )}
            </DrawerContent>
        </Drawer>
    );
};

const TextData = ({ title, data }) => (
    <>
        <Heading as="h4" size="sm">{title}</Heading>
        <Text mb="4">{data}</Text>
    </>
);

export default BirdDrawer;