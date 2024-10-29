const User = require('../model/user'); 
const Notification = require('../model/notification.js');
const mongoose = require('mongoose');

exports.getUserNotifications = async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ message: "User ID is required." });
    }

    try {
        const notifications = await Notification.find({ receiverId: userId }).sort({ createdAt: -1 });

        if (notifications.length === 0) {
            return res.status(404).json({ message: "No notifications found." });
        }

        res.status(200).json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Server error." });
    }
};



exports.deleteNotification = async (req, res) => {
    const { notificationId } = req.params;

    // Clean the ID
    const cleanedId = notificationId.replace(/:/g, '').trim();

    // Check if the ID is a valid ObjectId
    if (!mongoose.isValidObjectId(cleanedId)) {
        return res.status(400).json({ message: "Invalid notification ID." });
    }

    try {
        const deletedNotification = await Notification.findByIdAndDelete(cleanedId);

        if (!deletedNotification) {
            return res.status(404).json({ message: "Notification not found." });
        }

        res.status(200).json({ message: "Notification deleted successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error." });
    }
};

exports.sendPartnerRequest = async (req, res) => {
    const { userId, partnersUsername } = req.body;

    try {
        // Find the partner by username
        const partner = await User.findOne({ username: partnersUsername });

        // If partner does not exist, return error
        if (!partner) {
            return res.status(404).json({ message: "Partner not found." });
        }

        // Check if the user is trying to send a request to themselves
        if (userId === partner.userId) {
            return res.status(400).json({ message: "You cannot send a partner request to yourself." });
        }

        // Find the current user by userId (using custom userId, not _id)
        const currentUser = await User.findOne({ userId });

        // If the current user already has a connected partner, return error
        if (currentUser.isConnected) {
            return res.status(400).json({ message: "You already have a partner." });
        }

        // If the partner already has a connected partner, return error
        if (partner.isConnected) {
            return res.status(400).json({ message: `${partnersUsername} already has a partner.` });
        }

        // Check if a notification already exists
        const existingNotification = await Notification.findOne({
            receiverId: partner.userId,
            senderId: currentUser.userId,
            type: 'partner_request'
        });

        if (existingNotification) {
            return res.status(400).json({ message: "Partner request already sent." });
        }

        // Create a notification for the partner to accept the request
        const notification = new Notification({
            receiverId: partner.userId, // Partner's userId (custom field)
            message: `${currentUser.username} wants to connect with you as a partner.`,
            type: 'partner_request',
            senderId: currentUser.userId // The custom userId of the user making the request
        });

        // Save the notification in the database
        await notification.save();

        // Send a success response
        res.status(200).json({ message: "Partner request sent successfully." });
    } catch (error) {
        console.error(error); // Log the error for debugging purposes
        res.status(500).json({ message: "Server error." });
    }
};



exports.acceptPartnerRequest = async (req, res) => {
    const { notificationId, userId, partnerId } = req.body; // userId and partnerId should be the UUIDs of the current user and their partner

    try {
        const user = await User.findOne({ userId });
        const partner = await User.findOne({ userId: partnerId }); // Partner user

        if (!partner) {
            return res.status(404).json({ message: "Partner not found." });
        }

        // Check if either user is already connected
        if (user.isConnected || partner.isConnected) {
            return res.status(400).json({ message: "One or both users are already connected." });
        }

        // Set each other as partners and mark as connected
        user.partnerUserId = partnerId;
        user.isConnected = true;

        partner.partnerUserId = userId;
        partner.isConnected = true;

        // Save both users
        await user.save();
        await partner.save();

        // Attempt to delete notification and check if it was found and deleted
        const deletedNotification = await Notification.findByIdAndDelete(notificationId);
        if (!deletedNotification) {
            return res.status(404).json({ message: "Notification not found." });
        }

        res.status(200).json({ message: "Users successfully connected as partners." });
    } catch (error) {
        console.error("Error during partner connection:", error);
        res.status(500).json({ message: "Server error." });
    }
};


exports.getNotificationCount = async (req, res) => {
    const { userId } = req.params;

    try {
        if (!userId) {
            return res.status(400).json({ message: "User ID is required." });
        }

        const notificationCount = await Notification.countDocuments({ receiverId: userId }) || 0;

        res.status(200).json({ count: notificationCount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error." });
    }
};


// Function to validate UUID
function isValidUUID(id) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
}



