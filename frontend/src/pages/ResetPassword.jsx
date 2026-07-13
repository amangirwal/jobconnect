import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../api/services';

const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [email, setEmail] = useState(location.state?.email || '');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(location.state?.message || '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) {
            setError('Password must be at least 8 characters, include an uppercase letter, a number, and a special character.');
            return;
        }

        setLoading(true);

        try {
            const res = await resetPassword({ email, otp, newPassword });
            setSuccess(res.data.message || 'Password reset successfully! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. Please check your reset code.');
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl mt-12 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>

            <h2 className="text-3xl font-extrabold text-gray-900 mb-2 text-center">Reset Password</h2>
            <p className="text-sm text-gray-500 text-center mb-6">
                Enter your Gmail address, the 6-digit reset code, and your new password.
            </p>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 mb-5 rounded-xl text-sm transition-all">{error}</div>}
            {success && <div className="bg-green-50 border border-green-200 text-green-700 p-4 mb-5 rounded-xl text-sm transition-all">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
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

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">6-Digit Reset Code</label>
                    <input
                        type="text"
                        maxLength="6"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="e.g. 123456"
                        className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-3 text-sm focus:outline-none focus:ring-2 tracking-widest text-center font-bold text-lg"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-3 text-sm focus:outline-none focus:ring-2"
                        required
                    />
                    <p className="text-xs text-gray-400 mt-1">Must contain at least 8 chars, 1 uppercase, 1 number, and 1 symbol.</p>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm New Password</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-3 text-sm focus:outline-none focus:ring-2"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer transform hover:-translate-y-0.5'}`}
                >
                    {loading ? 'Resetting Password...' : 'Reset Password'}
                </button>
            </form>

            <div className="mt-6 text-center">
                <Link to="/login" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                    Cancel & Return to Login
                </Link>
            </div>
        </div>
    );
};

export default ResetPassword;
