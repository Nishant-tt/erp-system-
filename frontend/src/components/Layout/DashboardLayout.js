import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
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
        <div className="flex min-h-screen bg-slate-50 font-sans min-w-0">
            {/* Mobile overlay backdrop when sidebar is open */}
            <div
                role="button"
                tabIndex={0}
                aria-label="Close menu"
                onClick={() => isSidebarOpen && toggleSidebar()}
                onKeyDown={(e) => e.key === 'Enter' && isSidebarOpen && toggleSidebar()}
                className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden ${
                    isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
            />
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            {/* Persistent "Open sidebar" button when closed - mobile: always show; desktop: sidebar strip has its own visible toggle */}
            {!isSidebarOpen && (
                <button
                    type="button"
                    onClick={toggleSidebar}
                    aria-label="Open menu"
                    className="fixed left-0 top-1/2 -translate-y-1/2 z-50 w-10 h-14 flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded-r-xl shadow-lg border-r-0 border border-slate-200/80 transition-all hover:scale-105 active:scale-95 md:hidden"
                >
                    <ChevronRight size={22} />
                </button>
            )}

            <div
                className={`flex-1 flex flex-col min-w-0 w-full transition-[padding] duration-300 pl-0 ${isSidebarOpen ? 'md:pl-64' : 'md:pl-16'}`}
            >
                <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

                <main className="flex-1 px-3 sm:px-4 md:px-6 lg:px-8 pt-16 pb-16 sm:pt-20 sm:pb-20 min-w-0 overflow-x-hidden">
                    <Outlet />
                </main>

                <Footer isSidebarOpen={isSidebarOpen} />
            </div>
        </div>
    );
};

export default DashboardLayout;
