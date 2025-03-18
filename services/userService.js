const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();

const otpGenerator = require('otp-generator');
const twilio = require('twilio');


// Twilio credentials (Replace with actual credentials)
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

// Temporary storage for OTPs (Use Redis in production)
const otpStore = new Map();


// register
exports.register = async ({ name,mobile, email, password, role }) => {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) throw new Error('Email already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);
    console.log(password);

    return await User.create({ name,mobile, email, password: hashedPassword, role });
};


// login
exports.login = async ({ email, password }) => {
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new Error('Invalid email or password');
    }

    const token = jwt.sign(
        { id: user.id, role: user.role }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1h' }
    );

    return {
        name: user.name,
        email: user.email,
        roleType: user.role,  
        token
    };
};

// exports.login = async ({ email, password }) => {
//     const user = await User.findOne({ where: { email } });
//     if (!user || !(await bcrypt.compare(password, user.password))) {
//         throw new Error('Invalid email or password');
//     }

//     //  Generate OTP
//     const otp = otpGenerator.generate(6, { digits: true, alphabets: false, specialChars: false });

//     // Store OTP (Use Redis/DB in production)
//     otpStore.set(user.id, otp);

//     //  Send OTP via Twilio (SMS)
//     await client.messages.create({
//         body: `Your OTP for login is: ${otp}`,
//         from: `+919685570292`,
//         to: user.mobile
//     });

//     return { message: 'OTP sent to registered mobile number' };
// };


// exports.verifyOtp = async ({ email, otp }) => {
//     const user = await User.findOne({ where: { email } });
//     if (!user) throw new Error('User not found');

//     const storedOtp = otpStore.get(user.id);
//     if (!storedOtp || storedOtp !== otp) {
//         throw new Error('Invalid OTP');
//     }

//     //  Generate JWT Token
//     const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

//     // Remove OTP after successful login
//     otpStore.delete(user.id);

//     return { message: 'Login successful', token };
// };


// get All users
exports.getAllUsers = async () => {
    const users = await User.findAll({
        attributes: { exclude: ['password'] }, // Exclude passwords for security
    });
    return users;
};


// get user by id
exports.getUserById = async (id) => {
    const user = await User.findByPk(id, { attributes: { exclude: ['password'] } });
    if (!user) throw new Error('User not found');
    return user;
};


// update user
exports.updateUser = async (id, data) => {
    const user = await User.findByPk(id);
    if (!user) throw new Error('User not found');

    return await user.update(data);
};


// delete user
exports.deleteUser = async (id) => {
    // Find user by primary key
    const user = await User.findByPk(id);
    
    console.log(user); // Debugging log

    if (!user) {
        throw new Error('User not found');
    }

    // Permanently delete the user from the database
    await user.destroy();
    
    return { message: 'User deleted successfully' };
};

