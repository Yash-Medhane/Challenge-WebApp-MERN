const User = require('../model/user'); 
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken');

exports.loginUser = async (req, res) => {
    const { email, password } = req.body; 

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                coins: user.coins, 
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.registerUser = async (req,res)=>{
        const {username,email,password} = req.body;

        try {
            const existingUser = await User.findOne({email});

            if(existingUser){
                return res.status(400).json({message:'User already exists'});
            }
    
            const hashedPassword = await bcrypt.hash(password, 10);
    
            const newUser = ({
                username,
                email,
                password:hashedPassword,
                coins:0,
                isConnected:false
            });
    
            await newUser.save();
    
            res.status(200).json({message:'Registered succesfully'}); 
        } catch (error) {
            console.log(error);
            res.status(500).json({message: 'Server error'}); 
        }
}
exports.getUser = async (req,res)=>{
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const user = await User.findById(userId).select('-password'); // Exclude the password field

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            id: user._id,
            username: user.username,
            email: user.email,
            coins: user.coins,
            isConnected: user.isConnected,
            userId: user.userId,
            partnerUserId: user.partnerUserId,
            profilePicture: user.profilePicture,
            bio: user.bio,
            firstName: user.firstName,
            lastName: user.lastName,
            dateOfBirth: user.dateOfBirth,
            gender: user.gender,
            location: user.location,
            phoneNumber: user.phoneNumber,
            preferences: user.preferences,
            dateJoined: user.dateJoined,
            lastLogin: user.lastLogin
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.updateUser = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const { username, email, coins, isConnected, partnerUserId, profilePicture, bio, firstName, lastName, dateOfBirth, gender, location, phoneNumber, preferences } = req.body;

        const updatedUser = await User.findByIdAndUpdate(userId, {
            username,
            email,
            coins,
            isConnected,
            partnerUserId,
            profilePicture,
            bio,
            firstName,
            lastName,
            dateOfBirth,
            gender,
            location,
            phoneNumber,
            preferences
        }, { new: true, runValidators: true }).select('-password'); // Exclude password

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Updated response with all user data
        res.status(200).json({
            id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            coins: updatedUser.coins,
            isConnected: updatedUser.isConnected,
            userId: updatedUser.userId,
            partnerUserId: updatedUser.partnerUserId,
            profilePicture: updatedUser.profilePicture,
            bio: updatedUser.bio,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            dateOfBirth: updatedUser.dateOfBirth,
            gender: updatedUser.gender,
            location: updatedUser.location,
            phoneNumber: updatedUser.phoneNumber,
            preferences: updatedUser.preferences,
            dateJoined: updatedUser.dateJoined,
            lastLogin: updatedUser.lastLogin
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
