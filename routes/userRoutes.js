const express = require('express');
const { register, login, getUser, updateUser, deleteUser, getAllUsers, verifyOtp } = require('../controller/userController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/getUser/:id', authMiddleware,getUser);
router.get('/getAllUsers', getAllUsers);
router.put('/updateUser/:id', authMiddleware, updateUser);
router.delete('/deleteUser/:id', authMiddleware, deleteUser);


router.post('/verify-otp', verifyOtp);


module.exports = router;
