const mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema({
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
    rewardType: {
        type: String,
        enum: ['gold', 'diamond', 'silver'],
        required: true
    },
    reward: {
        type: String,
        required: true
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
    deadline: {
        type: Date,
        required:true
    }
});

module.exports = mongoose.model('Reward', rewardSchema);
