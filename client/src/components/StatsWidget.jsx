import React from 'react';

const StatsWidget = ({ title, value }) => {
    return (
        <div className="bg-blue-500 text-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg">{title}</h3>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    );
};

export default StatsWidget;
