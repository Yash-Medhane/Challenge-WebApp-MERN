import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const Profile = () => {
    const { userId } = useParams();
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

                const response = await axios.get(`http://localhost:5000/dashboard/${userId}/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setUser(response.data);
                setFormData(response.data);
            } catch (err) {
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/dashboard/${userId}/profile`, formData, {
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
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-800 to-blue-600 text-white">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
                <h1 className="text-3xl font-semibold text-center mb-4">User Profile</h1>
                
                {successMessage && (
                    <div className="bg-green-500 text-white text-center p-2 rounded mb-4">
                        {successMessage}
                    </div>
                )}

                <div className="flex flex-col items-center mb-4">
                    {user.profilePicture ? (
                        <img src={user.profilePicture} alt="Profile" className="w-32 h-32 rounded-full border-4 border-white shadow-lg" />
                    ) : (
                        <div className="w-32 h-32 rounded-full bg-gray-500 border-4 border-white shadow-lg flex items-center justify-center">
                            <span className="text-white">No Image</span>
                        </div>
                    )}
                    <h2 className="text-xl font-bold mt-2">{`${user.firstName} ${user.lastName}`}</h2>
                    <p className="text-gray-300">{user.email}</p>
                </div>

                <div className="text-gray-300 mb-4">
                    <p><strong>Username:</strong> {user.username}</p>
                    <p><strong>Coins:</strong> {user.coins}</p>
                    <p><strong>Date Joined:</strong> {new Date(user.dateJoined).toLocaleDateString()}</p>
                    <p><strong>Last Login:</strong> {new Date(user.lastLogin).toLocaleDateString()}</p>
                    <p><strong>Bio:</strong> {user.bio || "No bio available"}</p>
                </div>

                <button
                    className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition mb-4"
                    onClick={handleEditToggle}
                >
                    {editing ? 'Cancel Editing' : 'Edit Profile'}
                </button>

                {editing && (
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="p-4 rounded border border-gray-400 text-gray-800"
                            placeholder="First Name"
                        />
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="p-4 rounded border border-gray-400 text-gray-800"
                            placeholder="Last Name"
                        />
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            className="p-4 rounded border border-gray-400 text-gray-800"
                            placeholder="Bio"
                            rows="3"
                        />
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="p-4 rounded border border-gray-400 text-gray-800"
                            placeholder="Location"
                        />
                        <input
                            type="text"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className="p-4 rounded border border-gray-400 text-gray-800"
                            placeholder="Phone Number"
                        />
                        <input
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().substring(0, 10) : ''}
                            onChange={handleChange}
                            className="p-4 rounded border border-gray-400 text-gray-800"
                        />
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="p-4 rounded border border-gray-400 text-gray-800"
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                        <button type="submit" className="mt-4 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition">
                            Update Profile
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Profile;
