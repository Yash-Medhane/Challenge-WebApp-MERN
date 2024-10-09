const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
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
        unique: true,
        default: uuidv4   
    },
    partnerUserId: {
        type: String,
        default: null  
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
        type: String
    },
    lastName: {
        type: String
    },
    dateOfBirth: {
        type: Date
    },
    gender: {
        type: String,  
        enum: ['Male', 'Female', 'Other']
    },
    location: {
        type: String  
    },
    phoneNumber: {
        type: String,  
        unique: true
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
    }
});

module.exports = mongoose.model('User', userSchema);
