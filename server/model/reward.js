const mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema({
    selfId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    partnerId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    rewardType: {
        type: String,
        enum: ['gold', 'diamond', 'silver'],
        required: true
    },
    description: {
        type: String
    },
    coinsRequired: {
        type: Number,
        required: true
    },
    redeemed: {
        type: Boolean,
        default: false
    },
    deleted: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    redeemedAt: {
        type: Date,
        default: null
    }
});

module.exports = mongoose.model('Reward', rewardSchema);
