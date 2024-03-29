const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const path = require('path');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = 5000;
const mediaFolder = path.join(__dirname, 'uploads');

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('A user connected');
    // Function to preload media files and cache their URLs
    function preloadMedia() {
        fs.readdir(mediaFolder, (err, files) => {
            if (err) {
                console.error('Error reading media directory:', err);
                return;
            }
            const mediaUrls = files.map(file => `/uploads/${file}`);
            console.log('Preloaded media URLs:', mediaUrls);
            io.emit('mediaPreloaded', mediaUrls); // Emit to all connected clients
        });
    }

    // Handle request to preload media files
    socket.on('preloadMedia', preloadMedia);
    
    function emitMessage() {
        const marqueMessage = "PPS INTERNATIONAL AND PT COMMUNICATION"; // Static text
        io.emit('message', marqueMessage);
    }
    // Emit message when a client connects
    emitMessage();

    // // Handle request for a new message
    // socket.on('requestMessage', () => {
    //     emitMessage(); // Emit a new message to start the loop again
    // });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Start the server
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`http://localhost:${port}`);
});