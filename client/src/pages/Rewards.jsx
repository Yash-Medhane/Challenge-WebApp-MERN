import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Rewards = ({ userId }) => {
    const navigate = useNavigate();
    const [rewards, setRewards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [rewardType, setRewardType] = useState('');
    const [reward, setReward] = useState('');
    const [coinsRequired, setCoinsRequired] = useState('');
    const [deadline, setDeadline] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchRewards = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("Token not found");
                }
                const response = await axios.get(`http://192.168.37.86:5000/dashboard/${userId}/rewards/get`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setRewards(Array.isArray(response.data) ? response.data : []);
            } catch (err) {
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    navigate('/'); 
                }
                console.error("Error fetching rewards:", err);
                setError("No rewards created.");
                setRewards([]);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchRewards();
        } else {
            setError("Invalid user ID.");
            setLoading(false);
        }
    }, [userId]);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        setSuccessMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newReward = {
            selfId: userId,
            partnerId: '', 
            rewardType,
            reward,
            coinsRequired,
            deadline
        };

        try {
            const response = await axios.post(`http://192.168.37.86:5000/dashboard/${userId}/rewards/create`, newReward);
            setRewards((prevRewards) => [...prevRewards, response.data]);
            setSuccessMessage('Reward created successfully!');
            resetForm();
            closeModal();
        } catch (err) {
            console.error("Error creating reward:", err);
            setError("Failed to create a new reward.");
        }
    };

    const resetForm = () => {
        setRewardType('');
        setReward('');
        setCoinsRequired('');
        setDeadline('');
    };

    const handleDelete = async (rewardId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this reward?");
        if (confirmDelete) {
            try {
                await axios.delete(`http://192.168.37.86:5000/rewards/${rewardId}`);
                setRewards((prevRewards) => prevRewards.filter(reward => reward._id !== rewardId));
                setSuccessMessage('Reward deleted successfully!');
            } catch (err) {
                console.error("Error deleting reward:", err);
                setError("Failed to delete reward.");
            }
        }
    };

    return (
        <div className=" flex-grow flex flex-col items-center p-6 md:p-8">
        <div className="w-full max-w-6xl flex-grow overflow-y-auto relative p-6 md:p-8 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl shadow-2xl">
        <button
    onClick={openModal}
    className="absolute top-2 right-0 sm:right-4 bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 text-white py-2 px-4 flex items-center rounded-full shadow-lg transition duration-300 transform hover:scale-105"
>
    <FaPlus className="mr-2" />
    <span className="hidden sm:inline">Create</span> 
</button>
    
            <h2 className="text-3xl md:text-4xl font-bold mb-8 my-2 text-blue-500 text-center">Partner Rewards</h2>
    
            {loading ? (
                <p className="text-gray-400 text-center">Loading rewards...</p>
            ) : error ? (
                <p className="text-center text-3xl animate-bounce font-bold text-blue-500">{error}</p>
            ) : (
                Array.isArray(rewards) && rewards.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rewards.map((reward) => (
                            <div key={reward._id} className={`bg-gray-800 ${reward.redeemed ? `border-green-500 border-r-8` : reward.deleted ? `border-red-500 border-r-8` : `border-yellow-500 border-r-8`} rounded-lg p-6 shadow-lg hover:shadow-2xl transition duration-300`}>
                                <h3 className="text-lg font-bold text-white mb-2">{reward.reward}</h3>
                                <p className="text-sm text-gray-400">Type: <span className="text-blue-300">{reward.rewardType}</span></p>
                                <p className="text-sm text-gray-400">Coins Required: <span className="text-yellow-400">{reward.coinsRequired}</span></p>
                                <p className={`text-sm ${reward.redeemed ? 'text-green-400' : 'text-yellow-400'}`}>
                                    Redeemed: {reward.redeemed ? 'Yes' : 'No'}
                                </p>
                                <p className="text-sm text-gray-400">Deadline: <span className="text-pink-300">{new Date(reward.deadline).toLocaleDateString()}</span></p>
                                <div className="mt-4 flex justify-end">
                                    <button
                                        onClick={() => handleDelete(reward._id)}
                                        className="text-red-500 hover:text-red-700 transition"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400 text-center">No rewards created yet.</p>
                )
            )}
    
            {successMessage && (
                <p className="text-green-400 mt-6 text-center">{successMessage}</p>
            )}
    
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl w-96">
                        <h2 className="text-2xl font-bold mb-6 text-center text-green-600">🎉 Create New Reward</h2>
                        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                            <select
                                value={rewardType}
                                onChange={(e) => setRewardType(e.target.value)}
                                className="p-3 border rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Select Reward Type</option>
                                <option value="gold">Gold</option>
                                <option value="diamond">Diamond</option>
                                <option value="silver">Silver</option>
                            </select>
                            <input
                                type="text"
                                value={reward}
                                onChange={(e) => setReward(e.target.value)}
                                placeholder="What is Reward?"
                                className="p-3 border rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <input
                                type="number"
                                value={coinsRequired}
                                onChange={(e) => setCoinsRequired(Number(e.target.value))}
                                placeholder="Coins Required"
                                className="p-3 border rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                           <div className="flex flex-col mb-4">
    <label htmlFor="deadline" className="text-blue-400 font-semibold mb-2">Deadline :</label>
    <input
        type="date"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
        id="deadline"
        className="p-3 border rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
    />
</div>

                            <button
                                type="submit"
                                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 px-6 rounded-full shadow-lg transition duration-300"
                            >
                                Create Reward
                            </button>
                        </form>
                        <button
                            onClick={closeModal}
                            className="mt-4 text-gray-500 hover:text-gray-700 text-sm transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    </div>    
    );
};

export default Rewards;
