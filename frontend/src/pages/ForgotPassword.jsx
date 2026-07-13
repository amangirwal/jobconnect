import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { forgotPassword } from '../api/services';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const res = await forgotPassword({ email });
            setSuccess(res.data.message || 'Reset code sent. Redirecting to password reset page...');
            setTimeout(() => {
                navigate('/reset-password', { state: { email, message: res.data.message } });
            }, 1800);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send password reset code.');
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl mt-12 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>

            <h2 className="text-3xl font-extrabold text-gray-900 mb-2 text-center">Forgot Password?</h2>
            <p className="text-sm text-gray-500 text-center mb-6">
                Enter your Gmail address and we will send you a code to reset your password.
            </p>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 mb-5 rounded-xl text-sm transition-all">{error}</div>}
            {success && <div className="bg-green-50 border border-green-200 text-green-700 p-4 mb-5 rounded-xl text-sm transition-all">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
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

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer transform hover:-translate-y-0.5'}`}
                >
                    {loading ? 'Sending Code...' : 'Send Reset Code'}
                </button>
            </form>

            <div className="mt-6 text-center">
                <Link to="/login" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                    &larr; Back to Login
                </Link>
            </div>
        </div>
    );
};

export default ForgotPassword;
