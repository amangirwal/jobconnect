import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Briefcase, MoreVertical } from 'lucide-react';
import api from '../api/axios';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const [unreadCount, setUnreadCount] = useState(0);

    const checkUnread = async () => {
        if (user) {
            try {
                const res = await api.get('/applications/chats/unread-count');
                setUnreadCount(res.data.count);
            } catch (err) {
                console.error("Failed to check unread", err);
            }
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        checkUnread();
        const interval = setInterval(checkUnread, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-white shadow-sm border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">JobConnect</span>
                        </Link>
                    </div>
                    <div className="flex items-center space-x-6">
                        {user ? (
                            <>
                                <Link to="/profile" className="text-gray-700 hover:text-indigo-600 font-medium px-3 py-2 rounded-md transition-colors">
                                    {user.name}
                                </Link>
                                {user.role === 'RECRUITER' ? (
                                    <>
                                        <Link to="/create-job" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">Post a Job</Link>
                                        <Link to="/my-jobs" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">My Jobs</Link>
                                    </>
                                ) : (
                                    <Link to="/my-applications" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">My Applications</Link>
                                )}

                                <Link to="/my-chats" className="relative text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                    Messages
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-[10px] items-center justify-center font-bold">
                                                {unreadCount}
                                            </span>
                                        </span>
                                    )}
                                </Link>

                                <div className="relative" ref={menuRef}>
                                    <div>
                                        <button
                                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                                            className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer p-1 hover:bg-gray-100"
                                        >
                                            <span className="sr-only">Open user menu</span>
                                            <MoreVertical className="h-6 w-6 text-gray-500" />
                                        </button>
                                    </div>
                                    {isMenuOpen && (
                                        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                            >
                                                <LogOut className="h-4 w-4 mr-2" />
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium mr-4">
                                    Login
                                </Link>
                                <Link to="/signup" className="text-indigo-600 hover:text-indigo-900 font-medium">
                                    Signup
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
