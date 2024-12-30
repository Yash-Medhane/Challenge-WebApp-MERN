const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authMiddleware } = require('../middleware/authMiddleware'); 
const path = require('path');



const userController = require('../controller/userController');
const challengeController = require('../controller/chController');
const rewardController = require('../controller/rewardController');
const connectionController = require('../controller/connectionController');
const chatController = require('../controller/chatController');

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/dashboard/:userId/profile', authMiddleware, userController.getUser);
router.put('/dashboard/:userId/profile',userController.updateUser);
router.delete('/dashboard/:userId/profile',userController.deleteUser);
router.get('/verify-email', userController.verifyEmail);

router.post('/dashboard/:userId/challenges/create', challengeController.createPartnersChallenge);
router.post('/dashboard/:userId/challenges/completed', challengeController.completeChallenge);
router.get('/dashboard/:userId', authMiddleware,challengeController.getUserDashboardData);
router.get('/dashboard/:userId/challenges/get', authMiddleware, challengeController.getPartnersChallenges);
router.delete('/challenges/:challengeId', challengeController.deletePartnersChallenge);

router.post('/dashboard/:userId/rewards/create', rewardController.createPartnersReward);
router.get('/dashboard/:userId/rewards/get-my-rewards', authMiddleware, rewardController.getUserRewards);
router.get('/dashboard/:userId/rewards/get', authMiddleware, rewardController.getPartnerReward);
router.delete('/rewards/:rewardId', rewardController.deletePartnerReward);
router.put('/dashboard/:userId/rewards/:rewardId/redeem', rewardController.redeemReward);

router.get('/dashboard/:userId/notifications', authMiddleware, connectionController.getUserNotifications);
router.get('/dashboard/:userId/notifications/count', authMiddleware, connectionController.getNotificationCount);
router.delete('/notifications/:notificationId', connectionController.deleteNotification);
router.post('/dashboard/:userId/partner/request', connectionController.sendPartnerRequest);
router.post('/dashboard/:userId/partner/accept', connectionController.acceptPartnerRequest);
router.put('/dashboard/:userId/profile/disconnect',connectionController.disConnect);


router.get('/dashboard/:userId/chat/get', authMiddleware,chatController.getUserPartnerData);

module.exports = router;
