import React, { useState, useEffect } from 'react';
import { SERVER_URL } from '../api/axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllJobs } from '../api/services';
import { Search, MapPin, Briefcase, TrendingUp, Clock, IndianRupee, ShieldCheck, Zap, BarChart2 } from 'lucide-react';

const Landing = () => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [focusedField, setFocusedField] = useState(null);
    const [filters, setFilters] = useState({
        keyword: '',
        location: '',
        jobType: '',
        experienceLevel: ''
    });

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async (customFilters = null) => {
        setLoading(true);
        try {
            const res = await getAllJobs(customFilters || filters);
            setJobs(res.data);
        } catch (error) {
            console.error('Failed to fetch jobs', error);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickSearch = (newFilter) => {
        const updated = {
            keyword: '',
            location: '',
            jobType: '',
            experienceLevel: '',
            ...newFilter
        };
        setFilters(updated);
        fetchJobs(updated);
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchJobs();
    };

    return (
        <div className="min-h-screen font-sans">
            {/* Hero & Search Section */}
            <div className="w-full max-w-7xl mx-auto px-6 mt-6">
                <div 
                    className="text-white rounded-3xl shadow-xl relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #4338CA 0%, #6D28D9 50%, #7E22CE 100%)' }}
                >
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 brightness-100 contrast-150 mix-blend-overlay"></div>
                    <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-screen filter blur-3xl animate-blob"></div>
                    <div className="absolute -bottom-32 -left-20 w-96 h-96 bg-indigo-500/20 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-2000"></div>

                    <div className="max-w-4xl mx-auto px-6 sm:px-12 pt-[60px] pb-[64px] relative z-10 text-center flex flex-col items-center">
                        {/* Pill badge above heading */}
                        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-indigo-100 text-xs font-semibold mb-4 tracking-wide shadow-inner">
                            Discover your next opportunity
                        </div>

                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4 animate-slide-up leading-tight">
                            Find Your <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #FACC15 0%, #FB923C 100%)' }}>Dream Job</span> Today
                        </h1>
                        <p className="text-indigo-100/80 text-base md:text-lg max-w-2xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            Connect with top companies and startups. Your next career move is just a search away.
                        </p>

                        {/* Search Bar: Unified Card */}
                        <div className="w-full max-w-[920px] mx-auto bg-white p-2 rounded-2xl shadow-2xl border border-gray-250/20 animate-fade-in relative z-20" style={{ animationDelay: '0.2s' }}>
                            <form onSubmit={handleSearch} className="flex flex-col md:grid md:grid-cols-[minmax(260px,_1.5fr)_minmax(180px,_1fr)_minmax(160px,_0.8fr)_auto] gap-2 md:gap-0 items-center justify-between w-full">
                                {/* Keyword */}
                                <div className={`relative flex items-center h-full w-full py-2 md:py-0 md:px-4 md:border-r border-gray-200 transition-colors duration-200 rounded-l-xl ${focusedField === 'keyword' ? 'bg-indigo-50/20' : ''}`}>
                                    <Search className={`h-5 w-5 shrink-0 transition-colors duration-200 ${focusedField === 'keyword' ? 'text-indigo-650' : 'text-gray-400'}`} />
                                    <input
                                        type="text"
                                        name="keyword"
                                        placeholder="Job title or keyword"
                                        value={filters.keyword}
                                        onChange={handleFilterChange}
                                        onFocus={() => setFocusedField('keyword')}
                                        onBlur={() => setFocusedField(null)}
                                        className="block w-full pl-3 pr-2 py-3 border-none bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 text-sm"
                                    />
                                </div>

                                {/* Location */}
                                <div className={`relative flex items-center h-full w-full py-2 md:py-0 md:px-4 md:border-r border-gray-200 transition-colors duration-200 ${focusedField === 'location' ? 'bg-indigo-50/20' : ''}`}>
                                    <MapPin className={`h-5 w-5 shrink-0 transition-colors duration-200 ${focusedField === 'location' ? 'text-indigo-650' : 'text-gray-400'}`} />
                                    <input
                                        type="text"
                                        name="location"
                                        placeholder="Location"
                                        value={filters.location}
                                        onChange={handleFilterChange}
                                        onFocus={() => setFocusedField('location')}
                                        onBlur={() => setFocusedField(null)}
                                        className="block w-full pl-3 pr-2 py-3 border-none bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 text-sm"
                                    />
                                </div>

                                {/* Job Type */}
                                <div className={`relative flex items-center h-full w-full py-2 md:py-0 md:px-4 transition-colors duration-200 rounded-r-xl ${focusedField === 'jobType' ? 'bg-indigo-50/20' : ''}`}>
                                    <Briefcase className={`h-5 w-5 shrink-0 transition-colors duration-200 ${focusedField === 'jobType' ? 'text-indigo-650' : 'text-gray-400'}`} />
                                    <select
                                        name="jobType"
                                        value={filters.jobType}
                                        onChange={handleFilterChange}
                                        onFocus={() => setFocusedField('jobType')}
                                        onBlur={() => setFocusedField(null)}
                                        className="block w-full pl-3 pr-8 py-3 border-none bg-transparent text-gray-900 focus:outline-none focus:ring-0 text-sm appearance-none cursor-pointer"
                                    >
                                        <option value="">Job Type</option>
                                        <option value="FULL_TIME">Full Time</option>
                                        <option value="PART_TIME">Part Time</option>
                                        <option value="CONTRACT">Contract</option>
                                        <option value="INTERNSHIP">Internship</option>
                                    </select>
                                </div>

                                {/* Button */}
                                <div className="w-full md:w-auto md:pl-4 py-1 md:py-0 flex shrink-0 justify-end">
                                    <button
                                        type="submit"
                                        className="w-full md:w-auto shrink-0 inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-extrabold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all cursor-pointer shadow-md shadow-indigo-600/10"
                                    >
                                        Search Jobs
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Popular Tags searches */}
                        <div className="mt-8 flex flex-wrap justify-center gap-2 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
                            <span className="text-indigo-200/90 text-sm font-semibold flex items-center mr-2">Popular searches:</span>
                            {[
                                { label: 'Remote', filter: { location: 'Remote' } },
                                { label: 'Frontend', filter: { keyword: 'Frontend' } },
                                { label: 'Full Time', filter: { jobType: 'FULL_TIME' } },
                                { label: 'Internship', filter: { jobType: 'INTERNSHIP' } },
                                { label: 'Mumbai', filter: { location: 'Mumbai' } },
                                { label: 'React', filter: { keyword: 'React' } }
                            ].map((tag, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleQuickSearch(tag.filter)}
                                    className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-sm"
                                >
                                    {tag.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Trust Section */}
            <div className="w-full max-w-7xl mx-auto px-6 mt-8">
                <div 
                    className="bg-white rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-6 text-center"
                    style={{ border: '1px solid #E5E7EB', boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)' }}
                >
                    <div className="flex flex-col sm:flex-row items-center gap-4 text-left px-4">
                        <div className="bg-green-50 text-green-600 p-2.5 rounded-xl">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="font-extrabold text-gray-900 text-sm">Verified Opportunities</h4>
                            <p className="text-xs text-gray-400 mt-0.5">Every job is vetted by our admin team before listing.</p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-4 text-left px-4 border-t md:border-t-0 md:border-x border-gray-100 md:py-0 py-4">
                        <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl">
                            <Zap className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="font-extrabold text-gray-900 text-sm">Easy Applications</h4>
                            <p className="text-xs text-gray-400 mt-0.5">Apply in seconds with your pre-uploaded profile resume.</p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-4 text-left px-4">
                        <div className="bg-purple-50 text-purple-600 p-2.5 rounded-xl">
                            <BarChart2 className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="font-extrabold text-gray-900 text-sm">Track Your Progress</h4>
                            <p className="text-xs text-gray-400 mt-0.5">Live application statuses and inline candidate chat.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Job Listings */}
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Latest Opportunities</h2>
                        <p className="text-gray-500 text-sm mt-1">Explore recently posted opportunities and find your next role.</p>
                    </div>
                    <span className="text-gray-400 text-xs font-bold bg-white px-3 py-1 rounded-full border border-gray-150 shadow-sm">{jobs.length} jobs found</span>
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
                                    className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200/80 hover:border-indigo-200 overflow-hidden h-full flex flex-col transform hover:-translate-y-1 relative p-6"
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                >
                                    <div className="flex justify-between items-start gap-4 mb-4">
                                        <div className="flex-grow min-w-0">
                                            {job.recruiter?.companyWebsite ? (
                                                <a
                                                    href={job.recruiter.companyWebsite.startsWith('http') ? job.recruiter.companyWebsite : `https://${job.recruiter.companyWebsite}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="text-xs font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-800 hover:underline block mb-1 z-10 relative"
                                                >
                                                    {job.company} ↗
                                                </a>
                                            ) : (
                                                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">{job.company}</span>
                                            )}
                                            <h3 className="text-lg font-black text-gray-900 group-hover:text-indigo-605 transition-colors truncate">
                                                {job.title}
                                            </h3>
                                        </div>
                                        {job.recruiter?.profilePicture ? (
                                            <img
                                                src={`${SERVER_URL}/${job.recruiter.profilePicture}`}
                                                alt={`${job.company} logo`}
                                                onError={(e) => { e.target.onerror = null; e.target.src = ''; e.target.className = 'hidden'; }}
                                                className="h-11 w-11 rounded-xl object-cover shadow-sm border border-gray-100 shrink-0"
                                            />
                                        ) : (
                                            <div className="h-11 w-11 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-650 font-black text-lg shrink-0">
                                                {job.company.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed mb-4 flex-grow">
                                        {job.description}
                                    </p>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                                            {job.jobType.replace('_', ' ')}
                                        </span>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                            {job.experienceLevel.replace('_', ' ')}
                                        </span>
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center text-sm font-semibold text-gray-500">
                                        <span className="flex items-center text-gray-500 text-xs">
                                            <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                                            {job.location}
                                        </span>
                                        <span className="text-green-700 text-sm font-extrabold flex items-center">
                                            <IndianRupee className="h-4 w-4 mr-0.5 text-green-600 animate-pulse" />
                                            {job.salary || 'Competitive'}
                                        </span>
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
