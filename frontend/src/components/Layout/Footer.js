import React from 'react';

const Footer = ({ isSidebarOpen }) => {

    return (
        <footer
            className={`
                fixed bottom-0 right-0 left-0 h-12 px-3 sm:px-4 md:px-6
                flex items-center justify-center bg-white border-t border-slate-200 text-slate-400
                text-[10px] font-bold uppercase tracking-[0.2em] z-30 transition-[left] duration-300
                ${isSidebarOpen ? 'md:left-64' : 'md:left-16'}
            `}
        >
            <p className="truncate text-center max-w-full">&copy; {new Date().getFullYear()} Purchase Order - Management System</p>
        </footer>
    );
};


export default Footer;
