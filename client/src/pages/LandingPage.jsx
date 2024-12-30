import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import image1 from '../assets/1.png';
import image2 from '../assets/2.png';
import image3 from '../assets/3.png';
import image4 from '../assets/4.png';
import main2 from '../assets/main3.png';

const LandingPage = () => {
    const navigate = useNavigate();
    const [showConfetti, setShowConfetti] = useState(false);

    const handleLoginClick = () => {
        setShowConfetti(true);
        setTimeout(() => {
            setShowConfetti(false);
            navigate('/login');
        }, 1000);
    };

    useEffect(() => {
        // Reset confetti after navigating
        return () => setShowConfetti(false);
    }, [navigate]);

    return (
        <div className="relative flex flex-col min-h-screen bg-slate-800 text-white">
            {/* Confetti effect */}
            {showConfetti && (
                <div className="absolute top-0 left-0 right-0 bottom-0 z-50">
                    <div className="confetti"></div>
                </div>
            )}

            {/* Two-sided layout */}
            <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-between px-6 py-12 lg:py-20">
                {/* Left Side (Text) */}
                <div className="lg:w-1/2 text-center lg:text-left flex flex-col justify-center items-center lg:items-start mx-6 lg:mx-16 space-y-8">
                <h1 className="text-3xl lg:text-4xl font-extrabold mb-4 text-transparent bg-clip-text bg-blue-500">
    Welcome to Taskify!
</h1>
<p className="text-base lg:text-lg text-slate-600 font-mono mb-6 max-w-lg mx-auto lg:mx-0">
    "Taskify: Where Goals Become Achievements!"
</p>
<p className="text-base lg:text-lg text-slate-200 font-mono mb-6 max-w-lg mx-auto lg:mx-0">
    Challenge yourself, connect with a friend, and earn rewards as you crush your tasks together. Productivity has never been this rewarding!
</p>

                    {/* Steps in a single line with hover effects */}
                    <div className="flex flex-wrap justify-center items-center space-x-8 lg:space-x-12">
                        {[{ src: image1, alt: "connect", text: "Connect" },
                        { src: image2, alt: "task", text: "Task" },
                        { src: image3, alt: "reward", text: "Reward" },
                        { src: image4, alt: "Achieve", text: "Achieve" },
                        ].map((step, index) => (
                            <div key={index} className="flex items-center space-x-3 mb-4">
                                <div className="text-blue-400 flex flex-col items-center text-sm font-medium py-3 px-4 rounded-lg shadow-md transform transition duration-300 hover:scale-110 hover:shadow-xl">
                                    <img src={step.src} alt={step.alt} className="w-6 h-6 mb-2" />
                                    <span>{step.text}</span>
                                </div>
                                {/* Add arrows except for the last item */}
                                {index < 3 && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Call to Action */}
                    <div className="w-full flex justify-center lg:justify-start mt-8">
                        <button
                            onClick={handleLoginClick}
                            className="w-full sm:w-auto font-mono bg-blue-500 text-white py-3 px-8 rounded-lg shadow-md hover:scale-105 transform transition duration-300"
                        >
                            Get Started
                        </button>
                    </div>
                </div>

                {/* Right Side (Image) */}
<div className="lg:w-4/12 mt-10 lg:mt-0 bg-cover bg-center relative right-20 hidden lg:block">
    <img src={main2} alt="Main Visual" className="w-full h-auto" />
</div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 w-full text-center py-4 text-sm text-blue-200 bg-slate-950 bg-opacity-70">
                <p>&copy; 2025 Taskify. All Rights Reserved.</p>
            </div>
        </div>
    );
};

export default LandingPage;
