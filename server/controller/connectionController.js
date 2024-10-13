const User = require('../model/user'); 
const Notification = require('../model/notification.js');
const mongoose = require('mongoose');

exports.getUserNotifications = async (req, res) => {
    // Assuming userId is passed in the request body
    const userId = req.body.userId; // You can change this line to req.query.userId if you prefer using query parameters

    // Check if userId is provided
    if (!userId) {
        return res.status(400).json({ message: "User ID is required." });
    }

    try {
        // Fetch notifications for the user, sorted by creation date in descending order
        const notifications = await Notification.find({ receiverId: userId }).sort({ createdAt: -1 });

        // Check if notifications exist
        if (!notifications.length) {
            return res.status(404).json({ message: "No notifications found." });
        }

        // Return the notifications in the response
        res.status(200).json(notifications);
    } catch (error) {
        console.error(error);
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
    const { notificationId, userId } = req.body; // userId should be the UUID of the current user

    try {
        // Validate notificationId as a Mongoose ObjectId
        if (!mongoose.Types.ObjectId.isValid(notificationId)) {
            return res.status(400).json({ message: "Invalid notification ID." });
        }

        const notification = await Notification.findById(notificationId);

        if (!notification) {
            return res.status(404).json({ message: "Request not found." });
        }

        notification.isAccepted = true;
        await notification.save();

        // Check if receiverId is a valid UUID format (UUIDs are your custom format)
        if (!isValidUUID(notification.receiverId)) {
            return res.status(400).json({ message: "Invalid receiver ID." });
        }

        // Update User B's partnerId and isConnected
        const userB = await User.findOne({ userId: notification.receiverId }); // Assuming userId is stored as UUID

        if (!userB) {
            return res.status(404).json({ message: "User not found." });
        }

        userB.partnerId = notification.senderId; // senderId should be the UUID of User A
        userB.isConnected = true;
        userB.partnerUserId = notification.senderId;
        
        await userB.save();

        // Send a reverse notification to User A to confirm the partnership
        const confirmationNotification = new Notification({
            receiverId: notification.senderId, // senderId is a UUID
            senderId: userId, // userId should be the UUID of the current user
            message: `${userB.username} has accepted your request. Confirm the partnership.`,
            type: 'partner_confirm',
            isAccepted: false
        });

        await confirmationNotification.save();
        await Notification.deleteOne({ _id: notificationId });

        res.status(200).json({ message: "Request accepted. Waiting for confirmation from the other user." });
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


// Confirm Partner Request (User A confirms the partnership)
exports.confirmPartnerRequest = async (req, res) => {
    const { notificationId, userId } = req.body; // userId is the user confirming the partnership

    try {
        // Find the notification by your custom notificationId
        const notification = await Notification.findOne({ _id: notificationId }); // Use findOne instead of findById

        if (!notification) {
            return res.status(404).json({ message: "Request not found." });
        }

        // Update User A's partnerId and isConnected
        const userA = await User.findOne({ userId: notification.receiverId }); // Find User A by your custom userId field
        if (!userA) {
            return res.status(404).json({ message: "User A not found." });
        }
        
        // Update userA's details
        userA.partnerId = notification.senderId; // User B becomes partner
        userA.isConnected = true;
        userA.partnerUserId = notification.senderId;
        await userA.save();

        // Delete the notification as partnership is confirmed
        await Notification.deleteOne({ _id: notificationId }); // Use deleteOne instead of findByIdAndDelete

        res.status(200).json({ message: "Partnership confirmed successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error." });
    }
};
