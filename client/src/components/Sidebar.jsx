import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaBars, FaTimes, FaHome, FaUser, FaCog, FaGamepad, FaComments, FaStore, FaUserFriends } from 'react-icons/fa';

const Sidebar = ({ userId }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="relative">
            {/* Menu button */}
            <button 
                onClick={toggleSidebar} 
                className={`p-3 bg-blue-600 text-white rounded-md focus:outline-none absolute top-4 transition-transform duration-300 hover:scale-90 z-50 ${isOpen ? 'left-64' : 'left-4'}`}
                style={{ transition: 'left 0.3s ease' }} 
            >
                {isOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
            </button>

            {/* Sidebar */}
            <div className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white p-6 transition-transform transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} shadow-lg z-40`}>
                <h2 className="text-lg font-semibold mb-4">Menu</h2>
                <ul className="space-y-6">
                    <li>
                        <NavLink 
                            to={`/dashboard/${userId}`}
                            className="flex items-center hover:text-blue-400 transition duration-200 ease-in-out p-2 rounded-md"
                            onClick={toggleSidebar}
                        >
                            <FaHome className="mr-2" />
                            Dashboard
                        </NavLink>
                    </li>
                    <li>
                        <NavLink 
                            to={`/dashboard/${userId}/profile`}
                            className="flex items-center hover:text-blue-400 transition duration-200 ease-in-out p-2 rounded-md"
                            onClick={toggleSidebar}
                        >
                            <FaUser className="mr-2" />
                            Profile
                        </NavLink>
                    </li>
                    <li>
                        <NavLink 
                            to={`/dashboard/${userId}/games`}
                            className="flex items-center hover:text-blue-400 transition duration-200 ease-in-out p-2 rounded-md"
                            onClick={toggleSidebar}
                        >
                            <FaGamepad className="mr-2" />
                            Games
                        </NavLink>
                    </li>
                    <li>
                        <NavLink 
                            to={`/dashboard/${userId}/chat`}
                            className="flex items-center hover:text-blue-400 transition duration-200 ease-in-out p-2 rounded-md"
                            onClick={toggleSidebar}
                        >
                            <FaComments className="mr-2" />
                            Chat
                        </NavLink>
                    </li>
                    <li>
                        <NavLink 
                            to={`/dashboard/${userId}/store`}
                            className="flex items-center hover:text-blue-400 transition duration-200 ease-in-out p-2 rounded-md"
                            onClick={toggleSidebar}
                        >
                            <FaStore className="mr-2" />
                            Store
                        </NavLink>
                    </li>
                    <li>
                        <NavLink 
                            to={`/dashboard/${userId}/settings`}
                            className="flex items-center hover:text-blue-400 transition duration-200 ease-in-out p-2 rounded-md"
                            onClick={toggleSidebar}
                        >
                            <FaCog className="mr-2" />
                            Settings
                        </NavLink>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Sidebar;
