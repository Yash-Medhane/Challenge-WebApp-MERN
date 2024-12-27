const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authMiddleware } = require('../middleware/authMiddleware'); 
const path = require('path');

// Configure Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Specify the upload directory
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Use unique file names
    }
});

const upload = multer({ storage: storage });

const userController = require('../controller/userController');
const challengeController = require('../controller/chController');
const rewardController = require('../controller/rewardController');
const connectionController = require('../controller/connectionController');
const chatController = require('../controller/chatController');

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/dashboard/:userId/profile', userController.getUser);
router.put('/dashboard/:userId/profile', userController.updateUser);
router.delete('/dashboard/:userId/profile', userController.deleteUser);
router.get('/verify-email', userController.verifyEmail);

router.post('/dashboard/:userId/challenges/create', challengeController.createPartnersChallenge);
router.post('/dashboard/:userId/challenges/completed', challengeController.completeChallenge);
router.get('/dashboard/:userId', challengeController.getUserDashboardData);
router.get('/dashboard/:userId/challenges/get', challengeController.getPartnersChallenges);
router.delete('/challenges/:challengeId', challengeController.deletePartnersChallenge);

router.post('/dashboard/:userId/rewards/create', rewardController.createPartnersReward);
router.get('/dashboard/:userId/rewards/get-my-rewards', rewardController.getUserRewards);
router.get('/dashboard/:userId/rewards/get', rewardController.getPartnerReward);
router.delete('/rewards/:rewardId', rewardController.deletePartnerReward);
router.put('/dashboard/:userId/rewards/:rewardId/redeem', rewardController.redeemReward);

router.get('/dashboard/:userId/notifications', connectionController.getUserNotifications);
router.get('/dashboard/:userId/notifications/count', connectionController.getNotificationCount);
router.delete('/notifications/:notificationId', connectionController.deleteNotification);
router.post('/dashboard/:userId/partner/request', connectionController.sendPartnerRequest);
router.post('/dashboard/:userId/partner/accept', connectionController.acceptPartnerRequest);

// Chat routes
router.get('/dashboard/:userId/chat/get', chatController.getUserPartnerData);

module.exports = router;
