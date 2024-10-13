const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    receiverId: { 
        type: String, 
        ref: 'User', 
        required: true 
    },
    senderId: { 
        type: String, 
        ref: 'User', 
        required: true 
    },
    message: { 
        type: String, 
        required: true 
    },
    type: { 
        type: String, 
        enum: ['partner_request', 'challenge_update','partner_confirm', 'other'], 
        required: true 
    },
    isAccepted: { 
        type: Boolean, 
        default: false 
    },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
