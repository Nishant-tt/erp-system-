import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { logoutAPI } from '../../api/auth';


const Footer = ({ isSidebarOpen }) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logoutAPI();
            sessionStorage.clear();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            // Even if API fails, clear session and go to login
            sessionStorage.clear();
            navigate('/login');
        }
    };

    return (
        <footer className={`fixed bottom-0 right-0 h-10 px-8 flex items-center justify-center bg-white border-t border-slate-200 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] z-40 transition-all duration-300 ${isSidebarOpen ? 'left-64' : 'left-16'}`}>
            <p>&copy; {new Date().getFullYear()} G-NXT Systems - Enterprise Resource Planning Solution</p>
        </footer>
    );
};


export default Footer;
