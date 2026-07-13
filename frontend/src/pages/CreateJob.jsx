import React, { useState, useEffect } from 'react';
import { createJob } from '../api/services';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const CreateJob = () => {
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        description: '',
        location: '',
        salary: '',
        jobType: 'FULL_TIME',
        experienceLevel: 'ENTRY_LEVEL',
        skillsRequired: ''
    });
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchRecruiterProfile();
    }, []);

    const fetchRecruiterProfile = async () => {
        try {
            const res = await api.get('/users/profile');
            setProfile(res.data);
            setFormData(prev => ({
                ...prev,
                company: res.data.companyName || ''
            }));
        } catch (err) {
            console.error("Failed to load recruiter profile details", err);
            setError("Could not load your profile details. Please make sure you are logged in.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Prepare data
        const dataToSend = { ...formData };
        if (dataToSend.skillsRequired) {
            // Convert to JSON string array as expected by backend
            const skillsArray = dataToSend.skillsRequired.split(',').map(s => s.trim()).filter(s => s);
            dataToSend.skillsRequired = JSON.stringify(skillsArray);
        }

        try {
            await createJob(dataToSend);
            navigate('/my-jobs');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create job');
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500 font-semibold">Loading profile details...</div>;
    }

    if (!profile || !profile.companyName) {
        return (
            <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-lg text-center mt-10 border border-gray-100 animate-slide-up">
                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100 shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold mb-3 text-gray-900">Company Profile Required</h2>
                <p className="text-gray-500 mb-6 leading-relaxed">
                    You must complete your recruiter profile (specifically your **Company Name**) before you can post job openings on JobConnect.
                </p>
                <Link to="/profile" className="inline-block bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition-all shadow hover:shadow-indigo-500/30">
                    Complete Profile Now
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6">Post a New Job</h2>
            {error && <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Job Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
                        required
                        placeholder="e.g. Software Engineer"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-500">Company Name</label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-800 font-semibold flex items-center justify-between select-none">
                        <span>{profile.companyName}</span>
                        {profile.companyWebsite && (
                            <a href={profile.companyWebsite.startsWith('http') ? profile.companyWebsite : `https://${profile.companyWebsite}`} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline">
                                View Website ↗
                            </a>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Job Type</label>
                        <select
                            name="jobType"
                            value={formData.jobType}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
                        >
                            <option value="FULL_TIME">Full Time</option>
                            <option value="PART_TIME">Part Time</option>
                            <option value="CONTRACT">Contract</option>
                            <option value="INTERNSHIP">Internship</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Experience Level</label>
                        <select
                            name="experienceLevel"
                            value={formData.experienceLevel}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
                        >
                            <option value="ENTRY_LEVEL">Entry Level</option>
                            <option value="MID_LEVEL">Mid Level</option>
                            <option value="SENIOR">Senior</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
                        required
                        placeholder="e.g. Remote, New York, NY"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Skills Required (Comma separated)</label>
                    <input
                        type="text"
                        name="skillsRequired"
                        value={formData.skillsRequired}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
                        placeholder="React, Node.js, SQL"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Salary (Optional)</label>
                    <input
                        type="text"
                        name="salary"
                        value={formData.salary}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
                        placeholder="e.g. ₹8 LPA - ₹12 LPA"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="5"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
                        required
                        minLength={10}
                    ></textarea>
                </div>
                <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
                >
                    Post Job
                </button>
            </form>
        </div>
    );
};

export default CreateJob;
