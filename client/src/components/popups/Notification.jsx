import React, { useEffect, useState } from 'react';
import axios from 'axios';

const NotificationPopup = ({ userId }) => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:5000/dashboard/${userId}/notifications`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setNotifications(response.data);
            } catch (err) {
                console.error("Error fetching notifications:", err);
            }
        };
        fetchNotifications();
    }, [userId]);

    const handleAccept = async (notificationId, partnerId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `http://localhost:5000/dashboard/${userId}/partner/accept`,
                { notificationId, userId, partnerId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNotifications((prev) => prev.filter((notification) => notification.notificationId !== notificationId));
            alert(response.data.message || "Request accepted successfully!");
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Error accepting request.";
            alert(errorMessage);
            console.error("Error accepting request:", errorMessage);
        }
    };

    const handleDelete = async (notificationId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`http://localhost:5000/notifications/${notificationId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications((prev) => prev.filter((notification) => notification.notificationId !== notificationId));
            alert(response.data.message || "Notification deleted successfully!");
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Error deleting notification.";
            alert(errorMessage);
            console.error("Error deleting notification:", errorMessage);
        }
    };

    return (
        <div className={`absolute z-50 right-0 top-8 bg-white text-black p-4 w-80 rounded-lg shadow-lg transition-all duration-300 ease-in-out ${notifications.length ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
            <h3 className="text-xl font-semibold mb-3">Notifications</h3>
            {notifications.length ? (
                notifications.map((notification) => (
                    <div key={notification.notificationId} className="flex items-center justify-between bg-gray-100 p-2 rounded-md mb-2">
                        <p className="flex-1">{notification.message}</p>
                        {notification.type === "partner_request" && (
                            <button
                                onClick={() => handleAccept(notification._id, notification.senderId)}
                                className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition duration-200"
                            >
                                Accept
                            </button>
                        )}
                        <button
                            onClick={() => handleDelete(notification.notificationId)}
                            className="text-red-500 ml-2 hover:text-red-700 transition duration-200"
                        >
                            X
                        </button>
                    </div>
                ))
            ) : (
                <p className="text-gray-500">No notifications</p>
            )}
        </div>
    );
};

export default NotificationPopup;
