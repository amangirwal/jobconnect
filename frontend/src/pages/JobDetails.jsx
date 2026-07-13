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
        <div className="max-w-4xl mx-auto p-4 sm:p-8">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-6 py-6 border-b border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                            <p className="mt-2 text-lg text-indigo-600 font-medium">{job.company}</p>
                        </div>
                        {job.recruiter?.profilePicture && (
                            <img src={`${SERVER_URL}/${job.recruiter.profilePicture}`} alt="Company" className="h-16 w-16 rounded-full object-cover shadow-sm bg-gray-50" />
                        )}
                    </div>
                </div>

                <div className="px-6 py-6">
                    <div className="flex flex-wrap gap-3 mb-8">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                            {job.location}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            {job.jobType?.replace('_', ' ') || 'Full Time'}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {job.experienceLevel?.replace('_', ' ') || 'Entry Level'}
                        </span>
                        {job.salary && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                {job.salary}
                            </span>
                        )}
                    </div>

                    <div className="prose max-w-none text-gray-700 mb-8">
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Job Description</h3>
                        <p className="whitespace-pre-wrap">{job.description}</p>
                    </div>

                    {skills.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Skills Required</h3>
                            <div className="flex flex-wrap gap-2">
                                {skills.map((skill, idx) => (
                                    <span key={idx} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md text-sm font-medium">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="border-t border-gray-100 pt-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Apply for this Position</h3>
                        {user && user.role === 'CANDIDATE' ? (
                            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Resume (Optional)</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={(e) => setResume(e.target.files[0])}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                                    />
                                    <button
                                        onClick={handleApply}
                                        disabled={applying}
                                        className={`inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${applying ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                                    >
                                        {applying ? 'Applying...' : 'Submit Application'}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Accepted format: PDF. If you don't upload one, we'll try to use the resume from your profile.</p>
                            </div>
                        ) : !user ? (
                            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
                                <Link to="/login" className="text-indigo-600 font-bold hover:text-indigo-800 text-lg">Log in to Apply</Link>
                                <p className="text-gray-500 mt-2">You need a candidate account to apply for jobs.</p>
                            </div>
                        ) : (
                            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
                                <p className="text-gray-500">Recruiters cannot apply for jobs.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDetails;
