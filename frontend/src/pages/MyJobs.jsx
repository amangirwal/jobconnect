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

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">My Posted Jobs</h1>
                <Link to="/create-job" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                    Post New Job
                </Link>
            </div>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {jobs.map((job) => (
                        <li key={job.id}>
                            <div className="px-4 py-4 flex items-center justify-between sm:px-6">
                                <div>
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">{job.title}</h3>
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
