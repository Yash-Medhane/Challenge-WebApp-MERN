const Challenge = require('../model/challenge');
const User = require('../model/user'); 
const mongoose = require('mongoose');

exports.createPartnersChallenge = async (req, res) => {
    const { selfId, challenge, deadline, proofRequired, difficulty, coins } = req.body;

    // Validate input data
    if (!selfId || !challenge || !deadline || !difficulty) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    // Validate difficulty
    const validDifficulties = ['easy', 'medium', 'hard'];
    if (!validDifficulties.includes(difficulty)) {
        return res.status(400).json({ message: 'Invalid difficulty level.' });
    }

    try {
        const user = await User.findOne({ userId: selfId });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const partner = await User.findOne({ userId: user.partnerUserId });
        if (!partner) {
            return res.status(404).json({ message: 'Partner not found.' });
        }

        // Check if the partner is connected
        if (!partner.isConnected) {
            return res.status(400).json({ message: 'Partner is not connected. Connect your partner now.' });
        }

        // Create the challenge object
        const newChallenge = new Challenge({
            selfId: user.partnerUserId,  // Set selfId as selfId
            partnerId: selfId,  // Set partnerId correctly
            challenge,
            deadline,
            proofRequired,
            difficulty,
            coins: coins,
            status: 'pending' // Set the initial status to 'pending'
        });

        // Save the challenge to the database
        const savedChallenge = await newChallenge.save();
        res.status(201).json(savedChallenge);
    } catch (error) {
        console.error('Error creating challenge:', error.message); // Log the specific error message
        res.status(500).json({ message: 'Server error.' });
    }
};



exports.getUserDashboardData = async (req, res) => {
    const userId = req.params.userId;

    try {
        const user = await User.findOne({ userId: userId }); // Changed to findOne

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Initialize response data
        let dashboardData = {
            username:user.username,
            profileUrl:user.profilePicture,
            theme:user.preferences.theme,
            isConnected:user.isConnected,
            coins: user.coins,
            pendingChallenges: [],
            completedChallenges: [],
            partnerMessage: ''
        };

        // Check if user has a partner
        if (user.partnerUserId && user.partnerUserId.length > 0) { // Updated check
            // Fetch challenges related to the user and partner
            const challenges = await Challenge.find({
                $or: [
                    { selfId: userId },
                    { partnerId: user.partnerUserId }
                ]
            });

            const currentDate = new Date();
            dashboardData.pendingChallenges = challenges.filter(challenge => challenge.status === 'pending' && new Date(challenge.deadline) >= currentDate);
            dashboardData.completedChallenges = challenges.filter(challenge => challenge.status === 'completed' && new Date(challenge.deadline) >= currentDate);
        } else {
            dashboardData.partnerMessage = 'No partner is connected. Connect your partner now.';
        }

        // Send the dashboard data
        res.status(200).json(dashboardData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getPartnersChallenges = async (req, res) => {
    const { userId } = req.params; // Get the userId from the request parameters

    try {
  
        const user = await User.findOne({ userId: userId });
        
        // Check if the user exists
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Find all challenges where partnerUserId matches the user's partnerUserId
        const challenges = await Challenge.find({ selfId: user.partnerUserId });
    
        if (challenges.length === 0) {
            return res.status(404).json({ message: "No challenges found for this user." });
        }


        const currentDate = new Date();
        const challengesWithNullPartner = challenges.filter(challenge => challenge.partnerId === null && new Date(challenge.deadline) >= currentDate);
        if (challengesWithNullPartner.length > 0) {
            return res.status(200).json({ 
                message: "No partner connected. Connect your partner now.", 
                challenges 
            });
        }

        // If no issues, return the found challenges
        res.status(200).json(challenges);
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: "Server error." });
    }
};



exports.deletePartnersChallenge = async (req, res) => {
    const { challengeId } = req.params; // Extract challengeId from request parameters

    try {
        // Attempt to find and delete the challenge by its ID
        const deletedChallenge = await Challenge.findByIdAndDelete(challengeId);

        // Check if the challenge was found and deleted
        if (!deletedChallenge) {
            return res.status(404).json({ message: "Challenge not found." });
        }

        // Return success message
        res.status(200).json({ message: "Challenge deleted successfully." });
    } catch (error) {
        // Log the error for debugging
        console.error(error);
        // Handle potential errors and return appropriate status code
        res.status(500).json({ message: "Server error." });
    }
};
exports.completeChallenge = async (req, res) => {
    const { taskId } = req.body;

    try {
        if (!mongoose.isValidObjectId(taskId)) {
            return res.status(400).json({ message: 'Task ID and proof are required.' });
        }

        // Find the challenge by ID
        const challenge = await Challenge.findById(taskId);

        // Check if the challenge exists
        if (!challenge) {
            return res.status(404).json({ message: "Challenge not found." });
        }

        // Check if the challenge is already completed
        if (challenge.status === 'completed') {
            return res.status(400).json({ message: 'Challenge is already completed.' });
        }

        // Check if the challenge has expired
        const currentDate = new Date();
        const deadlineDate = new Date(challenge.deadline); // Assuming `deadline` is stored in the Challenge model

        // If the challenge has expired
        if (currentDate > deadlineDate) {
            // Delete the expired challenge
            await Challenge.findByIdAndDelete(taskId); // Delete the challenge from the database
            return res.status(400).json({ message: 'Challenge has expired! No coins will be awarded.' });
        }

        // Update the challenge status and proof image URL
        challenge.status = 'completed';

        // Save the updated challenge
        await challenge.save();

        // Add coins to the user for completing the challenge
        const userId = challenge.selfId; // Assuming selfId is the user who created the challenge
        const coinsEarned = challenge.coins; // Set the number of coins to be awarded

        // Find the user and update their coins
        const user = await User.findOne({userId}); // Use findById for the user

        if (user) {
            user.coins += coinsEarned; // Increase user's coins
            await user.save(); // Save the updated user
        } else {
            console.error(`User not found for ID: ${userId}`); // Log if user is not found
        }

        // Respond with the updated challenge data and coins added
        res.status(200).json({
            message: 'Challenge completed successfully.',
            challenge,
            coinsAdded: coinsEarned
        });
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: 'Server error' });
    }
};