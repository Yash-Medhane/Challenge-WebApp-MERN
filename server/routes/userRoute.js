const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); 
router.use(authMiddleware);

const userController = require('../controller/userController');
const challengeController = require('../controller/chController');
// const rewardController = require('../controller/rewardController');

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/profile', userController.getUser);
router.put('/update', userController.updateUser);
router.delete('/delete', userController.deleteUser);

router.post('/challenges', challengeController.createChallenge);
router.get('/challenges/:userId', challengeController.getChallengesByUserId);
router.get('/challenges/:challengeId', challengeController.getChallengeById);
router.put('/challenges/:challengeId', challengeController.updateChallenge);
router.delete('/challenges/:challengeId', challengeController.deleteChallenge);

router.post('/rewards', rewardController.createReward);
router.get('/rewards/:userId', rewardController.getRewardsByUserId);
router.get('/rewards/:rewardId', rewardController.getRewardById);
router.put('/rewards/:rewardId/delete', rewardController.deleteReward);
router.put('/rewards/:rewardId/redeem', rewardController.redeemReward);

router.post('/connect', userController.connectUsers);
router.get('/connect/:userId', userController.getConnectedUser);

module.exports = router; 