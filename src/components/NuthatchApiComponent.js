import React, { useState, useEffect } from 'react';
import {
    Container,
    SimpleGrid,
    Box,
    Text,
    Card,
    CardBody,
    CardFooter,
    Image,
    Stack,
    Heading,
    Divider,
    ButtonGroup,
    Button
} from '@chakra-ui/react';
import axios from 'axios';

const NuthatchApiComponent = () => {
    const [birds, setBirds] = useState([]);
    const apiKey = '7d077ea8-7b2e-4a97-abee-a56aaf551f2a';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('https://nuthatch.lastelm.software/v2/birds?page=1&pageSize=3&hasImg=true', {
                    headers: {
                        'api-key': apiKey
                    }
                });
                setBirds(response.data.entities);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div>
            <Container maxW="8xl" mt="40px" mb="40px;">
                <SimpleGrid columns={3} minChildWidth='400px' spacing='40px'>
                    {birds.map((bird, index) => (
                        <Box key={index}>
                            <Card variant={'outline'}>
                                <CardBody>
                                    <Image
                                        src={bird.images[0]}
                                        alt={bird.name}
                                        borderRadius='lg'
                                        objectFit='cover'
                                        objectPosition='center'
                                        w='100%'
                                        h='300px'
                                    />
                                    <Stack mt='6' spacing='3'>
                                        <Heading size='md'>{bird.name}</Heading>
                                        <Text>{bird.order}</Text>
                                    </Stack>
                                </CardBody>
                                <Divider />
                                <CardFooter>
                                    <ButtonGroup spacing='2'>
                                        <Button variant='solid' colorScheme='blue'>
                                            Buy now
                                        </Button>
                                        <Button variant='ghost' colorScheme='blue'>
                                            Add to cart
                                        </Button>
                                    </ButtonGroup>
                                </CardFooter>
                            </Card>
                        </Box>
                    ))}
                </SimpleGrid>
            </Container>
        </div>
    );
};

export default NuthatchApiComponent;