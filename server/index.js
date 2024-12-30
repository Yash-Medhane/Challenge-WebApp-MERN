const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const http = require('http');
const { Server } = require('socket.io');
const nodemailer = require('nodemailer');
const userRoutes = require('./routes/userRoute');

// Load environment variables
dotenv.config();
const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors({
    origin: ["http://localhost:5173", "http://192.168.37.86:5173"], // Allow multiple origins
    methods: ["GET", "POST","PUT","DELETE"],
    credentials: true
}));
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
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL,
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
        origin: ["http://localhost:5173", "http://192.168.37.86:5173"], // Allow both origins
        methods: ["GET", "POST","PUT","DELETE"],
        credentials: true
    },
});


// WebSocket connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Joining rooms for private communication
    socket.on('joinRoom', ({ userId, partnerId }) => {
        const roomId = [userId, partnerId].sort().join('-');
        socket.join(roomId);
        console.log(`User ${socket.id} joined room: ${roomId}`);
        
        // Notify the user that they successfully joined the room
        socket.emit('roomJoined', { roomId });
    });

    // Handling new messages in rooms
    socket.on('newMessage', ({ roomId, message }) => {
        console.log(`New message in room ${roomId}:`, message);

        // Broadcast the message to all clients in the room
        io.to(roomId).emit('messageReceived', { roomId, message });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Start the server
server.listen(PORT,() => {
    console.log(`Server running at http://localhost:${PORT}`);
});
