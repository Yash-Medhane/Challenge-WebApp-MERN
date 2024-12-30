import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ChatApp = ({ userId }) => {
    const navigate = useNavigate();
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState(() => {
        try {
            const savedMessages = localStorage.getItem('chatMessages');
            return savedMessages ? JSON.parse(savedMessages) : [];
        } catch {
            return [];
        }
    });
    const [message, setMessage] = useState('');
    const [userData, setUserData] = useState(null);
    const [partnerId, setPartnerId] = useState(null);
    const [partnerName, setPartnerName] = useState('Me');
    const [isTyping, setIsTyping] = useState(false);

    // Fetch user data and partner ID
    useEffect(() => {
        if (!userId) return;

        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error("Token not found");

                const response = await axios.get(`http://192.168.37.86:5000/dashboard/${userId}/chat/get`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setUserData(response.data);
                setPartnerId(response.data.partnerUserId);
                setPartnerName(response.data.partnerUserName || 'Me');
            } catch (err) {
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    navigate('/');
                }
                console.error("Error fetching user data:", err);
            }
        };

        fetchUserData();
    }, [userId, navigate]);

    // Initialize and handle socket connection
    useEffect(() => {
        if (!userId || !partnerId) return;

        const newSocket = io('http://192.168.37.86:5000');
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log("Socket connected:", newSocket.id);
            newSocket.emit('joinRoom', { userId, partnerId });
        });

        newSocket.on('messageReceived', ({ roomId, message }) => {
            console.log('check 1');
            console.log(`Message received in room ${roomId}:`, message);
            setMessages((prevMessages) => {
                console.log('check 2');
                const updatedMessages = [...prevMessages, message];
                localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
                return updatedMessages;
            });
        });

        newSocket.on('typing', () => setIsTyping(true));
        newSocket.on('stopTyping', () => setIsTyping(false));

        newSocket.on('connect_error', (err) => {
            console.error('Socket connection error:', err);
        });

        return () => {
            newSocket.disconnect();
        };
    }, [userId, partnerId,isTyping]);

    // Handle sending a message
    const handleSendMessage = (e) => {
        e.preventDefault();

        if (message.trim() && partnerId) {
            const messageData = {
                senderId: userId,
                receiverId: partnerId,
                text: message,
            };
            const sortedRoomId = [userId, partnerId].sort().join('-');
            socket.emit('newMessage', { roomId: sortedRoomId, message: messageData });


            setMessage('');
        }
    };

    // Handle clearing chat messages
    const handleClearChat = () => {
        setMessages([]);
        localStorage.removeItem('chatMessages');
    };

    return (
        <div className="flex flex-col h-screen max-w-lg mx-auto bg-gradient-to-br rounded-lg shadow-lg overflow-hidden">
            {/* Header Section */}
            <div className="flex items-center justify-between bg-gray-800 p-4 text-white shadow-md">
                <div className="flex items-center space-x-2">
                    <FaUserCircle className="text-blue-400 text-4xl" />
                    <h2 className="font-bold">{partnerName}</h2>
                </div>
                <button
                    onClick={handleClearChat}
                    className="bg-red-600 text-white px-3 py-2 rounded-md shadow-md hover:bg-red-700 transition duration-200"
                >
                    Clear
                </button>
            </div>

            {/* Messages Section */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-900">
                <div className="flex flex-col space-y-4">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`p-3 rounded-lg text-sm ${
                                msg.senderId === userId
                                    ? 'bg-green-500 text-white self-end'
                                    : 'bg-gray-700 text-white self-start'
                            }`}
                        >
                            <p>{msg.text}</p>
                        </div>
                    ))}
                </div>
                {isTyping && <p className="text-gray-400 italic">Partner is typing...</p>}
            </div>

            {/* Input Section */}
            <form onSubmit={handleSendMessage} className="flex items-center p-4 border-t border-gray-700 bg-gray-800">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={() => socket.emit('typing')}
                    onBlur={() => socket.emit('stopTyping')}
                    placeholder="Type a message..."
                    className="flex-1 p-3 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded-md ml-2 hover:bg-green-700 transition duration-200 transform hover:scale-105"
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default ChatApp;
