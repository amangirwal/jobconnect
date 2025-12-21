import React, { useState, useEffect, useRef } from 'react';
import { getMessages, sendMessage } from '../api/services';
import api from '../api/axios';

const ChatWindow = ({ applicationId, currentUserId, otherUserName, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const intervalRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchMessages = async () => {
        try {
            const res = await getMessages(applicationId);
            setMessages(res.data);
            setLoading(false);

            // Mark as Read
            await api.put('/applications/message/read', { applicationId });
        } catch (err) {
            console.error("Failed to load messages", err);
        }
    };

    useEffect(() => {
        fetchMessages();
        scrollToBottom();
        // Poll for new messages every 3 seconds
        intervalRef.current = setInterval(fetchMessages, 3000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [applicationId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            // Optimistic update
            const tempMsg = {
                id: Date.now().toString(),
                content: newMessage,
                senderId: currentUserId,
                createdAt: new Date().toISOString()
            };
            setMessages(prev => [...prev, tempMsg]);
            setNewMessage('');

            await sendMessage({ applicationId, content: newMessage });
            fetchMessages(); // Sync with server
        } catch (err) {
            console.error("Failed to send", err);
            alert("Failed to send message");
        }
    };

    return (
        <div className="fixed bottom-4 right-4 w-80 h-96 bg-white rounded-lg shadow-2xl flex flex-col border border-gray-200 z-50 transform transition-all duration-300 ease-in-out animate-slide-up hover:shadow-indigo-500/20">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-t-lg flex justify-between items-center text-white shadow-md">
                <div className="font-semibold flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    {otherUserName}
                </div>
                <button onClick={onClose} className="hover:text-gray-200 hover:rotate-90 transition-transform duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3 scroll-smooth">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm mt-10 animate-fade-in">No messages yet. Say hi!</div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.senderId === currentUserId;
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-message-pop`}>
                                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm transform transition-all hover:scale-[1.02] ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                    }`}>
                                    <div>{msg.content}</div>
                                    <div className={`text-[9px] mt-1 text-right font-medium opacity-80`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2 rounded-b-lg">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 border border-gray-200 bg-gray-50 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all placeholder-gray-400"
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-indigo-600 text-white rounded-full p-2 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 w-9 h-9 flex items-center justify-center transform transition-transform active:scale-95 shadow-md hover:shadow-lg"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 pl-0.5">
                        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                    </svg>
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;
