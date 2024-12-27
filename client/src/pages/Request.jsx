import React, { useState } from 'react';
import axios from 'axios';

const Request = ({ userId }) => {
  const [partnersUsername, setPartnersUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(
        `http://192.168.37.86:5000/dashboard/${userId}/partner/request`, 
        { userId, partnersUsername }
      );

      setSuccess(response.data.message || 'Request sent successfully!');
      setPartnersUsername('');
    } catch (err) {
      console.error('Error sending request:', err);
      setError(err.response?.data?.message || 'Error sending request. Please try again.');
    }
  };

  return (
    <div className="my-32 max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-center mb-4">Send Friend Request</h2>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <input
          type="text"
          placeholder="Enter friend's username"
          value={partnersUsername}
          onChange={(e) => setPartnersUsername(e.target.value)}
          required
          className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          type="submit" 
          className="bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 transition duration-200"
        >
          Send Request
        </button>
      </form>

      {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
      {success && <p className="text-green-500 mt-2 text-center">{success}</p>}
    </div>
  );
};

export default Request;
