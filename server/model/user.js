const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    coins: {
        type: Number,
        default: 0
    },
    isConnected: {
        type: Boolean,
        default: false
    },
    userId: {
        type: String,
        unique: true  
    },
    partnerUserId: {
        type: String,
        default: 'null'
    },
    profilePicture: {
        type: String,  
        default: 'default-profile-pic-url'  
    },
    bio: {
        type: String,  
        default: ''
    },
    firstName: {
        type: String,
        default: ''
    },
    lastName: {
        type: String,
        default: ''
    },
    dateOfBirth: {
        type: Date,
        default: null
    },
    gender: {
        type: String,  
        enum: ['Male', 'Female', 'Other']
    },
    location: {
        type: String,
        default: '' 
    },
    preferences: {
        receiveNotifications: { type: Boolean, default: true },
        theme: { type: String, default: 'light' }  
    },
    dateJoined: {
        type: Date,
        default: Date.now  
    },
    lastLogin: {
        type: Date  
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    verificationToken: {
        type: String,
    },
    tokenExpires: {
        type: Date,
    }
});

module.exports = mongoose.model('User', userSchema);
