import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../api/services';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { user, setUser } = useAuth();
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

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await getProfile();
            const data = res.data;
            setFormData({
                headline: data.headline || '',
                about: data.about || '',
                skills: data.skills ? JSON.stringify(data.skills) : '',
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

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
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    const isRecruiter = user?.role === 'RECRUITER';

    return (
        <div className="max-w-4xl mx-auto p-8">
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">
                        {isRecruiter ? 'Company Profile' : 'My Profile'}
                    </h1>
                    {!isEditing && (
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
                        {isRecruiter ? (
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
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer"
                            >
                                Save Changes
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
                                    <dd className="text-sm text-gray-900">{user?.name}</dd>
                                </div>
                                <div className="py-3 flex justify-between">
                                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                                    <dd className="text-sm text-gray-900">{user?.email}</dd>
                                </div>
                                {isRecruiter ? (
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
                                                        {JSON.parse(formData.skills).map((skill, idx) => (
                                                            <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : 'No skills listed'}
                                            </dd>
                                        </div>
                                        <div className="py-3">
                                            <dt className="text-sm font-medium text-gray-500">Resume</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {formData.resume ? (
                                                    <a
                                                        href={`http://localhost:3000/${formData.resume}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
                                                    >
                                                        View Resume
                                                    </a>
                                                ) : 'No resume uploaded'}
                                            </dd>
                                        </div>
                                    </>
                                )}
                            </dl>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
