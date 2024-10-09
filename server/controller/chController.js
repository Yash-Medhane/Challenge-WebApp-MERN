const Challenge = require('../model/Challenge'); // Import your Challenge model

exports.createChallenge = async (req, res) => {
    try {
        const newChallenge = new Challenge(req.body);
        const savedChallenge = await newChallenge.save();
        res.status(201).json(savedChallenge);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getChallengesByUserId = async (req, res) => {
    try {
        const challenges = await Challenge.find({ userId: req.params.userId });
        res.status(200).json(challenges);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getChallengeById = async (req, res) => {
    try {
        const challenge = await Challenge.findById(req.params.challengeId);
        if (!challenge) return res.status(404).json({ message: "Challenge not found" });
        res.status(200).json(challenge);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateChallenge = async (req, res) => {
    try {
        const updatedChallenge = await Challenge.findByIdAndUpdate(req.params.challengeId, req.body, { new: true });
        if (!updatedChallenge) return res.status(404).json({ message: "Challenge not found" });
        res.status(200).json(updatedChallenge);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteChallenge = async (req, res) => {
    try {
        const deletedChallenge = await Challenge.findByIdAndDelete(req.params.challengeId);
        if (!deletedChallenge) return res.status(404).json({ message: "Challenge not found" });
        res.status(200).json({ message: "Challenge deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
