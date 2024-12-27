import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { FaUserCircle } from 'react-icons/fa';

const ChatApp = ({ userId }) => {
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState(() => {
        const savedMessages = localStorage.getItem('chatMessages');
        return savedMessages ? JSON.parse(savedMessages) : [];
    });
    const [message, setMessage] = useState('');
    const [userData, setUserData] = useState(null);
    const [partnerId, setPartnerId] = useState(null);
    const [partnerName, setPartnerName] = useState('Partner');
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        // Fetch user data and partner ID
        const fetchUserData = async () => {
            try {
                const response = await axios.get(`http://192.168.37.86:5000/dashboard/${userId}/chat/get`);
                setUserData(response.data);
                if (response.data) {
                    setPartnerId(response.data.partnerUserId);
                }
            } catch (error) {
                console.error("Error fetching user data: ", error);
            }
        };

        fetchUserData();
    }, [userId]);

    useEffect(() => {
        // Fetch partner's name when partnerId is updated
        const fetchPartnerName = async () => {
            if (!partnerId) return;
            try {
                const response = await axios.get(`http://192.168.37.86:5000/dashboard/${partnerId}/chat/get`);
                setPartnerName(response.data.username || 'Partner');
            } catch (error) {
                console.error("Error fetching partner data: ", error);
            }
        };

        fetchPartnerName();
    }, [partnerId]);

    useEffect(() => {
        const newSocket = io('http://192.168.37.86:5000');
        setSocket(newSocket);

        newSocket.on('connect', () => {
            if (userId && partnerId) {
                newSocket.emit('joinRoom', { userId, partnerId });
            }
        });

        newSocket.on('receiveMessage', (messageData) => {
            setMessages((prevMessages) => {
                const updatedMessages = [...prevMessages, messageData];
                localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
                return updatedMessages;
            });
        });

        newSocket.on('typing', () => setIsTyping(true));
        newSocket.on('stopTyping', () => setIsTyping(false));

        return () => {
            newSocket.disconnect();
        };
    }, [userId, partnerId]);

    const handleSendMessage = (e) => {
        e.preventDefault();

        if (message.trim() && partnerId) {
            const messageData = {
                senderId: userId,
                receiverId: partnerId,
                text: message,
            };
            socket.emit('sendMessage', messageData);
            setMessages((prevMessages) => {
                const updatedMessages = [...prevMessages, messageData];
                localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
                return updatedMessages;
            });
            setMessage('');
            socket.emit('stopTyping');
        }
    };

    const handleClearChat = () => {
        setMessages([]);
        localStorage.removeItem('chatMessages');
    };

    return (
        <div className="flex flex-col h-screen max-w-lg mx-auto bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg shadow-lg overflow-hidden">
            {/* Header Section */}
            <div className="flex items-center justify-between bg-gray-800 p-4 text-white shadow-md">
                <div className="flex items-center space-x-2">
                    {/* Human Icon */}
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
                                msg.senderId === userId ? 'bg-green-500 text-white self-end' : 'bg-gray-700 text-white self-start'
                            }`}
                        >
                            <p>{msg.text}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Input Section */}
            <form onSubmit={handleSendMessage} className="flex items-center p-4 border-t border-gray-700 bg-gray-800">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
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
