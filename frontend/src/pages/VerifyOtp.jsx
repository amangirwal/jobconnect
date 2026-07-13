import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { resendOtp } from '../api/services';

const VerifyOtp = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { verifyOtp } = useAuth();

    // Retrieve email from routing state or allow user to type it if not present
    const [email, setEmail] = useState(location.state?.email || '');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(location.state?.message || '');
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(60);
    const [isResending, setIsResending] = useState(false);

    const inputRefs = [
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
    ];

    useEffect(() => {
        // Start countdown timer for resending OTP
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    const handleOtpChange = (index, value) => {
        // Only accept numbers
        if (value && isNaN(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1); // Get last typed char
        setOtp(newOtp);

        // Move to next input box
        if (value && index < 5) {
            inputRefs[index + 1].current.focus();
        }

        // Trigger automatic verification if all digits are entered
        const fullOtp = newOtp.join('');
        if (fullOtp.length === 6 && email) {
            handleVerify(email, fullOtp);
        }
    };

    const handleKeyDown = (index, e) => {
        // Move to previous box on backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs[index - 1].current.focus();
        }
    };

    const handleVerifySubmit = (e) => {
        e.preventDefault();
        const fullOtp = otp.join('');
        if (fullOtp.length !== 6) {
            setError('Please enter a 6-digit code');
            return;
        }
        if (!email) {
            setError('Email is required');
            return;
        }
        handleVerify(email, fullOtp);
    };

    const handleVerify = async (emailAddress, otpCode) => {
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            await verifyOtp(emailAddress, otpCode);
            setSuccess('Verification successful! Logging you in...');
            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed. Please try again.');
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email) {
            setError('Please provide your email address first.');
            return;
        }
        setError('');
        setSuccess('');
        setIsResending(true);
        try {
            const res = await resendOtp({ email });
            setSuccess(res.data.message || 'Verification code resent. Please check your Gmail.');
            setResendTimer(60); // Reset cooldown timer
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend code');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl mt-12 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>

            <h2 className="text-3xl font-extrabold text-gray-900 mb-2 text-center">Verify Email</h2>
            <p className="text-sm text-gray-500 text-center mb-6">
                We've sent a 6-digit verification code to your Gmail address.
            </p>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 mb-5 rounded-xl text-sm transition-all">{error}</div>}
            {success && <div className="bg-green-50 border border-green-200 text-green-700 p-4 mb-5 rounded-xl text-sm transition-all">{success}</div>}

            <form onSubmit={handleVerifySubmit} className="space-y-6">
                {/* Email verification input if not passed from state */}
                {!location.state?.email && (
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Gmail Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="yourname@gmail.com"
                            className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-3 text-sm focus:outline-none focus:ring-2"
                            required
                        />
                    </div>
                )}

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">Verification Code</label>
                    <div className="flex justify-between gap-2">
                        {otp.map((digit, idx) => (
                            <input
                                key={idx}
                                ref={inputRefs[idx]}
                                type="text"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleOtpChange(idx, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(idx, e)}
                                className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                                required
                            />
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer transform hover:-translate-y-0.5'}`}
                >
                    {loading ? 'Verifying...' : 'Verify Code'}
                </button>
            </form>

            <div className="mt-8 text-center border-t border-gray-100 pt-6">
                <p className="text-sm text-gray-500">
                    Didn't receive the email?{' '}
                    {resendTimer > 0 ? (
                        <span className="text-indigo-600 font-semibold">Resend in {resendTimer}s</span>
                    ) : (
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={isResending}
                            className="text-indigo-600 font-bold hover:text-indigo-800 focus:outline-none cursor-pointer underline hover:no-underline"
                        >
                            {isResending ? 'Sending...' : 'Resend Code'}
                        </button>
                    )}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                    Make sure to check your spam folder if it doesn't arrive.
                </p>
            </div>
        </div>
    );
};

export default VerifyOtp;
