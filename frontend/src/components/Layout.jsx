import React from 'react';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';
import Footer from './Footer';

const Layout = () => {
    return (
        <div className="min-h-screen bg-[#F8F9FC] flex flex-col">
            <Navbar />
            <main className="flex-grow w-full max-w-7xl mx-auto px-6 pt-2 pb-6">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
