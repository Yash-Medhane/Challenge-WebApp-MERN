import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Eye from '../components/Eye';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:5000/login', formData);
            
            if (response.status === 200) {
                const { user } = response.data; // Extract user from response
                const { token } = response.data; // Assuming the response contains the token
        
        // Store the token in local storage
        localStorage.setItem('token', token);
        console.log("Token: ",token)
                const userId = user.id; // Get the user ID
                
                // Redirect to dashboard with user ID
                navigate(`/dashboard/${userId}`);  
            }
        } catch (error) {
            setError(error.response ? error.response.data.message : error.message);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-6 rounded-lg shadow-lg w-80">
                <h1 className="text-2xl font-semibold text-center mb-6">Login</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />

                    <div className="relative w-full">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Password"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <div className="absolute inset-y-0 right-3 flex items-center">
                            <Eye
                                isVisible={showPassword}
                                toggleVisibility={() => setShowPassword(!showPassword)}
                            />
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
                    >
                        Login
                    </button>
                    <p className="text-sm text-center mt-4">
                        Don't have an account?{' '}
                        <a
                            href="/register"
                            className="text-blue-500 hover:text-blue-600 font-semibold transition-colors duration-300"
                        >
                            Register
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
