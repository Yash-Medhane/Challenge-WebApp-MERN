import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NotificationPopup from './popups/Notification';
import { FaBell } from 'react-icons/fa';
import logo from '../assets/high-five.png';
import { FaUserCircle } from 'react-icons/fa';

const Navbar = ({ userId }) => {
    const [notificationCount, setNotificationCount] = useState(0);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [user, setUser] = useState(null);
    const [name, setName] = useState('');

    useEffect(() => {
        const fetchNotificationCount = async () => {
            try {
                const token = localStorage.getItem('token');
                console.log("Token:", token);
                const response = await axios.get(`http://192.168.37.86:5000/dashboard/${userId}/notifications/count`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setNotificationCount(response.data.count || 0);
                const res = await axios.get(`http://192.168.37.86:5000/dashboard/${userId}/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log("hiii");
                setUser(res.data);
                console.log(name);
                
            } catch (error) {
                console.error("Error fetching notification count:", error);
            }
        };
    
        fetchNotificationCount();
        
    }, [userId]);
    

    const togglePopup = () => setIsPopupVisible(!isPopupVisible);

    return (
        <nav className="flex items-center justify-between p-4 bg-blue-600 text-white relative">
            <div className="flex justify-center gap-4 text-2xl font-bold lg:mx-16">
                <img src={logo} alt="logo" className='w-8 h-8'/>
                <p>Yash Medhane</p>
                </div>
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
