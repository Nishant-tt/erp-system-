import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getModulesAPI } from '../../api/modules';
import { Search, Bell, Menu, LayoutDashboard, ChevronRight, Calendar } from 'lucide-react';

const Header = ({ toggleSidebar, isSidebarOpen }) => {
    const [modules, setModules] = useState([]);
    const location = useLocation();
    const navigate = useNavigate();

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
        let activeModulePath = null;

        modules.forEach(mod => {
            if (mod.path === location.pathname) {
                activeModule = mod.name;
                activeModulePath = mod.path;
            } else if (mod.menus) {
                const menu = mod.menus.find(m => m.path === location.pathname);
                if (menu) {
                    activeModule = mod.name;
                    activeMenu = menu.name;
                    activeModulePath = mod.path || mod.menus?.[0]?.path || menu.path;
                }
            }
        });

        // Fallback for root or special pages
        if (location.pathname === '/dashboard') return { module: 'Dashboard', menu: 'Overview', modulePath: '/dashboard' };
        if (location.pathname === '/profile') return { module: 'User', menu: 'Profile', modulePath: '/profile' };

        return { module: activeModule || 'Dashboard', menu: activeMenu || 'Overview', modulePath: activeModulePath || '/dashboard' };
    };

    const { module, menu, modulePath } = getActiveNames();

    return (
        <header
            className={`h-14 sm:h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-3 sm:px-4 md:px-6 fixed top-0 right-0 left-0 z-40 shadow-sm min-w-0 transition-[left] duration-300 ${isSidebarOpen ? 'md:left-64' : 'md:left-16'}`}
        >
            <div className="flex items-center gap-2 sm:gap-4 md:gap-6 min-w-0 flex-1">
                <button
                    onClick={toggleSidebar}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 md:hidden shrink-0"
                    aria-label="Toggle menu"
                >
                    <Menu size={20} />
                </button>

                <div className="hidden lg:flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest truncate">
                    <LayoutDashboard size={14} className="text-blue-500" />
                    <button
                        type="button"
                        onClick={() => modulePath && navigate(modulePath)}
                        className="hover:text-blue-600 transition-colors truncate"
                        title={module}
                    >
                        {module}
                    </button>
                    <ChevronRight size={14} className="text-slate-300" />
                    <span className="text-slate-900">{menu}</span>
                </div>

                <div className="flex-1 max-w-[200px] lg:max-w-[320px] hidden md:block ml-2 lg:ml-4 min-w-0">
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

            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                {typeof localStorage !== 'undefined' && localStorage.getItem('activeFY') && (
                    <div className="hidden sm:flex items-center gap-2 px-2 sm:px-3 py-1.5 bg-orange-50 border border-orange-100 rounded-lg text-orange-700 mx-0 sm:mx-2">
                        <Calendar size={14} className="text-orange-500 shrink-0" />
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none truncate max-w-[100px] sm:max-w-none">
                            {JSON.parse(localStorage.getItem('activeFY')).name}
                        </span>
                    </div>
                )}
                <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors group" aria-label="Notifications">
                    <Bell size={20} className="group-hover:scale-110 transition-transform" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                <div className="w-px h-5 sm:h-6 bg-slate-200 mx-0 sm:mx-2" />
                <div className="flex items-center gap-2 sm:gap-3 pl-0 sm:pl-2">
                    <div className="text-right hidden sm:block min-w-0">
                        <p className="text-xs font-bold text-slate-900 leading-none mb-0.5 truncate max-w-[80px] md:max-w-[120px]">
                            {typeof localStorage !== 'undefined' ? localStorage.getItem('userName') || '' : ''}
                        </p>
                        <p className="text-[10px] font-bold text-green-500 flex items-center justify-end gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0"></span>
                            Online
                        </p>
                    </div>
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/30 ring-2 ring-white shrink-0">
                        {(typeof localStorage !== 'undefined' ? localStorage.getItem('userName') : '')?.charAt(0) || '?'}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
