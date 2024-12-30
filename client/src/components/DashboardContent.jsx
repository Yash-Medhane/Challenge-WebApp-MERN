import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCheckCircle, FaCoins, FaPlus,FaTimes } from 'react-icons/fa';

const DashboardContent = ({ userId }) => {
    const navigate = useNavigate();
    const [pendingTasks, setPendingTasks] = useState([]);
    const [completedTasks, setCompletedTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); 
    const [taskId, setTaskId] = useState(null);
    const [taskName, setTaskName] = useState('');

    const difficultyColors = {
        easy: 'text-green-300',
        medium: 'text-yellow-300',
        hard: 'text-red-400',
    };

    useEffect(() => {
        fetchTasks();
    }, [userId]);

    const fetchTasks = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error("Token not found");
            }
            const response = await axios.get(`http://192.168.37.86:5000/dashboard/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const { pendingChallenges, completedChallenges, isConnected } = response.data;

            setIsConnected(isConnected);
            setPendingTasks(pendingChallenges || []);
            setCompletedTasks(completedChallenges || []);
        } catch (err) {
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                navigate('/'); 
            }
            console.error("Error fetching tasks:", err);
            setError("Failed to load tasks. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteTask = (task) => {
        setTaskName(task.challenge);
        setTaskId(task._id);
        openModal();
    };

    const completeTask = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error("Token not found");
            }
            await axios.post(`http://192.168.37.86:5000/dashboard/${userId}/challenges/completed`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }, 
                taskId,
            });
            closeModal();
            alert("Challenge marked as completed!");
            fetchTasks(); // Refresh tasks after marking as completed
        } catch (err) {
            console.error("Error completing task:", err);
            setError("Failed to complete the task. Please try again.");
        }
    };

    const handleConnect = () =>{
        navigate(`/dashboard/${userId}/partner/request`)
    }

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        setTaskId(null);
        setError(null);
    };

    // New modal functions for Create button
    const openCreateModal = () => setIsCreateModalOpen(true);
    const closeCreateModal = () => setIsCreateModalOpen(false);

    const navigateTo = (path) => {
        closeCreateModal();
        navigate(path);
    };

    if (loading) return <p className="text-gray-500">Loading tasks...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="bg-gray-900 flex-grow flex flex-col items-center p-6 md:p-8 overflow-hidden">
            <div className="w-full max-w-6xl flex-grow overflow-y-auto relative p-6 md:p-8 bg-gray-800 rounded-lg shadow-lg">
            <button
    onClick={openCreateModal}
    className={`${isConnected ? 'block' : 'hidden'} absolute top-4 right-4 bg-green-500 hover:bg-green-600 text-white py-2 px-4 flex items-center rounded-lg shadow-md transition duration-200 transform hover:scale-105`}
>
    <FaPlus className="mr-2" />
    Create
</button>

                {/* Create Modal for choosing between Reward and Challenges */}
                {isCreateModalOpen && (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="relative bg-white p-8 rounded-lg shadow-lg w-80">
            {/* Close button */}
            <button
                onClick={closeCreateModal}
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 transition"
            >
                <FaTimes />
            </button>

            <h2 className="text-xl font-bold mb-6 text-center">Choose an Option</h2>
            <div className="flex justify-between">
                <button 
                    onClick={() => navigateTo(`/dashboard/${userId}/rewards`)} 
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md w-full mr-2"
                >
                    Rewards
                </button>
                <button 
                    onClick={() => navigateTo(`/dashboard/${userId}/challenges`)} 
                    className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md w-full"
                >
                    Challenges
                </button>
            </div>
        </div>
    </div>
)}

                {/* Modal for task completion confirmation */}
                {isModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white p-8 rounded-lg shadow-lg w-80">
                            <h2 className="text-xl font-bold mb-6 text-center">Confirm Completion</h2>
                            <p className="mb-4">Are you sure you are done with "{taskName}" ?</p>
                            <div className="flex justify-between">
                                <button 
                                    onClick={completeTask} 
                                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
                                >
                                    Confirm
                                </button>
                                <button 
                                    onClick={closeModal} 
                                    className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Content */}
                {isConnected ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mt-16">
                        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 w-full">
                            <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-green-400">Pending Tasks</h2>
                            {pendingTasks.length > 0 ? (
    <ul className="list-disc list-inside space-y-4 text-gray-300">
        {pendingTasks.map(task => (
            <li key={task._id} className={`mb-3 flex flex-col md:flex-row justify-between items-start md:items-center p-4 rounded-lg shadow-md transition-transform transform hover:scale-105 ${difficultyColors[task.difficulty]}`}>
                <div className="flex flex-col mb-2 md:mb-0">
                    <span className={`font-bold text-green-400 text-lg ${difficultyColors[task.difficulty]}`}>{task.challenge}</span>
                    <span className="text-sm text-gray-400">Due: {new Date(task.deadline).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                    <span className="text-sm text-slate-300 font-bold mr-3 flex items-center">
                        <FaCoins className="inline mr-1 text-yellow-400 h-5 w-5" />
                        {task.coins} 
                    </span>
                    <button
                        onClick={() => handleCompleteTask(task)}
                        className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded-md transition duration-200"
                    >
                        Complete
                    </button>
                </div>
            </li>
        ))}
    </ul>
) : (
    <p className="text-gray-500">No pending tasks at the moment.</p>
)}

                        </div>

                        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 w-full">
                            <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-blue-400">Completed Tasks</h2>
                            {completedTasks.length > 0 ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {completedTasks.map(task => (
            <div key={task._id} className="bg-gradient-to-br from-purple-600 to-blue-600 p-4 rounded-lg shadow-lg transition-transform transform hover:scale-105 hover:shadow-xl">
                <h3 className="font-bold text-white flex items-center text-lg mb-2">
                    <FaCheckCircle className="text-green-300 mr-2 animate-bounce" />
                    {task.challenge}
                </h3>
                <p className="text-sm text-white mb-1">
                    <FaCoins className="inline mr-1 text-yellow-400" />
                    {task.coins} Coins
                </p>
            </div>
        ))}
    </div>
) : (
    <p className="text-gray-500">No completed tasks yet.</p>
)}

                        </div>
                    </div>
                ) : (
                    <div className="mt-6 p-6 bg-slate-800 rounded-lg shadow-lg text-center">
    <h2 className="text-2xl font-bold text-red-500 mb-4">You are currently disconnected.</h2>
    <p className="text-lg text-gray-400 mb-6">Please connect to view your tasks.</p>
    <button 
        onClick={handleConnect} 
        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-2xl">
        Connect
    </button>
</div>

                )}
            </div>
        </div>
    );
};

export default DashboardContent;
