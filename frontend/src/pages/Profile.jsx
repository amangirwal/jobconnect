import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { SERVER_URL } from '../api/axios';
import { getProfile, updateProfile } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { FileText, MoreVertical, Eye, Download, Trash2, X } from 'lucide-react';

const Profile = () => {
    const { user, setUser } = useAuth();
    const { userId } = useParams();
    const [profileUser, setProfileUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        headline: '',
        about: '',
        skills: '',
        resume: null,
        companyName: '',
        companyWebsite: '',
        companyDescription: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, [userId]);

    const fetchProfile = async () => {
        try {
            const res = await getProfile(userId);
            const data = res.data;
            setProfileUser(data);
            setFormData({
                headline: data.headline || '',
                about: data.about || '',
                skills: data.skills ? (Array.isArray(data.skills) ? data.skills.join(', ') : data.skills) : '',
                resume: data.resume || null,
                companyName: data.companyName || '',
                companyWebsite: data.companyWebsite || '',
                companyDescription: data.companyDescription || ''
            });
            setLoading(false);
        } catch (err) {
            setError('Failed to load profile');
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.files[0] });
    };

    const handleDeleteResume = async () => {
        if (!window.confirm('Are you sure you want to delete your resume?')) return;
        setError('');
        setSuccess('');
        setIsMenuOpen(false);

        const data = new FormData();
        data.append('deleteResume', 'true');

        try {
            const res = await updateProfile(data);
            setSuccess('Resume deleted successfully');
            fetchProfile();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete resume');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsSaving(true);

        const data = new FormData();

        if (user.role === 'CANDIDATE') {
            data.append('headline', formData.headline);
            data.append('about', formData.about);
            try {
                const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s);
                data.append('skills', JSON.stringify(skillsArray));
            } catch (e) { }
            if (formData.resume) {
                data.append('resume', formData.resume);
            }
        } else if (user.role === 'RECRUITER') {
            data.append('companyName', formData.companyName);
            data.append('companyWebsite', formData.companyWebsite);
            data.append('companyDescription', formData.companyDescription);
        }

        try {
            const res = await updateProfile(data);
            setSuccess(res.data.message);
            setIsEditing(false);
            fetchProfile();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    const isProfileRecruiter = profileUser?.role === 'RECRUITER';
    const isOwnProfile = !userId || userId === user?.id;

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-8">
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">
                        {isOwnProfile ? (isProfileRecruiter ? 'Company Profile' : 'My Profile') : (isProfileRecruiter ? 'Company Profile' : 'Candidate Profile')}
                    </h1>
                    {isOwnProfile && !isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 cursor-pointer"
                        >
                            Edit Profile
                        </button>
                    )}
                </div>

                {error && <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">{error}</div>}
                {success && <div className="bg-green-100 text-green-700 p-3 mb-4 rounded">{success}</div>}

                {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isProfileRecruiter ? (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Company Name</label>
                                    <input
                                        type="text"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        placeholder="e.g. Acme Corp"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Company Website</label>
                                    <input
                                        type="text"
                                        name="companyWebsite"
                                        value={formData.companyWebsite}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        placeholder="https://example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Company Description</label>
                                    <textarea
                                        name="companyDescription"
                                        value={formData.companyDescription}
                                        onChange={handleChange}
                                        rows="4"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        placeholder="Tell us about your company..."
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Headline</label>
                                    <input
                                        type="text"
                                        name="headline"
                                        value={formData.headline}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        placeholder="e.g. Senior Software Engineer"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">About</label>
                                    <textarea
                                        name="about"
                                        value={formData.about}
                                        onChange={handleChange}
                                        rows="4"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        placeholder="Tell us about yourself..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Skills (Comma separated)</label>
                                    <input
                                        type="text"
                                        name="skills"
                                        value={formData.skills}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        placeholder="React, Node.js, SQL"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Resume (PDF)</label>
                                    <input
                                        type="file"
                                        name="resume"
                                        accept="application/pdf"
                                        onChange={handleFileChange}
                                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                    />
                                </div>
                            </>
                        )}
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">Details</h3>
                            <dl className="mt-2 divide-y divide-gray-200">
                                <div className="py-3 flex justify-between">
                                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                                    <dd className="text-sm text-gray-900">{profileUser?.name}</dd>
                                </div>
                                <div className="py-3 flex justify-between">
                                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                                    <dd className="text-sm text-gray-900">{profileUser?.email}</dd>
                                </div>
                                {isProfileRecruiter ? (
                                    <>
                                        <div className="py-3">
                                            <dt className="text-sm font-medium text-gray-500">Company Name</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{formData.companyName || 'Not set'}</dd>
                                        </div>
                                        <div className="py-3">
                                            <dt className="text-sm font-medium text-gray-500">Company Website</dt>
                                            <dd className="mt-1 text-sm text-blue-600">{formData.companyWebsite ? <a href={formData.companyWebsite} target="_blank" rel="noopener noreferrer">{formData.companyWebsite}</a> : 'Not set'}</dd>
                                        </div>
                                        <div className="py-3">
                                            <dt className="text-sm font-medium text-gray-500">Description</dt>
                                            <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{formData.companyDescription || 'No description added'}</dd>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="py-3">
                                            <dt className="text-sm font-medium text-gray-500">Headline</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{formData.headline || 'No headline set'}</dd>
                                        </div>
                                        <div className="py-3">
                                            <dt className="text-sm font-medium text-gray-500">About</dt>
                                            <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{formData.about || 'No description added'}</dd>
                                        </div>
                                        <div className="py-3">
                                            <dt className="text-sm font-medium text-gray-500">Skills</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {formData.skills ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {formData.skills.split(',').map(s => s.trim()).filter(s => s).map((skill, idx) => (
                                                            <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : 'No skills listed'}
                                            </dd>
                                        </div>
                                        <div className="py-4">
                                            <dt className="text-sm font-medium text-gray-500 mb-2">Resumes</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {formData.resume ? (
                                                    <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between bg-white shadow-sm max-w-md">
                                                        <div className="flex items-center gap-3">
                                                            <div className="bg-red-50 text-red-600 p-2.5 rounded-lg">
                                                                <FileText className="w-6 h-6" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-semibold text-gray-800 text-sm truncate max-w-[200px]" title={typeof formData.resume === 'string' ? formData.resume.split('/').pop() : 'Resume.pdf'}>
                                                                    {typeof formData.resume === 'string' ? formData.resume.split('/').pop() : 'Resume.pdf'}
                                                                </p>
                                                                <p className="text-xs text-gray-500 mt-0.5">Added {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Dropdown Menu Container */}
                                                        <div className="relative">
                                                            <button
                                                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                                                className="text-gray-500 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 cursor-pointer flex items-center justify-center"
                                                            >
                                                                <MoreVertical className="w-5 h-5" />
                                                            </button>
                                                            
                                                            {isMenuOpen && (
                                                                <>
                                                                    {/* Overlay to close menu */}
                                                                    <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)}></div>
                                                                    <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-20">
                                                                        <button
                                                                            onClick={() => {
                                                                                setIsPreviewOpen(true);
                                                                                setIsMenuOpen(false);
                                                                            }}
                                                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                                                                        >
                                                                            <Eye className="w-4 h-4 text-gray-500" /> View
                                                                        </button>
                                                                        <a
                                                                            href={typeof formData.resume === 'string' && (formData.resume.startsWith('http://') || formData.resume.startsWith('https://')) ? formData.resume : `${SERVER_URL}/${formData.resume}`}
                                                                            download
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            onClick={() => setIsMenuOpen(false)}
                                                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                                                                        >
                                                                            <Download className="w-4 h-4 text-gray-500" /> Download
                                                                        </a>
                                                                        <button
                                                                            onClick={handleDeleteResume}
                                                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" /> Delete
                                                                        </button>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-500">No resume uploaded</p>
                                                )}
                                            </dd>
                                        </div>
                                    </>
                                )}
                            </dl>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal for PDF Preview */}
            {isPreviewOpen && formData.resume && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="relative bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                        {/* Header with Title, Download and Close button */}
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                            <h3 className="text-base font-bold text-gray-900 truncate pr-4">
                                {typeof formData.resume === 'string' ? formData.resume.split('/').pop() : 'Resume.pdf'}
                            </h3>
                            <div className="flex items-center gap-3">
                                <a
                                    href={typeof formData.resume === 'string' && (formData.resume.startsWith('http://') || formData.resume.startsWith('https://')) ? formData.resume : `${SERVER_URL}/${formData.resume}`}
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="border border-gray-300 rounded-full w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-gray-800 cursor-pointer transition-colors p-0"
                                    title="Download Resume"
                                >
                                    <Download className="w-4 h-4" />
                                </a>
                                <button
                                    onClick={() => setIsPreviewOpen(false)}
                                    className="border border-blue-600 rounded-full w-9 h-9 flex items-center justify-center text-blue-600 hover:bg-blue-50 cursor-pointer transition-colors p-0"
                                    title="Close"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        {/* Custom PDF Viewer */}
                        <div className="flex-1 overflow-hidden">
                            <PdfViewer
                                url={typeof formData.resume === 'string' && (formData.resume.startsWith('http://') || formData.resume.startsWith('https://')) ? formData.resume : `${SERVER_URL}/${formData.resume}`}
                            />
                        </div>
                        {/* Footer bar */}
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <p className="text-xs text-gray-500 font-medium">Previewing your resume as recruiters will see it.</p>
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

                    // Render at high-density scale (2.2x) for retina sharpness
                    const scale = 2.2;
                    const viewport = page.getViewport({ scale });

                    // Set standard display scale (1.3x) for screen layout sizing
                    const displayViewport = page.getViewport({ scale: 1.3 });

                    const canvas = document.createElement('canvas');
                    canvas.className = 'shadow-md mb-6 mx-auto bg-white rounded border border-gray-200 block';
                    
                    // Set display size via CSS style (responsive to screen size)
                    canvas.style.width = '100%';
                    canvas.style.maxWidth = `${displayViewport.width}px`;
                    canvas.style.height = 'auto';
                    
                    // Set actual render buffer dimensions
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

export default Profile;
