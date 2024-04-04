import { useState, useEffect } from 'react';
import axios from 'axios';

const useFetchBirds = (searchTerm, triggerSearch) => {
    const [birds, setBirds] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchBirds = async () => {
            if (triggerSearch && searchTerm) {
                setIsLoading(true);
                try {
                    // Adjust URL, headers, and params as necessary based on the API documentation
                    const response = await axios.get(`https://nuthatch.lastelm.software/v2/birds`, {
                        params: {
                            name: searchTerm,
                            hasImg: true,
                            operator: 'AND',
                            pageSize: 30 // Adjust page size as necessary
                        },
                        headers: {
                            'API-Key': '7d077ea8-7b2e-4a97-abee-a56aaf551f2a'
                        }
                    });
                    const processedBirds = response.data.entities.map(bird => ({
                        ...bird,
                        imageUrl: bird.images.length > 0 ? bird.images[0] : null // Assumes images is an array of URLs
                    }));
                    setBirds(processedBirds);
                } catch (error) {
                    console.error("Failed to fetch birds:", error);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchBirds();
    }, [searchTerm, triggerSearch]);

    return { birds, isLoading };
};

export default useFetchBirds;