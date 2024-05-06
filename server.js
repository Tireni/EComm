const express = require('express');
const app = express();
const http = require('http').Server(app);

const io = require('socket.io')(http, {
    cors: {
        origin: '*',
    }
});

// Keep track of connected clients and online users
const clients = {};
let onlineUsers = [];

// Listen for connection events
io.on('connection', (socket) => {
    console.log('A user connected');

    // Assign a unique ID to the client
    const clientId = socket.handshake.query.clientId;
    console.log('Client ID from URL:', clientId);

    // Set the client ID to the socket
    socket.clientId = clientId;
    clients[clientId] = socket;

    // Add the user to the list of online users
    onlineUsers.push(clientId);

    // Emit the list of online users to all clients
    io.emit('online_users', onlineUsers);

    socket.on('set_client_id', (clientId) => {
        console.log('Client ID set:', clientId);
        // Assign the client ID to the socket
        socket.clientId = clientId;
        clients[clientId] = socket;
    });


    // Listen for voice messages
   // Listen for voice messages
socket.on('voice_message', (data) => {
    const recipientSocket = clients[data.recipientId];
    if (recipientSocket) {
        recipientSocket.emit('voice_message', data.audioData);
        console.log('Sent the audio to: '+ data.recipientId);
    } else {
        console.log('Recipient user not found or not connected: '+ data.recipientId);
    }
});


    // Listen for disconnection events
    socket.on('disconnect', () => {
        console.log('A user disconnected');
        // Remove the user from the list of online users
        onlineUsers = onlineUsers.filter(userId => userId !== clientId);
        // Emit the updated list of online users to all clients
        io.emit('online_users', onlineUsers);
        // Remove the client from the clients object
        delete clients[socket.clientId];
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
