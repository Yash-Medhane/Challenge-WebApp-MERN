const express = require('express');
const router = express.Router();
const { authMiddleware }  = require('../middleware/authMiddleware'); 

const userController = require('../controller/userController');
const challengeController = require('../controller/chController');
const rewardController = require('../controller/rewardController');
const connectionController = require('../controller/connectionController');

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/profile', userController.getUser);
router.put('/update', userController.updateUser);
router.delete('/delete', userController.deleteUser);
router.get('/verify-email', userController.verifyEmail);

router.post('/challenges', challengeController.createPartnersChallenge);
router.put('/challenges/completed', challengeController.completeChallenge);
router.get('/dashboard/:userId', challengeController.getUserDashboardData);
router.get('/challenges/:partnerId', challengeController.getPartnersChallenges);
router.put('/challenges/:challengeId', challengeController.updatePartnersChallenge);
router.delete('/challenges/:challengeId', challengeController.deletePartnersChallenge);

router.post('/rewards', rewardController.createReward);
router.get('/rewards/:userId', rewardController.getUserRewards);
router.get('/rewards/partner/:userId', rewardController.getPartnerReward);
router.delete('/rewards/:rewardId/delete', rewardController.deletePartnerReward);
router.put('/rewards/:rewardId/redeem', rewardController.redeemReward);

router.get('/notifications',connectionController.getUserNotifications);
router.delete('/notifications/:notificationId', connectionController.deleteNotification);
router.post('/partner/request', connectionController.sendPartnerRequest);
router.post('/partner/accept', connectionController.acceptPartnerRequest);
router.post('/partner/confirm', connectionController.confirmPartnerRequest);

module.exports = router; 