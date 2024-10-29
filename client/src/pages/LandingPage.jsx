import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();

    const handleLoginClick = () => {
        navigate('/login');  // Redirect to login page when button is clicked
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
            <div className="text-center p-6 bg-white text-black rounded-lg shadow-lg max-w-md">
                <h1 className="text-4xl font-bold mb-4">Welcome to Our Platform</h1>
                <p className="text-lg mb-6">
                    Join us today and start collaborating on exciting projects!
                </p>

                <button
                    onClick={handleLoginClick}
                    className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
                >
                    Login
                </button>
            </div>
        </div>
    );
};

export default LandingPage;
