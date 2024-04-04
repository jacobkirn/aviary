import { doc, collection, addDoc, getFirestore, serverTimestamp } from 'firebase/firestore';
import { auth } from './firebase'; // Adjust the path as per your project structure

const db = getFirestore();

export const addBirdToList = async (listId, birdId) => {
    const birdsRef = collection(db, 'lists', listId, 'birds');

    try {
        await addDoc(birdsRef, {
            birdId: birdId,
            addedAt: serverTimestamp(),
        });
        console.log("Bird successfully added to the list.");
    } catch (error) {
        console.error("Error adding bird to the list:", error);
    }
};
