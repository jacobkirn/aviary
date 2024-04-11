import React from 'react';
import {
    Box, Image, Heading, Stack, Tag, Card, CardBody, CardFooter, Button, AspectRatio
} from '@chakra-ui/react';

const getColorScheme = (status) => {
    switch (status) {
        case 'Low Concern': return 'green';
        case 'Common Bird in Steep Decline': return 'orange';
        case 'Declining': return 'yellow';
        case 'Red Watch List': return 'red';
        default: return 'gray';
    }
};

const BirdCard = ({ bird, onDetailsClick, onAddClick }) => (
    <Box>
        <Card variant={'outline'}>
            <AspectRatio ratio={1 / 1.1}>
                <Image
                    src={bird.images && bird.images.length > 0 ? bird.images[0] : 'https://via.placeholder.com/150'}
                    alt={bird.name}
                    objectFit="cover"
                    style={{ borderRadius: '5px 5px 0px 0px' }}
                />
            </AspectRatio>
            <CardBody p="6">
                <Stack align="start" spacing="2">
                    <Heading id="logo" as="h3" size="md" p="0">
                        {bird.name}
                    </Heading>
                    <Tag mt="10px" colorScheme={getColorScheme(bird.status)}>
                        {bird.status || "Conservation Status Unknown"}
                    </Tag>
                </Stack>
            </CardBody>
            <CardFooter gap="10px" mt="-24px">
                <Button m="1" size="lg" variant='outline' colorScheme='gray' flex={1} onClick={() => onDetailsClick(bird)}>
                    Details
                </Button>
                <Button m="1" size="lg" variant='outline' colorScheme='gray' flex={1} onClick={() => onAddClick(bird)}>
                    Add
                </Button>
            </CardFooter>
        </Card>
    </Box>
);

export default BirdCard;