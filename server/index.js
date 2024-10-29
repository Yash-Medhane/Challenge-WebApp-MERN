const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const http = require('http'); // Import HTTP module
const { Server } = require('socket.io'); // Import Socket.IO
const userRoutes = require('./routes/userRoute');

// Load environment variables
dotenv.config();
const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/challengeApp';
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.log('MongoDB connection error:', err));

// Set up storage for multer
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to avoid filename collisions
    }
});

// Initialize multer for file upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // Limit size to 10MB (adjust as needed)
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/; // Allowed file types
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Invalid file type! Only images and documents are allowed.'));
        }
    }
});

// Image upload route
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    res.status(200).json({ filePath: `/uploads/${req.file.filename}` });
});

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// User routes
app.use('/', userRoutes);

// Create HTTP server and initialize Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Adjust this based on your frontend domain
    },
});

// WebSocket connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join chat room
    socket.on('joinRoom', ({ userId, partnerId }) => {
        socket.join(userId);
        socket.join(partnerId);
    });

    // Listen for sending messages
    socket.on('sendMessage', (messageData) => {
        // Broadcast the message to the partner
        io.to(messageData.receiverId).emit('receiveMessage', messageData);
    });

    // Listen for sending files
    socket.on('sendFile', (fileData) => {
        // Broadcast the file data to the partner
        io.to(fileData.receiverId).emit('receiveFile', fileData);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server running at ${PORT}`);
});
