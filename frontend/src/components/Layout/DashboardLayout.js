import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';


const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);


    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarOpen ? 'pl-64' : 'pl-16'}`}>
                <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

                <main className="flex-1 p-8 pb-24">
                    <Outlet />
                </main>

                <Footer isSidebarOpen={isSidebarOpen} />
            </div>
        </div>

    );
};

export default DashboardLayout;
