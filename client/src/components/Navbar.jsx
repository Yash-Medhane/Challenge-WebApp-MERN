import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NotificationPopup from './popups/Notification';
import { FaBell } from 'react-icons/fa';

const Navbar = ({ userId }) => {
    const [notificationCount, setNotificationCount] = useState(0);
    const [isPopupVisible, setIsPopupVisible] = useState(false);

    useEffect(() => {
        const fetchNotificationCount = async () => {
            try {
                const token = localStorage.getItem('token');
                console.log("Token:", token);
                const response = await axios.get(`http://localhost:5000/dashboard/${userId}/notifications/count`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log(response.data); // Log the response
                setNotificationCount(response.data.count || 0);
            } catch (error) {
                console.error("Error fetching notification count:", error);
            }
        };
    
        fetchNotificationCount();
    }, [userId]);
    

    const togglePopup = () => setIsPopupVisible(!isPopupVisible);

    return (
        <nav className="flex items-center justify-between p-4 bg-blue-600 text-white relative">
            <div className="text-2xl font-bold">MyApp</div>
            <div className="relative">
                <button onClick={togglePopup} className="relative">
                    <FaBell size={24} />
                    {notificationCount >= 0 && (
                        <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold rounded-full px-2">
                            {notificationCount}
                        </span>
                    )}
                </button>
                {isPopupVisible && <NotificationPopup userId={userId} />}
            </div>
        </nav>
    );
};

export default Navbar;
