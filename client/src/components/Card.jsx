import React from 'react';

const Card = ({ title, content }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">{title}</h2>
            <p>{content}</p>
        </div>
    );
};

export default Card;
