const User = require('../model/user'); 
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid'); 
const nodemailer = require('nodemailer');
const crypto = require('crypto');

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        // Check if user exists
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user is verified
        if (!user.isVerified) {
            return res.status(400).json({ message: 'Please verify your email before logging in.' });
        }

        // Check if the password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate a token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'yashmedhane43@gmail.com',   
        pass: 'udiv ylym yeyb arpa'  // Use the app password if using Gmail
    }
});

exports.registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate UUID for the userId
        const userId = uuidv4();  // Use uuid to generate a unique userId

        // Generate a verification token and set its expiry time (1 hour)
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const tokenExpires = Date.now() + 3600000; // Token valid for 1 hour

        // Create a new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            coins: 0,
            isConnected: false,
            userId: userId,
            verificationToken: verificationToken,
            tokenExpires: tokenExpires,
            isVerified: false,  // Set verification status to false initially
        });

        await newUser.save();

        // Create the verification link
        const verificationLink = `http://localhost:5000/verify-email?token=${verificationToken}&email=${email}`;

        // Send verification email
        const mailOptions = {
            from: 'yashmedhane43@gmail.com',
            to: email,
            subject: 'Verify your email address for Login',
            text: `Click the link to verify your email address: ${verificationLink}`,
            html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #4CAF50;">Welcome to [Your App Name]!</h2>
                
                <p>Hi ${username},</p>
        
                <p>Thank you for registering with [Your App Name]. We're excited to have you on board! To complete your registration and get started, please verify your email address by clicking the button below:</p>
        
                <p style="text-align: center;">
                    <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; font-size: 16px; font-weight: bold; color: #fff; background-color: #4CAF50; border-radius: 5px; text-decoration: none;">Verify Email Address</a>
                </p>
        
                <p>If the button above doesn't work, you can also click the following link or copy and paste it into your browser:</p>
        
                <p><a href="${verificationLink}" style="color: #4CAF50;">${verificationLink}</a></p>
        
                <p>This link is valid for only 1 hour. If you don't verify your email within this time, you'll need to request a new verification link.</p>
        
                <p>If you didn't sign up for [Your App Name], please ignore this email and no action will be taken.</p>
        
                <p>Thank you,<br>The [Your App Name] Team</p>
        
                <hr>
                <p style="font-size: 12px; color: #999;">If you have any issues, feel free to contact our support team at support@[yourdomain].com</p>
            </div>
        `
         // Optional: HTML email
        };

        // Send the email
        await transporter.sendMail(mailOptions);

        // Send a response with a message and userId
        res.status(200).json({ 
            message: 'Registered successfully. Please check your email to verify your account.', 
            userId: newUser.userId 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.verifyEmail = async (req, res) => {
    const { token, email } = req.query;

    try {
        // Find the user with the matching token and email
        const user = await User.findOne({ email, verificationToken: token });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification token' });
        }

        // Check if the token is expired
        if (Date.now() > user.tokenExpires) {
            return res.status(400).json({ message: 'Verification token has expired' });
        }

        // Mark the user as verified
        user.isVerified = true;
        user.verificationToken = null;  // Clear the token
        user.tokenExpires = null;       // Clear the token expiration
        await user.save();

        res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
};


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






