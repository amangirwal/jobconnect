import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext'; // Need auth context for current User ID
import ChatWindow from '../components/ChatWindow';

const MyApplications = () => {
    const { user } = useAuth();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeChat, setActiveChat] = useState(null); // { appId, otherUserName }

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const response = await api.get('/applications/my-applications');
            setApplications(response.data);
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    const totalApplied = applications.length;
    const selectedCount = applications.filter(app => app.status === 'SELECTED').length;
    const reviewingCount = applications.filter(app => app.status === 'REVIEWING').length;
    const appliedPendingCount = applications.filter(app => app.status === 'APPLIED').length;

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-8">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">My Applications</h1>

            {/* Candidate Statistics Panel */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-100 rounded-xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Total Applied</p>
                    <p className="text-3xl font-extrabold text-indigo-900 mt-2">{totalApplied}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100/50 border border-green-100 rounded-xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-xs font-semibold text-green-700 uppercase tracking-wider">Shortlisted</p>
                    <p className="text-3xl font-extrabold text-green-900 mt-2 flex items-center gap-2">
                        {selectedCount}
                        {selectedCount > 0 && <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>}
                    </p>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 border border-yellow-100 rounded-xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wider">Under Review</p>
                    <p className="text-3xl font-extrabold text-yellow-900 mt-2">{reviewingCount}</p>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-100 rounded-xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Applied</p>
                    <p className="text-3xl font-extrabold text-gray-900 mt-2">{appliedPendingCount}</p>
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {applications.map((app) => (
                        <li key={app.id}>
                            <div className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">{app.job.title}</h3>
                                    <p className="text-sm text-gray-500">Applied on: {new Date(app.appliedAt).toLocaleDateString()}</p>
                                </div>
                                <div className="mt-2 sm:flex sm:justify-between items-center">
                                    <div className="sm:flex">
                                        <p className="flex items-center text-sm text-gray-500">
                                            {app.job.company}
                                        </p>
                                    </div>
                                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-500 sm:mt-0">
                                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            app.status === 'SELECTED' ? 'bg-green-100 text-green-800' :
                                            app.status === 'REVIEWING' ? 'bg-yellow-100 text-yellow-800' :
                                            app.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                            {app.status}
                                        </span>
                                        {app.status === 'SELECTED' && (
                                            <button
                                                onClick={() => setActiveChat({ appId: app.id, otherUserName: app.job.recruiter?.name || 'Recruiter' })}
                                                className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-medium hover:bg-indigo-700 cursor-pointer flex items-center gap-1"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                                    <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902.848.137 1.705.248 2.57.331v3.443a.75.75 0 001.28.53l3.58-3.579a.78.78 0 01.527-.224 41.202 41.202 0 003.444-.33c1.436-.23 2.429-1.487 2.429-2.902V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0010 2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                                </svg>
                                                Chat with Recruiter
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                    {applications.length === 0 && (
                        <li className="px-4 py-4 text-center text-gray-500">You haven't applied to any jobs yet.</li>
                    )}
                </ul>
            </div>

            {/* Chat Window */}
            {activeChat && user && (
                <ChatWindow
                    applicationId={activeChat.appId}
                    currentUserId={user.id}
                    otherUserName={activeChat.otherUserName}
                    onClose={() => setActiveChat(null)}
                />
            )}
        </div>
    );
};

export default MyApplications;
