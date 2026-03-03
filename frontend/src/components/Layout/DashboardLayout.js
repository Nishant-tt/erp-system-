import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import { Outlet, Navigate } from 'react-router-dom';

const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const checkTokenExpiry = () => {
            const currentToken = localStorage.getItem('token');
            if (!currentToken) return;

            try {
                const base64Url = currentToken.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
                    '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
                ).join(''));
                const payload = JSON.parse(jsonPayload);

                const secondsRemaining = Math.round((payload.exp * 1000 - Date.now()) / 1000);

                if (secondsRemaining <= 0) {
                    // console.warn('Session expired - Forced redirection');
                    localStorage.clear();
                    window.location.href = '/login'; // Hard redirect
                }
            } catch (err) {
                console.error('Session monitor error:', err);
                localStorage.clear();
                window.location.href = '/login';
            }
        };

        // Check on focus, interval, and mount
        window.addEventListener('focus', checkTokenExpiry);
        const interval = setInterval(checkTokenExpiry, 5000); // Check every 5s
        checkTokenExpiry();

        return () => {
            window.removeEventListener('focus', checkTokenExpiry);
            clearInterval(interval);
        };
    }, []);

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            <div
                className={`flex-1 flex flex-col min-w-0 transition-all duration-300 pl-0 ${isSidebarOpen ? 'md:pl-64' : 'md:pl-16'}`}
            >
                <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

                <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24">
                    <Outlet />
                </main>

                <Footer isSidebarOpen={isSidebarOpen} />
            </div>
        </div>
    );
};

export default DashboardLayout;
