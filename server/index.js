const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const http = require('http'); // Import HTTP module
const { Server } = require('socket.io'); // Import Socket.IO
const nodemailer = require('nodemailer'); // Import nodemailer
const userRoutes = require('./routes/userRoute'); // Import user routes

// Load environment variables
dotenv.config();
const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());

// Email sending route
app.post('/send', async (req, res) => {
    const { email, message, category } = req.body;

    if (!email || !message || !category) {
        return res.status(400).send('Email, message, and category are required.');
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER, // Sender email address
            to: process.env.EMAIL,        // Recipient email address (website owner)
            subject: '✨ New Website Contact Inquiry Received!',
            text: `
                📬 New Inquiry Details

                🧑‍💻 Sender Information:
                - Email: ${email}
                - Type of Message: ${category}

                📝 Message Content:
                ---------------------------------------------------
                "${message}"
                ---------------------------------------------------

                📅 Received On: ${new Date().toLocaleString()}
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
        res.status(200).send('Email sent successfully.');
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).send(`Error sending email: ${error.message}`);
    }
});

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
    },
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
    },
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

// Test route
app.get('/test', (req, res) => {
    res.send("Backend is accessible");
});

// User routes
app.use('/', userRoutes);

// Create HTTP server and initialize Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Adjust this based on your frontend domain
    },
});

// Rooms object to manage game states
const rooms = {}; // Initialize rooms object

// WebSocket connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('joinRoom', ({ userId, partnerId }) => {
        const roomId = `${userId}-${partnerId}`; // Create a unique room ID
        socket.join(roomId);
        console.log(`User ${socket.id} joined room: ${roomId}`);
    });

    socket.on('makeMove', ({ roomId, index }) => {
        const room = rooms[roomId];
        if (room && room.board[index] === null) {
            room.board[index] = room.currentPlayer;
            room.currentPlayer = room.currentPlayer === 'X' ? 'O' : 'X';
            io.to(roomId).emit('gameUpdate', room);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
