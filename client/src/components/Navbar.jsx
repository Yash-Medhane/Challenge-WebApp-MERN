import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NotificationPopup from './popups/Notification';
import { FaBell } from 'react-icons/fa';
import logo from '../assets/high-five.png';
import coinsBag from '../assets/money-bag.png'
import { useNavigate } from 'react-router-dom';


const Navbar = ({ userId }) => {
    const navigate = useNavigate();
    const [notificationCount, setNotificationCount] = useState(0);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [coins, setCoins] = useState(0);

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
                setCoins(res.data.coins || 0);
                
            } catch (err) {
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    navigate('/'); 
                }
                console.error("Error fetching notification count:", err);
            }
        };
    
        fetchNotificationCount();
        
    }, [userId]);
    

    const togglePopup = () => setIsPopupVisible(!isPopupVisible);

    return (
        <nav className="flex items-center justify-between p-4 bg-blue-600 text-white relative">
    <div className="flex items-center gap-4 text-2xl font-bold lg:mx-16">
        <img src={logo} alt="logo" className="lg:w-10 lg:mx-4 lg:h-10 lg:block w-8 h-8" />
        <p className='text-3xl lg:text-4xl'>Taskify</p>
    </div>

    <div className="flex items-center gap-6">
        {/* Coins */}
        <div className="flex items-center gap-2 lg:relative lg:right-24">
            <img src={coinsBag} alt="coins" className="w-9 h-9" />
            <span className="text-2xl font-sans font-bold">{coins}</span>
        </div>

        <div className="relative lg:right-14">
            <button onClick={togglePopup} className="relative top-1.5">
                <FaBell size={30} />
                {notificationCount !== undefined && notificationCount >= 0 && (
                    <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold rounded-full px-2">
                        {notificationCount}
                    </span>
                )}
            </button>
            {isPopupVisible && <NotificationPopup userId={userId} />}
        </div>
    </div>
</nav>
    );
};

export default Navbar;
