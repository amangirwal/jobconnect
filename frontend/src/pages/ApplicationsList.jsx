import React, { useEffect, useState } from 'react';
import { SERVER_URL } from '../api/axios';
import { useParams, Link } from 'react-router-dom';
import { getJobApplications, updateApplicationStatus } from '../api/services';
import { useAuth } from '../context/AuthContext';
import ChatWindow from '../components/ChatWindow';
import { X, Download } from 'lucide-react';

const ApplicationsList = () => {
    const { user } = useAuth();
    const { jobId } = useParams();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeChat, setActiveChat] = useState(null); // { appId, otherUserName }
    const [previewResumeUrl, setPreviewResumeUrl] = useState(null);
    const [previewResumeName, setPreviewResumeName] = useState('');

    useEffect(() => {
        fetchApplications();
    }, [jobId]);

    const fetchApplications = async () => {
        try {
            const res = await getJobApplications(jobId);
            setApplications(res.data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load applications');
            setLoading(false);
        }
    };

    const handleStatusChange = async (appId, newStatus) => {
        try {
            await updateApplicationStatus(appId, newStatus);
            // Optimistic update
            setApplications(apps => apps.map(app =>
                app.id === appId ? { ...app, status: newStatus } : app
            ));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update status');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading applications...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Job Applications</h1>
                <Link to="/my-jobs" className="text-indigo-600 hover:text-indigo-800 font-medium">
                    &larr; Back to My Jobs
                </Link>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {applications.length === 0 ? (
                        <li className="p-6 text-center text-gray-500">No applications received yet.</li>
                    ) : (
                        applications.map((app) => (
                            <li key={app.id} className="p-6 hover:bg-gray-50">
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-bold text-gray-900">
                                                <Link to={`/profile/${app.candidate.id}`} className="hover:text-indigo-600 hover:underline">
                                                    {app.candidate.name}
                                                </Link>
                                            </h3>
                                            <button
                                                onClick={() => setActiveChat({ appId: app.id, otherUserName: app.candidate.name })}
                                                className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-1 rounded-full cursor-pointer"
                                                title="Chat with Candidate"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                                    <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902.848.137 1.705.248 2.57.331v3.443a.75.75 0 001.28.53l3.58-3.579a.78.78 0 01.527-.224 41.202 41.202 0 003.444-.33c1.436-.23 2.429-1.487 2.429-2.902V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0010 2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-1">{app.candidate.headline || 'No headline'}</p>
                                        <p className="text-sm text-gray-500 mb-2">{app.candidate.email}</p>

                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {(() => {
                                                if (!app.candidate.skills) return null;
                                                let skills = app.candidate.skills;
                                                if (typeof skills === 'string') {
                                                    try {
                                                        skills = JSON.parse(skills);
                                                    } catch (e) {
                                                        skills = [];
                                                    }
                                                }
                                                if (!Array.isArray(skills)) return null;
                                                return skills.map((skill, idx) => (
                                                    <span key={idx} className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs font-medium border border-indigo-100">
                                                        {skill}
                                                    </span>
                                                ));
                                            })()}
                                        </div>

                                        <div className="flex gap-3 mt-2">
                                            {app.resume || app.candidate.resume ? (
                                                <button
                                                    onClick={() => {
                                                        const resumePath = app.resume || app.candidate.resume;
                                                        const resumeUrl = typeof resumePath === 'string' && (resumePath.startsWith('http://') || resumePath.startsWith('https://')) ? resumePath : `${SERVER_URL}/${resumePath}`;
                                                        setPreviewResumeUrl(resumeUrl);
                                                        setPreviewResumeName(`${app.candidate.name}_Resume.pdf`);
                                                    }}
                                                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
                                                >
                                                    View Resume
                                                </button>
                                            ) : (
                                                <span className="inline-block text-xs text-gray-400 italic">No resume</span>
                                            )}

                                            <button
                                                onClick={() => {
                                                    const details = document.getElementById(`details-${app.id}`);
                                                    if (details.classList.contains('hidden')) {
                                                        details.classList.remove('hidden');
                                                    } else {
                                                        details.classList.add('hidden');
                                                    }
                                                }}
                                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer"
                                            >
                                                View Profile Details
                                            </button>
                                        </div>

                                        <div id={`details-${app.id}`} className="hidden mt-4 p-4 bg-gray-50 rounded-md text-sm text-gray-700">
                                            <p className="font-semibold text-gray-900">About:</p>
                                            <p className="mb-2 whitespace-pre-wrap">{app.candidate.about || 'Not provided'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${app.status === 'SELECTED' ? 'bg-green-100 text-green-800' :
                                            app.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {app.status}
                                        </span>

                                        <select
                                            value={app.status}
                                            onChange={(e) => handleStatusChange(app.id, e.target.value)}
                                            className="block w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
                                        >
                                            <option value="APPLIED">Applied</option>
                                            <option value="REVIEWING">Reviewing</option>
                                            <option value="SELECTED">Selected</option>
                                            <option value="REJECTED">Rejected</option>
                                        </select>
                                    </div>
                                </div>
                            </li>
                        ))
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

            {/* Modal for PDF Preview */}
            {previewResumeUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="relative bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                        {/* Header with Title, Download and Close button */}
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                            <h3 className="text-base font-bold text-gray-900 truncate pr-4">
                                {previewResumeName}
                            </h3>
                            <div className="flex items-center gap-3">
                                <a
                                    href={previewResumeUrl}
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="border border-gray-300 rounded-full w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-gray-800 cursor-pointer transition-colors p-0"
                                    title="Download Resume"
                                >
                                    <Download className="w-4 h-4" />
                                </a>
                                <button
                                    onClick={() => setPreviewResumeUrl(null)}
                                    className="border border-blue-600 rounded-full w-9 h-9 flex items-center justify-center text-blue-600 hover:bg-blue-50 cursor-pointer transition-colors p-0"
                                    title="Close"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        {/* Custom PDF Viewer */}
                        <div className="flex-1 overflow-hidden">
                            <PdfViewer url={previewResumeUrl} />
                        </div>
                        {/* Footer bar */}
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <p className="text-xs text-gray-500 font-medium">Previewing candidate's resume.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const PdfViewer = ({ url }) => {
    const containerRef = React.useRef(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (!url) return;
        setLoading(true);
        let active = true;

        const renderPdf = async () => {
            try {
                if (containerRef.current) {
                    containerRef.current.innerHTML = '';
                }

                const pdfjsLib = window.pdfjsLib;
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

                const pdf = await pdfjsLib.getDocument(url).promise;
                if (!active) return;
                setLoading(false);

                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    if (!active) return;
                    const page = await pdf.getPage(pageNum);
                    if (!active) return;

                    const scale = 2.2;
                    const viewport = page.getViewport({ scale });
                    const displayViewport = page.getViewport({ scale: 1.3 });

                    const canvas = document.createElement('canvas');
                    canvas.className = 'shadow-md mb-6 mx-auto bg-white rounded border border-gray-200 block';
                    canvas.style.width = '100%';
                    canvas.style.maxWidth = `${displayViewport.width}px`;
                    canvas.style.height = 'auto';
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;

                    const context = canvas.getContext('2d');
                    const renderContext = {
                        canvasContext: context,
                        viewport: viewport,
                    };

                    containerRef.current.appendChild(canvas);
                    await page.render(renderContext).promise;
                }
            } catch (err) {
                console.error('Error rendering PDF:', err);
                if (active && containerRef.current) {
                    containerRef.current.innerHTML = '<p class="text-red-500 text-center p-4">Failed to render PDF document preview.</p>';
                }
                if (active) setLoading(false);
            }
        };

        if (window.pdfjsLib) {
            renderPdf();
        } else {
            const interval = setInterval(() => {
                if (window.pdfjsLib && active) {
                    clearInterval(interval);
                    renderPdf();
                }
            }, 100);
            return () => {
                active = false;
                clearInterval(interval);
            };
        }

        return () => {
            active = false;
        };
    }, [url]);

    return (
        <div className="w-full h-full overflow-y-auto bg-gray-100 p-6 flex flex-col items-center">
            {loading && (
                <div className="flex flex-col items-center justify-center py-20 gap-2">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 text-sm font-medium">Loading resume preview...</p>
                </div>
            )}
            <div ref={containerRef} className="w-full flex flex-col items-center"></div>
        </div>
    );
};

export default ApplicationsList;
