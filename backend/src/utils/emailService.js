const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', // You can configure this based on env vars
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

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
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            await transporter.sendMail(mailOptions);
            console.log(`Email sent to ${mailOptions.to}`);
        } else {
            console.log(`[DEV MODE] Mock Email to ${mailOptions.to}`);
            console.log(`Subject: ${mailOptions.subject}`);
            console.log(`Body: ${mailOptions.text || mailOptions.html}`);
        }
    } catch (error) {
        console.error('Error sending email:', error);
    }
};
