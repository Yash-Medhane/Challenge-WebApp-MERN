import React from 'react';
import { Routes, Route, useParams } from 'react-router-dom'; // Import useParams
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import DashboardContent from '../components/DashboardContent';
import Profile from './Profile';
import Request from './Request';
import Challenges from './Challenges';
import Chat from './Chat';
import Rewards from './Rewards';
import Store from './Store';
import ContactForm from './ContactForm';

const Dashboard = () => {
    const { userId } = useParams(); // Extract userId from URL params

    return (
        <div className="min-h-screen flex bg-gray-900">
            <Sidebar userId={userId} /> {/* Pass userId to Sidebar */}
            <div className="flex-1">
                <Navbar userId={userId}/>
                <div className="p-6">
                    <Routes>
                        <Route path="/" element={<DashboardContent userId={userId} />} /> 
                        <Route path="/profile" element={<Profile userId={userId} />} />
                        <Route path="/partner/request" element={<Request userId={userId} />} />  
                        <Route path="/challenges" element={<Challenges userId={userId} />} />  
                        <Route path="/chat" element={<Chat userId={userId} />} /> 
                        <Route path="/rewards" element={<Rewards userId={userId}/>}/>
                        <Route path="/store" element={<Store userId={userId}/>}/>
                        <Route path='/contact' element={<ContactForm/>}/>
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
