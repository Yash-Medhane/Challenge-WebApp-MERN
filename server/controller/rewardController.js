const Reward = require('../model/Reward'); // Import your Reward model
const User = require('../model/user')

exports.createReward = async (req, res) => {
    const { selfId, partnerId, rewardType, reward, coinsRequired,deadline } = req.body;

    try {
        // Validate required fields
        if (!selfId || !partnerId || !rewardType || !coinsRequired || !deadline) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Create a new reward
        const newReward = new Reward({
            selfId:partnerId,
            partnerId:selfId,
            rewardType,
            reward,
            coinsRequired,
            deadline
        });

        // Save the reward to the database
        const savedReward = await newReward.save();

        // Respond with the created reward data
        res.status(201).json({
            message: 'Reward created successfully.',
            reward: savedReward
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get rewards for a specific user
exports.getUserRewards = async (req, res) => {
    const userId = req.params.userId;

    try {
        // Find the user by ID
        const user = await User.findOne({userId:userId});
        
        // Check if the user exists
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Check if the user has a partner
        if (!user.partnerUserId) { // Assuming partnerId is the field used to store the partner's ID
            return res.status(404).json({ message: 'No partner connected.' });
        }

        // If partner found, fetch rewards related to the user or their partner
        const rewards = await Reward.find({
            $or: [
                { selfId: userId },
                { partnerId: user.partnerId }
            ]
        });

        // Check if any rewards were found
        if (rewards.length === 0) {
            return res.status(404).json({ message: 'No rewards found for this user.' });
        }

        // Return rewards found
        res.status(200).json(rewards);
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: 'Server error.' });
    }
};


// Get a specific reward by ID
exports.getPartnerReward = async (req, res) => {
    const userId = req.params.userId;

    try {
        // Find the user by ID
        const user = await User.findOne({userId:userId});
        
        // Check if the user exists
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Check if the user has a partner
        if (!user.partnerUserId) { // Assuming partnerId is the field used to store the partner's ID
            return res.status(404).json({ message: 'No partner connected.' });
        }

        // If partner found, fetch rewards related to the user or their partner
        const rewards = await Reward.find({
            $or: [
                { selfId: user.partnerId },
                { partnerId: userId }
            ]
        });

        // Check if any rewards were found
        if (rewards.length === 0) {
            return res.status(404).json({ message: 'No rewards found for this user.' });
        }

        // Return rewards found
        res.status(200).json(rewards);
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: 'Server error.' });
    }
};

// Delete a specific reward by ID
exports.deletePartnerReward = async (req, res) => {
    try {
        // Find the reward by ID and delete it
        const deletedReward = await Reward.findByIdAndDelete(req.params.rewardId);

        // If no reward is found, return a 404 error
        if (!deletedReward) {
            return res.status(404).json({ message: "Reward not found" });
        }

        // If the reward is successfully deleted, return a success message
        res.status(200).json({ message: "Reward deleted successfully" });
    } catch (error) {
        // Handle any errors and return a 500 error message
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Redeem a specific reward
exports.redeemReward = async (req, res) => {
    try {
        // Find the reward by ID
        const reward = await Reward.findById(req.params.rewardId);

        // Check if the reward exists
        if (!reward) {
            return res.status(404).json({ message: "Reward not found" });
        }

        // Check if the reward has already been redeemed
        if (reward.redeemed) {
            return res.status(400).json({ message: "Reward already redeemed." });
        }

        // Find the user who is redeeming the reward (selfId is assumed to be in the reward object)
        const user = await User.findOne({userId:reward.selfId});
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Check if the user has enough coins to redeem the reward
        if (user.coins < reward.coinsRequired) {
            return res.status(400).json({ message: "Not enough coins to redeem this reward." });
        }

        // Deduct the coins required for the reward
        user.coins -= reward.coinsRequired;
        await user.save(); // Save the updated user data

        // Mark the reward as redeemed and set the redeemedAt timestamp
        reward.redeemed = true;
        reward.redeemedAt = new Date(); // Set the current date and time of redemption

        // Save the updated reward
        await reward.save();

        // Return a success response
        res.status(200).json({
            message: "Reward redeemed successfully.",
            reward: reward,
            user: {
                userId: user._id,
                remainingCoins: user.coins
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
