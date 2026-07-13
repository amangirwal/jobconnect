import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Briefcase, MoreVertical, Menu, X } from 'lucide-react';
import api from '../api/axios';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [unreadAppsCount, setUnreadAppsCount] = useState(0);
    const [notification, setNotification] = useState(null);
    const appCountRef = useRef(null);

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

    const checkApplications = async () => {
        if (user && user.role === 'RECRUITER') {
            try {
                const res = await api.get('/applications/recruiter-total-count');
                const newCount = res.data.count;
                
                if (appCountRef.current !== null && newCount > appCountRef.current) {
                    setNotification("A new candidate has applied to one of your job listings.");
                }
                appCountRef.current = newCount;
                setUnreadAppsCount(newCount);
            } catch (err) {
                console.error("Failed to check applications count", err);
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
        if (user) {
            checkUnread();
            if (user.role === 'RECRUITER') {
                checkApplications();
            }
            const interval = setInterval(() => {
                checkUnread();
                if (user.role === 'RECRUITER') {
                    checkApplications();
                }
            }, 10000); // Poll every 10s
            return () => clearInterval(interval);
        }
    }, [user]);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

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
                    <div className="hidden md:flex items-center space-x-6">
                        {user ? (
                            <>
                                <Link to="/profile" className="text-gray-700 hover:text-indigo-600 font-medium px-3 py-2 rounded-md transition-colors">
                                    {user.name}
                                </Link>
                                {user.role === 'RECRUITER' ? (
                                    <>
                                        <Link to="/create-job" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">Post a Job</Link>
                                        <Link
                                            to="/my-jobs"
                                            onClick={() => setUnreadAppsCount(0)}
                                            className="relative text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                        >
                                            My Jobs
                                            {unreadAppsCount > 0 && (
                                                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-[10px] items-center justify-center font-bold">
                                                        {unreadAppsCount}
                                                    </span>
                                                </span>
                                            )}
                                        </Link>
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
                    {/* Hamburger Button for Mobile */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-gray-500 hover:text-gray-700 p-2 rounded-md hover:bg-gray-100 cursor-pointer focus:outline-none"
                            title="Menu"
                        >
                            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-2 pb-4 space-y-1 shadow-inner animate-fade-in">
                    {user ? (
                        <>
                            <div className="px-3 py-2 text-sm font-semibold text-gray-900 border-b border-gray-100 mb-2">
                                Welcome, {user.name}
                            </div>
                            <Link
                                to="/profile"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
                            >
                                My Profile
                            </Link>
                            {user.role === 'RECRUITER' ? (
                                <>
                                    <Link
                                        to="/create-job"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
                                    >
                                        Post a Job
                                    </Link>
                                    <Link
                                        to="/my-jobs"
                                        onClick={() => {
                                            setUnreadAppsCount(0);
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
                                    >
                                        <span>My Jobs</span>
                                        {unreadAppsCount > 0 && (
                                            <span className="inline-flex rounded-full h-5 px-2 bg-red-500 text-white text-[10px] items-center justify-center font-bold">
                                                {unreadAppsCount}
                                            </span>
                                        )}
                                    </Link>
                                </>
                            ) : (
                                <Link
                                    to="/my-applications"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
                                >
                                    My Applications
                                </Link>
                            )}
                            <Link
                                to="/my-chats"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
                            >
                                <span>Messages</span>
                                {unreadCount > 0 && (
                                    <span className="inline-flex rounded-full h-5 px-2 bg-red-500 text-white text-[10px] items-center justify-center font-bold animate-pulse">
                                        {unreadCount}
                                    </span>
                                )}
                            </Link>
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setIsMobileMenuOpen(false);
                                }}
                                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-gray-50 flex items-center cursor-pointer transition-colors"
                            >
                                <LogOut className="h-4 w-4 mr-2" /> Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Login
                            </Link>
                            <Link
                                to="/signup"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block px-3 py-2 rounded-md text-base font-medium text-indigo-600 hover:bg-gray-50 transition-colors"
                            >
                                Signup
                            </Link>
                        </>
                    )}
                </div>
            )}
            
            {/* Notification Toast */}
            {notification && (
                <div className="fixed bottom-5 right-5 z-50 max-w-sm bg-white border border-indigo-100 rounded-lg shadow-2xl p-4 flex items-center justify-between gap-4 animate-bounce">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 text-indigo-600 p-2 rounded-full">
                            <Briefcase className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 text-sm">New Application Received!</p>
                            <p className="text-xs text-gray-500 mt-0.5">{notification}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setNotification(null)}
                        className="text-gray-400 hover:text-gray-600 font-medium text-xl leading-none cursor-pointer"
                    >
                        &times;
                    </button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
