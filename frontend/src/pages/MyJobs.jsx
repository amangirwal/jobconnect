import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';

const MyJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyJobs();
    }, []);

    const fetchMyJobs = async () => {
        try {
            const response = await api.get('/jobs/my-jobs');
            setJobs(response.data);
        } catch (error) {
            console.error('Error fetching my jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this job?')) return;
        try {
            await api.delete(`/jobs/${id}`);
            setJobs(jobs.filter(job => job.id !== id));
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete job');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    const activeJobsCount = jobs.length;
    const totalApplicantsCount = jobs.reduce((sum, job) => sum + (job.totalApplicationsCount || 0), 0);
    const newApplicantsCount = jobs.reduce((sum, job) => sum + (job.unviewedApplicationsCount || 0), 0);
    const selectedApplicantsCount = jobs.reduce((sum, job) => sum + (job.selectedApplicationsCount || 0), 0);

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">My Posted Jobs</h1>
                <Link to="/create-job" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors font-semibold shadow hover:shadow-indigo-500/30">
                    Post New Job
                </Link>
            </div>

            {/* Recruiter Statistics Panel */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-100 rounded-xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Active Jobs</p>
                    <p className="text-3xl font-extrabold text-indigo-900 mt-2">{activeJobsCount}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-100 rounded-xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Total Applicants</p>
                    <p className="text-3xl font-extrabold text-blue-900 mt-2">{totalApplicantsCount}</p>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100/50 border border-red-100 rounded-xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-xs font-semibold text-red-700 uppercase tracking-wider">New Applicants</p>
                    <p className="text-3xl font-extrabold text-red-900 mt-2 flex items-center gap-2">
                        {newApplicantsCount}
                        {newApplicantsCount > 0 && <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>}
                    </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100/50 border border-green-100 rounded-xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-xs font-semibold text-green-700 uppercase tracking-wider">Selected</p>
                    <p className="text-3xl font-extrabold text-green-900 mt-2">{selectedApplicantsCount}</p>
                </div>
            </div>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {jobs.map((job) => (
                        <li key={job.id} className={`transition-colors ${job.unviewedApplicationsCount > 0 ? 'bg-indigo-50/40 border-l-4 border-indigo-600' : ''}`}>
                            <div className="px-4 py-4 flex items-center justify-between sm:px-6">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg leading-6 font-semibold text-gray-900">{job.title}</h3>
                                        {job.unviewedApplicationsCount > 0 && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 animate-pulse">
                                                {job.unviewedApplicationsCount} New
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-1 max-w-2xl text-sm text-gray-500">{job.company} - {job.location}</p>
                                </div>
                                <div className="flex space-x-4">
                                    <Link to={`/jobs/${job.id}/applications`} className="text-green-600 hover:text-green-900 font-medium">Applicants</Link>
                                    <Link to={`/jobs/${job.id}`} className="text-indigo-600 hover:text-indigo-900">View</Link>
                                    <button onClick={() => handleDelete(job.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                </div>
                            </div>
                        </li>
                    ))}
                    {jobs.length === 0 && (
                        <li className="px-4 py-4 text-center text-gray-500">You haven't posted any jobs yet.</li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default MyJobs;
