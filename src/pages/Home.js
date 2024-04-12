import React, { useState, useEffect } from 'react';
import {
    Heading,
    Box,
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    VStack,
    Text,
    useColorMode
} from '@chakra-ui/react';
import { Line } from 'react-chartjs-2';
import { getFirestore, query, collection, where, getDocs } from 'firebase/firestore';
import { auth } from '../firebase';
import 'chart.js/auto';

export default function Home({ user }) {
    const firstName = user ? user.displayName.split(' ')[0] : 'Guest';
    

    return (
        <div>
            <Box>
                <Heading mt="40px" mb="20px" id="welcome">Welcome, {firstName}.</Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
                    <Box>

                    </Box>
                    <Box>
                        
                    </Box>
                </SimpleGrid>
            </Box>
        </div>

    );
}