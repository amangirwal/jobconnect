import React, { useEffect, useState } from 'react';
import { SERVER_URL } from '../api/axios';
import { useParams, Link } from 'react-router-dom';
import { getJobById, applyForJob } from '../api/services';
import { useAuth } from '../context/AuthContext';

const JobDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [resume, setResume] = useState(null);
    const [applying, setApplying] = useState(false);

    useEffect(() => {
        fetchJob();
    }, [id]);

    const fetchJob = async () => {
        try {
            const response = await getJobById(id);
            setJob(response.data);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to load job details');
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async () => {
        if (!user) {
            alert('Please login to apply');
            return;
        }

        setApplying(true);
        const formData = new FormData();
        formData.append('jobId', id);
        if (resume) {
            formData.append('resume', resume);
        }

        try {
            await applyForJob(formData);
            alert('Applied successfully!');
            setResume(null);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to apply');
        } finally {
            setApplying(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!job) return <div className="p-8 text-center text-gray-500">Job not found</div>;

    const skills = job.skillsRequired || [];

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Job Description & Details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-105 p-6 sm:p-8 shadow-sm">
                        <div className="flex justify-between items-start border-b border-gray-100 pb-6 mb-6">
                            <div>
                                <h1 className="text-3xl font-black text-gray-900 tracking-tight">{job.title}</h1>
                                {job.recruiter?.companyWebsite ? (
                                    <a
                                        href={job.recruiter.companyWebsite.startsWith('http') ? job.recruiter.companyWebsite : `https://${job.recruiter.companyWebsite}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-2 inline-flex items-center gap-1.5 text-lg text-indigo-600 hover:text-indigo-850 hover:underline font-bold"
                                    >
                                        {job.company}
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-indigo-500">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                        </svg>
                                    </a>
                                ) : (
                                    <p className="mt-2 text-lg text-indigo-600 font-medium">{job.company}</p>
                                )}
                            </div>
                            {job.recruiter?.profilePicture && (
                                <img src={`${SERVER_URL}/${job.recruiter.profilePicture}`} alt="Company Logo" className="h-16 w-16 rounded-xl object-cover shadow-sm bg-gray-50 border border-gray-100 shrink-0 animate-message-pop" />
                            )}
                        </div>

                        <div className="prose max-w-none text-gray-700 mb-8 leading-relaxed">
                            <h3 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-50 pb-2">Job Description</h3>
                            <p className="whitespace-pre-wrap">{job.description}</p>
                        </div>

                        {skills.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-50 pb-2">Skills Required</h3>
                                <div className="flex flex-wrap gap-2">
                                    {skills.map((skill, idx) => (
                                        <span key={idx} className="bg-indigo-50/75 text-indigo-700 px-3.5 py-1 rounded-full text-sm font-semibold border border-indigo-100/50">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Sticky Overview & Action Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-24 space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-950 mb-4 border-b border-gray-50 pb-2">Job Overview</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400 font-medium">Location</span>
                                    <span className="font-semibold text-gray-900 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">{job.location}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400 font-medium">Job Type</span>
                                    <span className="font-semibold text-gray-950 bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-100">{job.jobType?.replace('_', ' ') || 'Full Time'}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400 font-medium">Experience Level</span>
                                    <span className="font-semibold text-gray-950 bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">{job.experienceLevel?.replace('_', ' ') || 'Entry Level'}</span>
                                </div>
                                {job.salary && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-400 font-medium">Salary</span>
                                        <span className="font-extrabold text-green-700 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100/60">{job.salary}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="border-t border-gray-50 pt-6">
                            <h3 className="text-lg font-bold text-gray-950 mb-4">Apply for this Position</h3>
                            {user && user.role === 'CANDIDATE' ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Upload Resume (Optional)</label>
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            onChange={(e) => setResume(e.target.files[0])}
                                            className="block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer border border-gray-100 rounded-lg p-2 bg-gray-50/50"
                                        />
                                    </div>
                                    <button
                                        onClick={handleApply}
                                        disabled={applying}
                                        className={`w-full flex justify-center py-2.5 px-4 border border-transparent shadow-md text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-750 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all ${applying ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer transform hover:-translate-y-0.5 shadow-indigo-500/10'}`}
                                    >
                                        {applying ? 'Applying...' : 'Submit Application'}
                                    </button>
                                    <p className="text-[10px] text-gray-400 leading-normal text-center">Accepted format: PDF. If you don't upload one, we'll use your profile resume.</p>
                                </div>
                            ) : !user ? (
                                <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 text-center space-y-2">
                                    <Link to="/login" className="block text-indigo-600 font-bold hover:text-indigo-850 text-base">Log in to Apply</Link>
                                    <p className="text-xs text-gray-400">You need a candidate account to submit applications.</p>
                                </div>
                            ) : (
                                <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 text-center">
                                    <p className="text-xs text-gray-400 font-semibold">You are logged in as a recruiter.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDetails;
