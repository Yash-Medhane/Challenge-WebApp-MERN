import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaTrash } from 'react-icons/fa';

const Challenges = ({ userId }) => {
    const [challenges, setChallenges] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [challengeDescription, setChallengeDescription] = useState('');
    const [deadline, setDeadline] = useState('');
    const [proofRequired, setProofRequired] = useState(false);
    const [difficulty, setDifficulty] = useState('');
    const [coins, setCoins] = useState();
    
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchChallenges = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`http://localhost:5000/dashboard/${userId}/challenges/get`);
                setChallenges(Array.isArray(response.data) ? response.data : []);
            } catch (err) {
                console.error("Error fetching challenges:", err);
                setError("No challenges yet.");
                setChallenges([]);
            } finally {
                setLoading(false);
            }
        };
        
        if (userId) {
            fetchChallenges();
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
        const newChallenge = {
            selfId: userId,
            partnerId: '',
            challenge: challengeDescription,
            deadline,
            proofRequired,
            difficulty,
            coins,
            status: 'pending'
        };

        try {
            const response = await axios.post(`http://localhost:5000/dashboard/${userId}/challenges/create`, newChallenge);
            setChallenges((prevChallenges) => [...prevChallenges, response.data]);
            setSuccessMessage('Challenge created successfully!');
            resetForm();
            closeModal();
        } catch (err) {
            console.error("Error creating challenge:", err);
            setError("Failed to create a new challenge.");
        }
    };

    const resetForm = () => {
        setChallengeDescription('');
        setDeadline('');
        setProofRequired(false);
        setDifficulty('');
        setCoins(0);
    };

    const handleDelete = async (challengeId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this challenge?");
        if (confirmDelete) {
            try {
                await axios.delete(`http://localhost:5000/challenges/${challengeId}`);
                setChallenges((prevChallenges) => prevChallenges.filter(challenge => challenge._id !== challengeId));
                setSuccessMessage('Challenge deleted successfully!');
            } catch (err) {
                console.error("Error deleting challenge:", err);
                setError("Failed to delete challenge.");
            }
        }
    };

    return (
        <div className="bg-gray-900 flex-grow flex flex-col items-center p-6 md:p-8">
            <div className="w-full max-w-6xl flex-grow overflow-y-auto relative p-6 md:p-8 bg-gray-800 rounded-lg shadow-lg">
                <button
                    onClick={openModal}
                    className="absolute top-4 right-4 bg-green-500 hover:bg-green-600 text-white py-2 px-4 flex items-center rounded-lg shadow-md transition duration-200 transform hover:scale-105"
                >
                    <FaPlus className="mr-2" />
                    Create Challenge
                </button>

                <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-yellow-400">Challenges for Partner</h2>

                {loading ? (
                    <p className="text-gray-500">Loading challenges...</p>
                ) : error ? (
                    <p className="text-slate-500">{error}</p>
                ) : (
                    Array.isArray(challenges) && challenges.length > 0 ? (
                        <ul className="list-disc list-inside space-y-4 text-gray-300">
                            {challenges.map((challenge) => (
                                <li key={challenge._id} className="mb-3 flex justify-between items-center">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-white">{challenge.challenge}</h3>
                                        <p className="text-sm text-gray-400">Coins: {challenge.coins}</p>
                                        <p className={`text-sm ${challenge.status === 'completed' ? 'text-green-400' : 'text-yellow-400'}`}>
                                            Status: {challenge.status.charAt(0).toUpperCase() + challenge.status.slice(1)}
                                        </p>
                                    </div>
                                    <span className="text-sm text-gray-400">Due: {new Date(challenge.deadline).toLocaleDateString()}</span>
                                    <button
                                        onClick={() => handleDelete(challenge._id)}
                                        className="ml-4 text-red-500 hover:text-red-700"
                                    >
                                        <FaTrash />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">No challenges created yet.</p>
                    )
                )}

                {successMessage && (
                    <p className="text-green-500 mt-4">{successMessage}</p>
                )}

                {isModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white p-8 rounded-lg shadow-lg w-80">
                            <h2 className="text-xl font-bold mb-6 text-center text-green-600">Create New Challenge</h2>
                            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                                <input
                                    type="text"
                                    value={challengeDescription}
                                    onChange={(e) => setChallengeDescription(e.target.value)}
                                    placeholder="Challenge Description"
                                    className="p-2 border rounded-md bg-blue-50 text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                <input
                                    type="date"
                                    value={deadline}
                                    onChange={(e) => setDeadline(e.target.value)}
                                    className="p-2 border rounded-md bg-purple-50 text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    required
                                />
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={proofRequired}
                                        onChange={(e) => setProofRequired(e.target.checked)}
                                        className="mr-2"
                                    />
                                    <span className="text-gray-700">Proof Required?</span>
                                </label>
                                <select
                                    value={difficulty}
                                    onChange={(e) => setDifficulty(e.target.value)}
                                    className="p-2 border rounded-md bg-blue-50 text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select Difficulty Level</option>
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>
                                <input
                                    type="number"
                                    value={coins}
                                    onChange={(e) => setCoins(Number(e.target.value))}
                                    placeholder="Coins"
                                    className="p-2 border rounded-md bg-blue-50 text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
                                >
                                    Create Challenge
                                </button>
                            </form>
                            <button
                                onClick={closeModal}
                                className="mt-6 text-gray-500 hover:text-gray-700 text-sm"
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

export default Challenges;
