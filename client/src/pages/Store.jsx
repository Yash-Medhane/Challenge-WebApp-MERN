import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaCoins, FaClock, FaAward } from 'react-icons/fa'; 

const Store = ({ userId }) => {
    const [rewards, setRewards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch rewards from the API
    const fetchRewards = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`http://192.168.37.86:5000/dashboard/${userId}/rewards/get-my-rewards`);
            if (Array.isArray(response.data)) {
                setRewards(response.data);
            } else {
                console.error('Unexpected API response format:', response.data);
                setRewards([]);
            }
        } catch (err) {
            console.error('Error fetching rewards:', err.message);
            setError(err.response?.data?.message || 'Failed to fetch rewards.');
        } finally {
            setLoading(false);
        }
    };

    // Redeem a reward
    const redeemReward = async (rewardId) => {
        try {
            const response = await axios.put(`http://192.168.37.86:5000/dashboard/${userId}/rewards/${rewardId}/redeem`);
            alert(response.data.message || 'Reward redeemed successfully!');
            fetchRewards(); // Refresh rewards after redeeming
        } catch (err) {
            console.error('Error redeeming reward:', err.message);
            alert(err.response?.data?.message || 'Failed to redeem the reward. Please try again.');
        }
    };

    useEffect(() => {
        fetchRewards();
    }, [userId]);

    // Get card background color based on reward type
    const getCardColor = (type) => {
        switch (type) {
            case 'gold':
                return 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600';
            case 'silver':
                return 'bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600';
            case 'bronze':
                return 'bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600';
            default:
                return 'bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600';
        }
    };

    const formatDeadline = (deadline) => {
        const date = new Date(deadline);
        return date.toLocaleDateString();
    };

    if (loading) {
        return <p className="text-center text-xl text-blue-500">Loading rewards...</p>;
    }

    if (error) {
        return <p className="text-center text-3xl animate-bounce font-bold my-24 text-blue-500">{error}</p>;
    }

    return (
        <div className="min-h-screen bg-gray-800 p-8">
            <h1 className="text-4xl font-extrabold mb-8 text-center text-indigo-700">Rewards Store</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {rewards.length > 0 ? (
                    rewards.map((reward) => (
                        <div
                            key={reward._id}
                            className={`rounded-lg shadow-xl p-6 ${getCardColor(reward.rewardType)} text-white transform hover:scale-105 transition-transform duration-300`}
                        >
                            <h2 className="text-2xl font-semibold flex items-center">
                                <FaAward className="mr-2" />
                                {reward.reward}
                            </h2>
                            <p className="mt-2 text-sm text-ellipsis overflow-hidden max-h-20">{reward.description}</p>

                            <div className="mt-4 flex items-center">
                                <FaCoins className="mr-2" />
                                <span><strong>Coins Required:</strong> {reward.coinsRequired}</span>
                            </div>
                            <div className="mt-2 flex items-center">
                                <FaClock className="mr-2" />
                                <span><strong>Deadline:</strong> {formatDeadline(reward.deadline)}</span>
                            </div>
                            <p className="mt-4 font-medium">
                                <strong>Status:</strong> {reward.redeemed ? 'Redeemed' : 'Available'}
                            </p>
                            {!reward.redeemed && (
                                <button
                                    onClick={() => redeemReward(reward._id)}
                                    className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 rounded-full shadow-md transition duration-300"
                                >
                                    Redeem
                                </button>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="col-span-full text-center text-gray-500 animate-bounce">No rewards Yet.</p>
                )}
            </div>
        </div>
    );
};

export default Store;
