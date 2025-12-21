import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Twitter, Linkedin, Facebook, Instagram } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-200 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
                    <div className="lg:col-span-2">
                        <Link to="/" className="flex items-center mb-4">
                            <Briefcase className="h-8 w-8 text-indigo-600" />
                            <span className="ml-2 text-xl font-bold text-gray-900">JobConnect</span>
                        </Link>
                        <p className="text-gray-500 text-sm mb-6 max-w-xs">
                            Connecting talent with opportunity. Find your dream job or the perfect candidate today with JobConnect.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-indigo-600 transition-colors">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-indigo-600 transition-colors">
                                <Linkedin className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-indigo-600 transition-colors">
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-indigo-600 transition-colors">
                                <Instagram className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">For Candidates</h3>
                        <ul className="space-y-3">
                            <li><Link to="/" className="text-gray-500 hover:text-indigo-600 text-sm">Browse Jobs</Link></li>
                            <li><a href="#" className="text-gray-500 hover:text-indigo-600 text-sm">Browse Companies</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-indigo-600 text-sm">Salary Search</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-indigo-600 text-sm">Career Advice</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">For Employers</h3>
                        <ul className="space-y-3">
                            <li><Link to="/create-job" className="text-gray-500 hover:text-indigo-600 text-sm">Post a Job</Link></li>
                            <li><a href="#" className="text-gray-500 hover:text-indigo-600 text-sm">Recruiting Solutions</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-indigo-600 text-sm">Advertise</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-indigo-600 text-sm">Pricing</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">JobConnect</h3>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-gray-500 hover:text-indigo-600 text-sm">About Us</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-indigo-600 text-sm">Work at JobConnect</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-indigo-600 text-sm">Blog</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-indigo-600 text-sm">Contact Us</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm">
                        &copy; {new Date().getFullYear()} JobConnect, Inc. All rights reserved.
                    </p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <a href="#" className="text-gray-400 hover:text-gray-500 text-sm">Privacy Policy</a>
                        <a href="#" className="text-gray-400 hover:text-gray-500 text-sm">Terms of Use</a>
                        <a href="#" className="text-gray-400 hover:text-gray-500 text-sm">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
