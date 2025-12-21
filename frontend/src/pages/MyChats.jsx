import React, { useEffect, useState } from 'react';
import { getMyChats } from '../api/services';
import { useAuth } from '../context/AuthContext';
import ChatWindow from '../components/ChatWindow';

const MyChats = () => {
    const { user } = useAuth();
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeChat, setActiveChat] = useState(null);

    useEffect(() => {
        fetchChats();
    }, []);

    const fetchChats = async () => {
        try {
            const res = await getMyChats();
            setChats(res.data);
            // Sort by message time just in case backend sort wasn't perfect, though backend does it.
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch chats", err);
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading messages...</div>;

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-8">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Messages</h1>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {chats.length === 0 ? (
                        <li className="p-12 text-center flex flex-col items-center justify-center text-gray-500">
                            <div className="bg-gray-100 p-4 rounded-full mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <p className="text-lg font-medium text-gray-900">No messages yet</p>
                            <p className="text-sm text-gray-500 mt-1">Start a conversation with a recruiter or candidate!</p>
                        </li>
                    ) : (
                        chats.map((chat) => {
                            const isRecruiter = user.role === 'RECRUITER';
                            const otherUser = isRecruiter ? chat.candidate : chat.job.recruiter;
                            const jobTitle = chat.job.title;

                            return (
                                <li
                                    key={chat.id}
                                    onClick={() => setActiveChat({ appId: chat.id, otherUserName: otherUser.name })}
                                    className="hover:bg-indigo-50 cursor-pointer transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 hover:shadow-md border-b last:border-b-0 border-gray-100"
                                >
                                    <div className="px-6 py-5 flex items-center justify-between group">
                                        <div className="flex items-center gap-5">
                                            <div className="relative">
                                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:shadow-indigo-200 group-hover:scale-105 transition-all">
                                                    {otherUser.name.charAt(0).toUpperCase()}
                                                </div>
                                                {chat.unreadCount > 0 && (
                                                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
                                                    </span>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <p className="text-base font-semibold text-gray-900 truncate group-hover:text-indigo-700 transition-colors">
                                                        {otherUser.name}
                                                    </p>
                                                    {chat.unreadCount > 0 && (
                                                        <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                                            {chat.unreadCount} NEW
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 truncate font-medium">
                                                    {jobTitle} <span className="text-gray-400 mx-1">•</span> {chat.job.company}
                                                </p>
                                                <p className="text-sm text-gray-400 mt-1 truncate max-w-md group-hover:text-gray-600 transition-colors">
                                                    {chat.lastMessage?.content || 'Started a conversation'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-400 whitespace-nowrap ml-4 flex flex-col items-end gap-1">
                                            <span>{chat.lastMessage && new Date(chat.lastMessage.createdAt).toLocaleDateString()}</span>
                                            <span className="opacity-0 group-hover:opacity-100 text-indigo-600 font-medium transition-opacity text-[10px] uppercase tracking-wider">
                                                Open Chat →
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            );
                        })
                    )}
                </ul>
            </div>

            {activeChat && user && (
                <ChatWindow
                    applicationId={activeChat.appId}
                    currentUserId={user.id}
                    otherUserName={activeChat.otherUserName}
                    onClose={() => {
                        setActiveChat(null);
                        fetchChats(); // Refresh unread counts on close
                    }}
                />
            )}
        </div>
    );
};

export default MyChats;
