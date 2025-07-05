const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const nodemailer = require('nodemailer');
const userRoutes = require('./routes/userRoute');

// Load environment variables
dotenv.config();
const PORT = process.env.PORT || 5000;

const app = express();

// CORS setup using .env variable
app.use(cors({
    origin: [process.env.CLIENT_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
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
            to: process.env.EMAIL_RECEIVER,
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
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => console.log('❌ MongoDB connection error:', err));

// Test route
app.get('/test', (req, res) => {
    res.send("✅ Backend is accessible");
});

// User routes
app.use('/', userRoutes);

// Create HTTP server and initialize Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: [process.env.CLIENT_URL],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    },
});

// WebSocket connection handling
io.on('connection', (socket) => {
    console.log('🔌 User connected:', socket.id);

    socket.on('joinRoom', ({ userId, partnerId }) => {
        const roomId = [userId, partnerId].sort().join('-');
        socket.join(roomId);
        console.log(`👥 User ${socket.id} joined room: ${roomId}`);
        socket.emit('roomJoined', { roomId });
    });

    socket.on('newMessage', ({ roomId, message }) => {
        console.log(`💬 New message in room ${roomId}:`, message);
        io.to(roomId).emit('messageReceived', { roomId, message });
    });

    socket.on('disconnect', () => {
        console.log('❌ User disconnected:', socket.id);
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});

