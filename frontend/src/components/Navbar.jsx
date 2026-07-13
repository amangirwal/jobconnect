import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Briefcase, MoreVertical, Menu, X } from 'lucide-react';
import api from '../api/axios';

const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
};

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
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 mt-4 relative z-50">
            <nav className="bg-white border border-gray-150/80 shadow-sm rounded-2xl px-6 transition-all duration-300">
                <div className="mx-auto">
                <div className="flex justify-between h-14 items-center">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center transform hover:scale-[1.02] transition-transform">
                            <span className="text-xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-transparent bg-clip-text">JobConnect</span>
                        </Link>
                    </div>
                    <div className="hidden md:flex items-center space-x-2">
                        {user ? (
                            <>
                                <Link to="/profile" className="flex items-center gap-2 text-gray-750 hover:text-indigo-650 font-semibold px-3 py-1.5 rounded-full hover:bg-indigo-50/50 text-sm transition-all">
                                    <span className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-650 text-white text-[11px] flex items-center justify-center font-extrabold shadow-sm uppercase shrink-0">
                                        {getInitials(user.name)}
                                    </span>
                                    <span>{user.name}</span>
                                </Link>
                                {user.role === 'RECRUITER' ? (
                                    <>
                                        <Link to="/create-job" className="text-gray-500 hover:text-indigo-600 px-3 py-1.5 rounded-full hover:bg-indigo-50/50 text-sm font-semibold transition-all">Post a Job</Link>
                                        <Link
                                            to="/my-jobs"
                                            onClick={() => setUnreadAppsCount(0)}
                                            className="relative text-gray-500 hover:text-indigo-600 px-3 py-1.5 rounded-full hover:bg-indigo-50/50 text-sm font-semibold transition-all"
                                        >
                                            My Jobs
                                            {unreadAppsCount > 0 && (
                                                <span className="absolute top-1 right-0 flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                                </span>
                                            )}
                                        </Link>
                                    </>
                                ) : (
                                    <Link to="/my-applications" className="text-gray-500 hover:text-indigo-600 px-3 py-1.5 rounded-full hover:bg-indigo-50/50 text-sm font-semibold transition-all">My Applications</Link>
                                )}

                                <Link to="/my-chats" className="relative text-gray-500 hover:text-indigo-600 px-3 py-1.5 rounded-full hover:bg-indigo-50/50 text-sm font-semibold transition-all">
                                    Messages
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1 right-0 flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                        </span>
                                    )}
                                </Link>

                                <div className="relative" ref={menuRef}>
                                    <div>
                                        <button
                                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                                            className="rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer p-1 hover:bg-indigo-50/50 transition-colors"
                                        >
                                            <span className="sr-only">Open user menu</span>
                                            <MoreVertical className="h-5 w-5 text-gray-500" />
                                        </button>
                                    </div>
                                    {isMenuOpen && (
                                        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-2xl shadow-xl py-1 bg-white border border-gray-100 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 flex items-center rounded-xl transition-all"
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
                                <Link to="/login" className="text-gray-600 hover:text-indigo-600 font-semibold px-4 py-1.5 rounded-full text-sm transition-all">
                                    Login
                                </Link>
                                <Link to="/signup" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-1.5 rounded-full text-sm transition-all shadow-md shadow-indigo-500/10">
                                    Signup
                                </Link>
                            </>
                        )}
                    </div>
                    {/* Hamburger Button for Mobile */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-gray-500 hover:text-indigo-600 p-2 rounded-full hover:bg-indigo-50/50 cursor-pointer focus:outline-none transition-colors"
                            title="Menu"
                        >
                            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="absolute top-16 left-0 right-0 md:hidden bg-white/95 backdrop-blur-md border border-gray-100 rounded-2xl p-4 space-y-1 shadow-xl shadow-indigo-950/10 animate-fade-in z-50">
                    {user ? (
                        <>
                            <div className="px-3 py-2 text-sm font-semibold text-gray-900 border-b border-gray-100 mb-2 flex items-center gap-2">
                                <span className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-650 text-white text-[11px] flex items-center justify-center font-bold shadow-sm uppercase shrink-0">
                                    {getInitials(user.name)}
                                </span>
                                <span>{user.name}</span>
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
    </div>
    );
};

export default Navbar;
