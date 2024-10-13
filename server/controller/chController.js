const Challenge = require('../model/challenge');
const User = require('../model/user'); 
const mongoose = require('mongoose');

exports.createPartnersChallenge = async (req, res) => {
    const { selfId, partnerId, challenge, deadline, proofRequired, difficulty,coins } = req.body;

    // Validate input data
    if (!selfId || !partnerId || !challenge || !deadline || !difficulty) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    // Validate difficulty
    const validDifficulties = ['easy', 'medium', 'hard'];
    if (!validDifficulties.includes(difficulty)) {
        return res.status(400).json({ message: 'Invalid difficulty level.' });
    }

    try {
        // Check if the partner exists
        const partner = await User.findOne({ partnerUserId: partnerId });
        if (!partner) {
            return res.status(404).json({ message: 'Partner not found.' });
        }

        // Check if the partner is connected
        if (!partner.isConnected) {
            return res.status(400).json({ message: 'Partner is not connected. Connect your partner now.' });
        }

        // Create the challenge object
        const newChallenge = new Challenge({
            selfId: partnerId,  // Set partnerId as selfId
            partnerId: selfId,  // Set selfId as partnerId
            challenge,
            deadline,
            proofRequired,
            difficulty,
            coins:coins,
            status: 'pending' // Set the initial status to 'pending'
        });

        // Save the challenge to the database
        const savedChallenge = await newChallenge.save();
        res.status(201).json(savedChallenge);
    } catch (error) {
        console.error(error); // Log the error for debugging
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

            // Log the challenges fetched for debugging
            console.log('Fetched challenges:', challenges);

            // Filter challenges into pending and completed
            dashboardData.pendingChallenges = challenges.filter(challenge => challenge.status === 'pending');
            dashboardData.completedChallenges = challenges.filter(challenge => challenge.status === 'completed');
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
    const { partnerId } = req.params; // Get the selfId from the request parameters

    try {
        // Find all challenges where selfId matches
        const challenges = await Challenge.find({ selfId: partnerId });

        // Check if any challenges are found
        if (challenges.length === 0) {
            return res.status(404).json({ message: "No challenges found for this user." });
        }

        // Check if any challenges have a null partnerId
        const challengesWithNullPartner = challenges.filter(challenge => challenge.partnerId === null);
        if (challengesWithNullPartner.length > 0) {
            return res.status(200).json({ 
                message: "No partner connected. Connect your partner now.", 
                challenges 
            });
        }

        res.status(200).json(challenges);
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: "Server error." });
    }
};


exports.updatePartnersChallenge = async (req, res) => {
    const { challengeId } = req.params; // Destructure challengeId from params
    const updateData = req.body; // Extract the update data from the request body

    try {
        // Validate the provided update data (optional, can be customized based on requirements)
        if (!updateData || Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: "No update data provided." });
        }

        // Check if challengeId is a valid ObjectId
        if (!mongoose.isValidObjectId(challengeId)) {
            return res.status(400).json({ message: "Invalid challenge ID." });
        }

        // Update the challenge with the given ID
        const updatedChallenge = await Challenge.findByIdAndUpdate(challengeId, updateData, { new: true, runValidators: true });

        // Check if the challenge was found and updated
        if (!updatedChallenge) {
            return res.status(404).json({ message: "Challenge not found." });
        }

        // Return the updated challenge
        res.status(200).json(updatedChallenge);
    } catch (error) {
        // Log the error for debugging purposes
        console.error(error);
        // Check if the error is a validation error from mongoose
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
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
    const { challengeId, proofUrl } = req.body;

    try {

        if (!mongoose.isValidObjectId(challengeId) || !proofUrl) {
            return res.status(400).json({ message: 'Challenge ID and proof URL are required.' });
        }

        // Find the challenge by ID
        const completeChallenge = await Challenge.findById(challengeId);

        // Check if the challenge exists
        if (!completeChallenge) {
            return res.status(404).json({ message: "Challenge not found." });
        }

        // Check if the challenge is already completed
        if (completeChallenge.status === 'completed') {
            return res.status(400).json({ message: 'Challenge is already completed.' });
        }

        // Check if the challenge has expired
        const currentDate = new Date();
        const deadlineDate = new Date(completeChallenge.deadline); // Assuming `deadline` is stored in the Challenge model

        // If the challenge has expired
        if (currentDate > deadlineDate) {
            // Delete the expired challenge
            await Challenge.findByIdAndDelete(challengeId); // Delete the challenge from the database
            return res.status(400).json({ message: 'Challenge has expired! No coins will be awarded.' });
        }

        // Update the challenge status and proof URL
        completeChallenge.status = 'completed';
        completeChallenge.proofImage = proofUrl; // Assuming you want to save the proof URL in the Challenge model

        // Save the updated challenge
        await completeChallenge.save();

        // Add coins to the user for completing the challenge
        const userId = completeChallenge.selfId; // Assuming selfId is the user who created the challenge
        const coinsEarned = completeChallenge.coins; // Set the number of coins to be awarded (modify as needed)

        // Find the user and update their coins
        const user = await User.findOne({ userId: userId }); // Correct method casing

        if (user) {
            user.coins += coinsEarned; // Increase user's coins
            await user.save(); // Save the updated user
        } else {
            console.error(`User not found for ID: ${userId}`); // Log if user is not found
        }

        // Respond with the updated challenge data and coins added
        res.status(200).json({
            message: 'Challenge completed successfully.',
            challenge: completeChallenge,
            coinsAdded: coinsEarned
        });
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: 'Server error' });
    }
};