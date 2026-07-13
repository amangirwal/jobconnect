const nodemailer = require('nodemailer');
const axios = require('axios');

const getTransporter = () => {
    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
};

exports.sendOtpEmail = async (email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your Job Connect Verification Code',
        text: `Your verification code is: ${otp}. It will expire in 10 minutes.`,
        html: `<p>Your verification code is: <strong>${otp}</strong></p><p>It will expire in 10 minutes.</p>`,
    };

    await this.sendEmail(mailOptions);
};

exports.sendResetOtpEmail = async (email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset Code for Job Connect',
        text: `Your password reset code is: ${otp}. It will expire in 10 minutes.`,
        html: `<p>Your password reset code is: <strong>${otp}</strong></p><p>It will expire in 10 minutes.</p>`,
    };

    await this.sendEmail(mailOptions);
};

exports.sendEmail = async (mailOptions) => {
    try {
        if (process.env.BREVO_API_KEY) {
            // Send using Brevo HTTP API (Port 443, never blocked by cloud hosts)
            await axios.post('https://api.brevo.com/v3/smtp/email', {
                sender: { name: 'JobConnect', email: process.env.EMAIL_USER || 'noreply@jobconnect.com' },
                to: [{ email: mailOptions.to }],
                subject: mailOptions.subject,
                htmlContent: mailOptions.html || mailOptions.text
            }, {
                headers: {
                    'api-key': process.env.BREVO_API_KEY,
                    'Content-Type': 'application/json'
                }
            });
            console.log(`Email sent via Brevo HTTP API to ${mailOptions.to}`);
        } else if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            // SMTP fallback for local development
            const transporter = getTransporter();
            await transporter.sendMail(mailOptions);
            console.log(`Email sent via SMTP to ${mailOptions.to}`);
        } else {
            console.log(`[DEV MODE] Mock Email to ${mailOptions.to}`);
            console.log(`Subject: ${mailOptions.subject}`);
            console.log(`Body: ${mailOptions.text || mailOptions.html}`);
        }
    } catch (error) {
        console.error('Error sending email:', error.response?.data || error.message || error);
    }
};
