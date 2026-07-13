import React, { useState, useEffect } from 'react';
import { SERVER_URL } from '../api/axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllJobs } from '../api/services';
import { Search, MapPin, Briefcase, TrendingUp, Clock, DollarSign } from 'lucide-react';

const Landing = () => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        keyword: '',
        location: '',
        jobType: '',
        experienceLevel: ''
    });

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const res = await getAllJobs(filters);
            setJobs(res.data);
        } catch (error) {
            console.error('Failed to fetch jobs', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchJobs();
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            {/* Hero & Search Section */}
            <div className="bg-gradient-to-br from-indigo-700 via-purple-700 to-indigo-800 text-white shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 animate-slide-up">
                        Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">Dream Job</span> Today
                    </h1>
                    <p className="text-indigo-100 text-lg md:text-xl max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        Connect with top companies and startups. Your next career move is just a search away.
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/20 shadow-2xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2">
                            <div className="relative flex-grow group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-indigo-200 group-focus-within:text-indigo-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    name="keyword"
                                    placeholder="Job title or keyword"
                                    value={filters.keyword}
                                    onChange={handleFilterChange}
                                    className="block w-full pl-11 pr-3 py-4 border-none rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all shadow-inner"
                                />
                            </div>

                            <div className="relative md:w-1/4 group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <MapPin className="h-5 w-5 text-indigo-200 group-focus-within:text-indigo-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    name="location"
                                    placeholder="Location"
                                    value={filters.location}
                                    onChange={handleFilterChange}
                                    className="block w-full pl-11 pr-3 py-4 border-none rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all shadow-inner"
                                />
                            </div>

                            <div className="relative md:w-1/4 group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Briefcase className="h-5 w-5 text-indigo-200 group-focus-within:text-indigo-500 transition-colors" />
                                </div>
                                <select
                                    name="jobType"
                                    value={filters.jobType}
                                    onChange={handleFilterChange}
                                    className="block w-full pl-11 pr-3 py-4 border-none rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all shadow-inner appearance-none cursor-pointer"
                                >
                                    <option value="" className="text-gray-400">Job Type</option>
                                    <option value="FULL_TIME">Full Time</option>
                                    <option value="PART_TIME">Part Time</option>
                                    <option value="CONTRACT">Contract</option>
                                    <option value="INTERNSHIP">Internship</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-bold rounded-lg text-indigo-900 bg-yellow-400 hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 transform hover:scale-105 transition-all shadow-lg hover:shadow-yellow-500/50 cursor-pointer"
                            >
                                Search
                            </button>
                        </form>
                    </div>

                    {/* Stats or Tags */}
                    <div className="mt-8 flex justify-center gap-6 text-indigo-200 text-sm animate-fade-in" style={{ animationDelay: '0.3s' }}>
                        <span className="flex items-center gap-1"><TrendingUp className="h-4 w-4" /> Trending Jobs</span>
                        <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> Recently Added</span>
                    </div>
                </div>
            </div>

            {/* Job Listings */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Latest Opportunities</h2>
                    <span className="text-gray-500">{jobs.length} jobs found</span>
                </div>

                {loading ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-white h-64 rounded-xl shadow-sm border border-gray-100 animate-pulse"></div>
                        ))}
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No jobs found</h3>
                        <p className="text-gray-500 mb-6">Try adjusting your search criteria to find what you're looking for.</p>
                        <button onClick={() => { setFilters({ keyword: '', location: '', jobType: '', experienceLevel: '' }); fetchJobs(); }} className="text-indigo-600 font-semibold hover:text-indigo-800 hover:underline">Clear all filters</button>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {jobs.map((job, index) => (
                            <Link
                                to={`/jobs/${job.id}`}
                                key={job.id}
                                className="block group h-full"
                            >
                                <div
                                    className="bg-white rounded-xl shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 border border-gray-100 hover:border-indigo-100 overflow-hidden h-full flex flex-col transform hover:-translate-y-1 relative"
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                >
                                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>

                                    <div className="p-6 flex flex-col flex-grow">
                                        <div className="flex justify-between items-start mb-5">
                                            <div className="flex-1 min-w-0 pr-4">
                                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                                                    {job.title}
                                                </h3>
                                                <p className="text-sm text-gray-500 font-medium mt-1 truncate">{job.company}</p>
                                            </div>
                                            {job.recruiter?.profilePicture ? (
                                                <img src={`${SERVER_URL}/${job.recruiter.profilePicture}`} alt="Company" className="h-12 w-12 rounded-lg object-cover shadow-sm border border-gray-100 shrink-0" />
                                            ) : (
                                                <div className="h-12 w-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xl shrink-0">
                                                    {job.company.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>

                                        <div className="mb-4 space-y-3">
                                            <div className="flex flex-wrap gap-2">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-green-50 text-green-700 border border-green-100">
                                                    {job.jobType.replace('_', ' ')}
                                                </span>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                                                    {job.experienceLevel.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                                                {job.description}
                                            </p>
                                        </div>

                                        <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center text-sm font-medium">
                                            <span className="flex items-center text-gray-500">
                                                <MapPin className="h-4 w-4 mr-1.5 text-gray-400" />
                                                {job.location}
                                            </span>
                                            <span className="flex items-center text-gray-900">
                                                <DollarSign className="h-4 w-4 mr-0.5 text-green-600" />
                                                {job.salary || 'Competitive'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Landing;
