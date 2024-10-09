const Reward = require('../models/Reward'); // Import your Reward model

// Create a new reward
exports.createReward = async (req, res) => {
    try {
        const newReward = new Reward(req.body);
        const savedReward = await newReward.save();
        res.status(201).json(savedReward);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get rewards for a specific user
exports.getRewardsByUserId = async (req, res) => {
    try {
        const rewards = await Reward.find({ userId: req.params.userId }); // Adjust query based on your schema
        res.status(200).json(rewards);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get a specific reward by ID
exports.getRewardById = async (req, res) => {
    try {
        const reward = await Reward.findById(req.params.rewardId);
        if (!reward) return res.status(404).json({ message: "Reward not found" });
        res.status(200).json(reward);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a specific reward by ID
exports.deleteReward = async (req, res) => {
    try {
        const deletedReward = await Reward.findByIdAndDelete(req.params.rewardId);
        if (!deletedReward) return res.status(404).json({ message: "Reward not found" });
        res.status(200).json({ message: "Reward deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Redeem a specific reward
exports.redeemReward = async (req, res) => {
    try {
        const reward = await Reward.findById(req.params.rewardId);
        if (!reward) return res.status(404).json({ message: "Reward not found" });

        if (reward.redeemed) return res.status(400).json({ message: "Reward already redeemed" });

        reward.redeemed = true;
        reward.redeemedAt = Date.now();
        await reward.save();

        res.status(200).json({ message: "Reward redeemed successfully", reward });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
