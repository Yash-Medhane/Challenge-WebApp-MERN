const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Safe extraction

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    console.log('Received token:', token); // Debugging log

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('JWT verification error:', err); // Log the error for debugging
            return res.status(403).json({ message: 'Forbidden: Invalid token' });
        }

        if (!decoded || !decoded.userId) { // Check if userId is in the decoded token
            return res.status(403).json({ message: 'Forbidden: Invalid token data' });
        }

        req.userId = decoded.userId; // Attach userId to request
        next(); // Continue to the next middleware
    });
};


module.exports = { authMiddleware }; // Correct export
