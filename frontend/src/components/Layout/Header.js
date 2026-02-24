import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getModulesAPI } from '../../api/modules';
import { Search, Bell, HelpCircle, Menu, LayoutDashboard, ChevronRight } from 'lucide-react';

const Header = ({ toggleSidebar, isSidebarOpen }) => {
    const [modules, setModules] = useState([]);
    const location = useLocation();

    useEffect(() => {
        const fetchModules = async () => {
            try {
                const data = await getModulesAPI();
                setModules(data);
            } catch (error) {
                console.error('Failed to fetch modules in header:', error);
            }
        };
        fetchModules();
    }, []);

    // Derive active module and menu name
    const getActiveNames = () => {
        let activeModule = null;
        let activeMenu = null;

        modules.forEach(mod => {
            if (mod.path === location.pathname) {
                activeModule = mod.name;
            } else if (mod.menus) {
                const menu = mod.menus.find(m => m.path === location.pathname);
                if (menu) {
                    activeModule = mod.name;
                    activeMenu = menu.name;
                }
            }
        });

        // Fallback for root or special pages
        if (location.pathname === '/dashboard') return { module: 'Dashboard', menu: 'Overview' };
        if (location.pathname === '/profile') return { module: 'User', menu: 'Profile' };

        return { module: activeModule || 'Dashboard', menu: activeMenu || 'Overview' };
    };

    const { module, menu } = getActiveNames();

    return (
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm">
            <div className="flex items-center gap-6">
                <button
                    onClick={toggleSidebar}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 md:hidden"
                >
                    <Menu size={20} />
                </button>

                <div className="hidden lg:flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest">
                    <LayoutDashboard size={14} className="text-blue-500" />
                    <span>{module}</span>
                    <ChevronRight size={14} className="text-slate-300" />
                    <span className="text-slate-900">{menu}</span>
                </div>

                <div className="flex-1 max-w-[320px] hidden md:block ml-4">
                    <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                            <Search size={16} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full h-9 pl-9 pr-4 bg-slate-50 border border-slate-200/60 rounded-lg outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/5 transition-all text-xs font-medium"
                        />
                    </div>
                </div>

            </div>

            <div className="flex items-center gap-2">
                <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors group">
                    <Bell size={20} className="group-hover:scale-110 transition-transform" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                <div className="w-px h-6 bg-slate-200 mx-2"></div>
                <div className="flex items-center gap-3 pl-2">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-bold text-slate-900 leading-none mb-1">
                            {localStorage.getItem('userName') || ''}
                        </p>
                        <p className="text-[10px] font-bold text-green-500 flex items-center justify-end gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            Online
                        </p>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-500/30 ring-2 ring-white">
                        {(localStorage.getItem('userName') || '').charAt(0)}
                    </div>
                </div>

            </div>
        </header>
    );
};

export default Header;
