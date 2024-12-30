import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaUserCircle } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';

const Profile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("Token not found");
                }

                const response = await axios.get(`http://192.168.37.86:5000/dashboard/${userId}/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setUser(response.data);
                setFormData(response.data);
            } catch (err) {
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    navigate('/');
                }
                console.error("Error fetching user profile:", err);
                setError("Failed to load user profile. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [userId]);

    const handleEditToggle = () => {
        setEditing(!editing);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleDisconnect = async (e) => {
        e.preventDefault();
        if (window.confirm("Are you sure you want to disconnect?")) {
            try {
                const res = await axios.put(`http://192.168.37.86:5000/dashboard/${userId}/profile/disconnect`);
                if (res.status === 200) {
                    alert("Successfully disconnected.");
                } else {
                    alert("Failed to disconnect. Please try again.");
                }
            } catch (err) {
                console.error("Error disconnecting:", err);
                alert("Already Disconnected..");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://192.168.37.86:5000/dashboard/${userId}/profile`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUser(formData);
            setEditing(false);
            setSuccessMessage('Profile updated successfully!');

            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        } catch (err) {
            console.error("Error updating profile:", err);
            setError("Failed to update profile. Please try again.");
        }
    };

    if (loading) return <p className="text-gray-500 text-center">Loading profile...</p>;
    if (error) return <p className="text-red-500 text-center">{error}</p>;

    return (
        <div className="flex justify-center bg-gradient-to-r bg-gray-800 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="bg-gray-900 w-full max-w-lg p-8 rounded-xl shadow-lg transition-transform transform hover:scale-105">
                <h1 className="text-3xl font-bold text-center text-white mb-6">User Profile</h1>

                {successMessage && (
                    <div className="bg-green-500 text-white text-center p-2 rounded-md mt-4 animate-pulse">
                        {successMessage}
                    </div>
                )}

                <div className="flex justify-center mb-6">
                    <FaUserCircle className="text-blue-400 text-6xl transition-transform transform hover:scale-110" />
                </div>

                <div className="text-center text-white mb-6">
                    <h2 className="text-xl font-semibold">{`${user.firstName} ${user.lastName}`}</h2>
                    <p className="text-sm">{user.email}</p>
                </div>

                <div className="space-y-4 text-white mb-6">
                    <p><strong>Username:</strong> {user.username}</p>
                    <p><strong>Coins:</strong> {user.coins}</p>
                    <p><strong>Date Joined:</strong> {new Date(user.dateJoined).toLocaleDateString()}</p>
                    <p><strong>DOB:</strong> {new Date(user.dateOfBirth).toLocaleDateString()}</p>
                    <p><strong>Bio:</strong> {user.bio || "No bio available"}</p>
                </div>

                <div className="flex flex-col sm:flex-row justify-between mt-4 space-y-4 sm:space-y-0 sm:space-x-4">
    <button
        className="bg-yellow-500 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-md hover:bg-yellow-600 transition transform hover:scale-105"
        onClick={handleEditToggle}
    >
        {editing ? 'Cancel Editing' : 'Edit Profile'}
    </button>

    <button
        className="bg-red-500 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-md hover:bg-red-600 transition transform hover:scale-105"
        onClick={handleDisconnect}
    >
        Disconnect
    </button>
</div>


                {editing && (
                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            placeholder="First Name"
                        />
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            placeholder="Last Name"
                        />
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            placeholder="Bio"
                            rows="3"
                        />
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            placeholder="Location"
                        />
                        <input
                            type="text"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            placeholder="Phone Number"
                        />
                        <input
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().substring(0, 10) : ''}
                            onChange={handleChange}
                            className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                        <button
                            type="submit"
                            className="w-full bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 transition transform hover:scale-105"
                        >
                            Update Profile
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Profile;
