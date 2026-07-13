const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const prisma = require('../utils/db');
const { sendOtpEmail, sendResetOtpEmail } = require('../utils/emailService');

const signupSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    name: z.string().min(2, 'Name is required'),
    role: z.enum(['CANDIDATE', 'RECRUITER'], {
        errorMap: () => ({ message: 'Role must be either CANDIDATE or RECRUITER' }),
    }),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

exports.signup = async (req, res) => {
    try {
        const { email, password, name, role } = signupSchema.parse(req.body);
        const hashedPassword = await bcrypt.hash(password, 10);

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            if (!existingUser.isVerified) {
                // If the user registered but didn't verify, regenerate the OTP and send them to the verify screen
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

                await prisma.user.update({
                    where: { id: existingUser.id },
                    data: {
                        otp,
                        otpExpiresAt,
                        // Update details if they want to modify their name/role/password
                        password: hashedPassword,
                        name,
                        role
                    }
                });

                sendOtpEmail(email, otp).catch(err => console.error("Background OTP resend failed", err));

                return res.status(200).json({
                    message: 'An unverified account with this email already exists. A new verification OTP has been sent to your Gmail.',
                    email: existingUser.email
                });
            }
            return res.status(400).json({ message: 'User already exists' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role,
                isVerified: false,
                otp,
                otpExpiresAt,
            },
        });

        // Send OTP in background to prevent HTTP gateway timeout
        sendOtpEmail(email, otp).catch(err => console.error("Background OTP send failed", err));

        res.status(201).json({
            message: 'Signup successful. A verification OTP has been sent to your Gmail.',
            email: newUser.email
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors[0].message });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if user is verified
        if (!user.isVerified) {
            return res.status(403).json({
                message: 'Please verify your email before logging in.',
                unverified: true,
                email: user.email
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors[0].message });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'User is already verified' });
        }

        if (!user.otp || user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (new Date() > user.otpExpiresAt) {
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        // Mark user as verified
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                otp: null,
                otpExpiresAt: null
            }
        });

        // Log the user in directly by returning a token
        const token = jwt.sign(
            { userId: updatedUser.id, role: updatedUser.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Email verified successfully',
            token,
            user: { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'User is already verified' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await prisma.user.update({
            where: { id: user.id },
            data: {
                otp,
                otpExpiresAt
            }
        });

        // Send OTP in background to prevent HTTP gateway timeout
        sendOtpEmail(email, otp).catch(err => console.error("Background OTP resend failed", err));

        res.json({ message: 'A new verification OTP has been sent to your Gmail.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.isVerified) {
            return res.status(400).json({ message: 'User email is not verified yet.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await prisma.user.update({
            where: { id: user.id },
            data: {
                otp,
                otpExpiresAt
            }
        });

        // Send Reset OTP in background to prevent HTTP gateway timeout
        sendResetOtpEmail(email, otp).catch(err => console.error("Background Reset OTP send failed", err));

        res.json({ message: 'A password reset OTP has been sent to your Gmail.', email });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: 'Email, OTP, and new password are required' });
        }

        // Validate new password rules (same rules as signup)
        if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) {
            return res.status(400).json({ message: 'Password must be at least 8 characters, include an uppercase letter, a number, and a special character.' });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.otp || user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (new Date() > user.otpExpiresAt) {
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                otp: null,
                otpExpiresAt: null
            }
        });

        res.json({ message: 'Password reset successful. You can now log in.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
