import { io } from 'socket.io-client';
import API_BASE_URL from '../api.config';

// Initialize socket connection
// Using the same base URL as the API
const socket = io(API_BASE_URL, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 5000,
});

socket.on('connect', () => {
    console.log('Connected to real-time safety network');
});

socket.on('disconnect', () => {
    console.log('Disconnected from safety network');
});

export default socket;
