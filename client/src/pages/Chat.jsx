import React, { useEffect, useState } from 'react'; 
import { io } from 'socket.io-client';
import axios from 'axios';

const Chat = ({ userId }) => {
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState(() => {
        // Load messages from local storage if available
        const savedMessages = localStorage.getItem('chatMessages');
        return savedMessages ? JSON.parse(savedMessages) : [];
    });
    const [message, setMessage] = useState('');
    const [userData, setUserData] = useState(null);
    const [partnerId, setPartnerId] = useState(null); // Store partner ID

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/dashboard/${userId}/chat/get`);
                setUserData(response.data);
                if (response.data) {
                    setPartnerId(response.data.partnerUserId); // Set the partner ID
                }
            } catch (error) {
                console.log("Error fetching user data: ", error);
            }
        };

        fetchData();

        const newSocket = io('http://localhost:5000'); // Adjust the URL based on your server
        setSocket(newSocket);

        // Join the chat room
        newSocket.on('connect', () => {
            if (userId && partnerId) {
                newSocket.emit('joinRoom', { userId, partnerId });
            }
        });

        // Listen for incoming messages
        newSocket.on('receiveMessage', (messageData) => {
            if (messageData.senderId !== userId) {
                setMessages((prevMessages) => {
                    const updatedMessages = [...prevMessages, messageData];
                    // Save updated messages to local storage
                    localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
                    return updatedMessages;
                });
            }
        });

        // Cleanup on component unmount
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
                // Save updated messages to local storage
                localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
                return updatedMessages;
            });
            setMessage('');
        }
    };

    const handleClearChat = () => {
        // Clear messages from state and local storage
        setMessages([]);
        localStorage.removeItem('chatMessages');
    };

    return (
        <div className="flex flex-col h-screen max-w-lg mx-auto bg-gradient-to-b from-blue-500 to-purple-500 rounded-lg shadow-xl overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 bg-white rounded-t-lg">
                <div className="flex flex-col space-y-4">
                    {messages.map((msg, index) => (
                        <div 
                            key={index} 
                            className={`p-3 rounded-lg text-sm ${msg.senderId === userId ? 'bg-blue-600 text-white self-end' : 'bg-gray-200 text-black self-start'}`}>
                           
                            <p className="mt-1">{msg.text}</p>
                        </div>
                    ))}
                </div>
            </div>
            <form onSubmit={handleSendMessage} className="flex items-center p-4 border-t border-gray-300 bg-white">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 p-3 border border-gray-300 rounded-md shadow-sm mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                    type="submit" 
                    className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-700 transition duration-200 transform hover:scale-105">
                    Send
                </button>
            </form>
            <button 
                onClick={handleClearChat} 
                className="m-4 bg-red-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-red-700 transition duration-200">
                Clear Chat
            </button>
        </div>
    );
};

export default Chat;
