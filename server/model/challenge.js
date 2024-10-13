const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
    selfId: {
        type: String, 
        ref: 'User',
        required: true
    },
    partnerId: {
        type: String,
        ref: 'User',
        required: true
    },
    challenge: {
        type: String,
        required: true
    },
    coins:{
        type: Number,
        required: true
    },
    deadline: {
        type: Date,
        required: true
    },
    proofRequired: {
        type: Boolean,
        default: false
    },
    proofImage: {
        type: String,
        default:"default-url"
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'expired'],
        default: 'pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Challenge', challengeSchema);
