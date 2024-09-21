const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Email setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Signup controller
exports.signup = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await Student.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'Email already in use' });

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate a random verification code
        const verificationCode = crypto.randomBytes(3).toString('hex').toUpperCase();

        // Save student data with the verification code and unverified email status
        const student = new Student({ name, email, password: hashedPassword, verificationCode });
        await student.save();

        // Send verification email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Email Verification',
            text: `Hello ${name},\n\nYour verification code is: ${verificationCode}`,
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ message: 'Failed to send verification email', error: err });
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        res.status(200).json({ message: 'Signup successful. Check your email for the verification code.' });
    } catch (error) {
        res.status(500).json({ message: 'Error during signup', error });
    }
};

// Email verification controller
exports.verifyEmail = async (req, res) => {
    const { email, verificationCode } = req.body;

    try {
        // Find the user with the provided email and verification code
        const student = await Student.findOne({ email, verificationCode });

        if (!student) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        // Mark the email as verified and clear the verification code
        student.emailVerified = true;
        student.verificationCode = undefined;  // Remove the code after verification
        await student.save();

        res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying email', error });
    }
};


// Login controller
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const student = await Student.findOne({ email });
        if (!student) return res.status(400).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Send login email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: student.email,
            subject: 'Login Successful',
            text: `Hello ${student.name}, you have successfully logged in!`,
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log(err);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        res.json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
