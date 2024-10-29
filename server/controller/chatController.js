const User = require('../model/user');
const mongoose = require('mongoose');

exports.getUserPartnerData = async (req, res) => {
    const { userId } = req.params;

    try {
        // Fetch the user data
        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const partner = user.partnerUserId 
            ? await User.findOne({ userId: user.partnerUserId }) 
            : null;

        res.status(200).json({
            id: user._id,
            username: user.username,
            email: user.email,
            coins: user.coins,
            isConnected: user.isConnected,
            userId: user.userId,
            partnerUserId: user.partnerUserId,
            partnerUserName: partner.username,
            profilePicture: user.profilePicture,
        });
    } catch (error) {
        console.error("Error fetching user and partner data:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

