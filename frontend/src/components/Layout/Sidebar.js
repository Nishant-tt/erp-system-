import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import {
    ShieldCheck,
    LogOut,
    ChevronRight,
    ChevronLeft,
    LayoutDashboard,
} from 'lucide-react';
import { getModulesAPI } from '../../api/modules';
import { logoutAPI } from '../../api/auth';
import { useNavigate, useLocation } from 'react-router-dom';



const Sidebar = ({ isOpen, toggleSidebar }) => {
    const [modules, setModules] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();


    const [expandedModule, setExpandedModule] = useState(null);
    const userName = sessionStorage.getItem('userName') || 'Nishant';
    const userRole = sessionStorage.getItem('role') || 'Super Admin';

    useEffect(() => {
        const fetchModules = async () => {
            try {
                const data = await getModulesAPI();
                setModules(data);
            } catch (error) {
                console.error('Failed to fetch modules:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchModules();
    }, []);

    const handleLogout = async () => {
        try {
            await logoutAPI();
            sessionStorage.clear();
            navigate('/login');
        } catch (error) {
            sessionStorage.clear();
            navigate('/login');
        }
    };

    const toggleModule = (moduleId, path) => {
        if (!isOpen) {
            toggleSidebar();
            setExpandedModule(moduleId);
            return;
        }
        setExpandedModule(expandedModule === moduleId ? null : moduleId);
        if (path) navigate(path);
    };

    const DynamicIcon = ({ name, size = 20, className = "" }) => {
        const IconComponent = LucideIcons[name] || LayoutDashboard;
        return <IconComponent size={size} className={className} />;
    };

    return (
        <aside className={`${isOpen ? 'w-64' : 'w-16'} h-screen bg-[#0F172A] border-r border-slate-800 transition-all duration-300 flex flex-col fixed left-0 top-0 z-50 group`}>

            {/* Toggle Bar - Clickable strip on the right edge */}
            <button
                onClick={toggleSidebar}
                className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 border-4 border-[#0F172A]"
            >
                {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>

            <div className="h-16 flex items-center px-4 border-b border-slate-800/50 bg-slate-900/50">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20 ring-2 ring-blue-400/20">
                        <ShieldCheck className="text-white" size={20} />
                    </div>
                    {isOpen && (
                        <div className="flex flex-col leading-none">
                            <span className="font-black text-xl text-white tracking-tighter">
                                G-NXT
                            </span>
                            <span className="text-[10px] font-bold text-blue-500 tracking-[0.2em] mt-0.5">
                                SYSTEMS
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
                {isLoading ? (
                    <div className="flex justify-center py-4">
                        <LucideIcons.Loader2 className="animate-spin text-slate-500" size={20} />
                    </div>
                ) : (
                    modules.map((item, index) => {
                        const hasSubmenu = item.menus && item.menus.length > 0;
                        const isExpanded = expandedModule === item._id;
                        const isActive = location.pathname === item.path || (hasSubmenu && item.menus.some(m => location.pathname === m.path));

                        return (
                            <div key={index} className="space-y-1">
                                <button
                                    onClick={() => toggleModule(item._id, !hasSubmenu ? item.path : null)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group/item ${isActive
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                        } ${!isOpen && 'justify-center px-1'}`}
                                >
                                    <div className={`shrink-0 ${!isActive && 'group-hover/item:scale-110 transition-transform'}`}>
                                        <DynamicIcon name={item.icon} />
                                    </div>
                                    {isOpen && (
                                        <>
                                            <span className="font-semibold text-sm tracking-wide whitespace-nowrap flex-1 text-left">{item.name}</span>
                                            {hasSubmenu && (
                                                <ChevronRight
                                                    size={14}
                                                    className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                                                />
                                            )}
                                        </>
                                    )}
                                </button>

                                {isOpen && hasSubmenu && isExpanded && (
                                    <div className="ml-9 space-y-1 py-1">
                                        {item.menus.map((subItem, subIndex) => (
                                            <button
                                                key={subIndex}
                                                onClick={() => navigate(subItem.path)}
                                                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${location.pathname === subItem.path
                                                    ? 'text-blue-400 bg-blue-500/5'
                                                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                                                    }`}
                                            >
                                                {subItem.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </nav>

            <div className="p-3 border-t border-slate-800">
                <Link
                    to="/profile"
                    className={`flex items-center gap-3 p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors ${!isOpen && 'justify-center'}`}
                >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shrink-0 shadow-lg shadow-blue-500/10">
                        {userName.charAt(0)}
                    </div>
                    {isOpen && (
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate leading-none mb-1">{userName}</p>
                            <p className="text-[10px] font-semibold text-slate-500 truncate uppercase tracking-wider">{userRole}</p>
                        </div>
                    )}
                </Link>
                <button
                    onClick={handleLogout}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 mt-2 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all group/item ${!isOpen && 'justify-center p-2'}`}
                >
                    <LogOut size={18} className="group-hover/item:-translate-x-1 transition-transform" />
                    {isOpen && <span className="font-bold text-xs uppercase tracking-widest">Sign Out</span>}
                </button>
            </div>
        </aside>
    );
};


export default Sidebar;
