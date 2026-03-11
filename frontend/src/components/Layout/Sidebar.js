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
    const userName = localStorage.getItem('userName') || '';
    const userRole = localStorage.getItem('role') || '';

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

    // On mobile, close the sidebar after navigation so content isn't blocked.
    useEffect(() => {
        try {
            const isMobile = window.matchMedia && window.matchMedia('(max-width: 767px)').matches;
            if (isOpen && isMobile) toggleSidebar();
        } catch {
            // ignore
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);

    const navigateAndMaybeClose = (path) => {
        if (path) navigate(path);
        try {
            const isMobile = window.matchMedia && window.matchMedia('(max-width: 767px)').matches;
            if (isOpen && isMobile) toggleSidebar();
        } catch {
            // ignore
        }
    };

    const handleLogout = async () => {
        try {
            await logoutAPI();
            localStorage.clear();
            navigate('/login');
        } catch (error) {
            localStorage.clear();
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
        if (path) navigateAndMaybeClose(path);
    };

    const DynamicIcon = ({ name, size = 20, className = "" }) => {
        const IconComponent = LucideIcons[name] || LayoutDashboard;
        return <IconComponent size={size} className={className} />;
    };

    return (
        <aside
            className={`
                h-screen bg-[#0F172A] border-r border-slate-800 transition-all duration-300 flex flex-col fixed left-0 top-0 z-50 group
                w-64
                ${isOpen ? 'translate-x-0 shadow-2xl md:w-64' : '-translate-x-full md:translate-x-0 md:w-16'}
            `}
            aria-hidden={!isOpen}
        >
            {/* Toggle Bar - Always visible on desktop so user always knows where to open/close sidebar */}
            <button
                onClick={toggleSidebar}
                aria-label={isOpen ? 'Close menu' : 'Open menu'}
                className="absolute -right-3 top-1/2 -translate-y-1/2 w-7 h-14 sm:w-6 sm:h-12 bg-blue-600 hover:bg-blue-500 rounded-full hidden md:flex items-center justify-center text-white shadow-lg z-50 border-4 border-[#0F172A] transition-colors hover:scale-105 active:scale-95"
            >
                {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>

            <div className="h-14 sm:h-16 flex items-center justify-between px-3 sm:px-4 border-b border-slate-800/50 bg-slate-900/50 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20 ring-2 ring-blue-400/20">
                        <ShieldCheck className="text-white" size={20} />
                    </div>
                    {isOpen && (
                        <div className="flex flex-col leading-none">
                            <span className="font-black text-xl text-white tracking-tighter">
                                PO
                            </span>
                            <span className="text-[10px] font-bold text-blue-500 tracking-[0.2em] mt-0.5">
                                MANAGER
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                {isLoading ? (
                    <div className="flex justify-center py-4">
                        <LucideIcons.Loader2 className="animate-spin text-slate-500" size={20} />
                    </div>
                ) : (
                    modules
                        .filter((item) => item.isActive)
                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                        .map((item, index) => {
                            const hasSubmenu = item.menus && item.menus.length > 0;
                            const isExpanded = expandedModule === item._id;
                            const isActive =
                                location.pathname === item.path ||
                                (hasSubmenu && item.menus.some((m) => location.pathname === m.path));

                            // Hide Admin Console module for non-admin roles
                            if (
                                item.name === 'Admin Console' &&
                                userRole !== "Admin"
                            ) {
                                return null;
                            }

                            const sortedMenus = (item.menus || [])
                                .filter((m) => m.isActive)
                                // Remove Purchase Invoice / Vendor Payments from Procurement flow
                                .filter((m) => !["/invoices", "/invoices/create", "/payments", "/payments/process"].includes(m.path))
                                .sort((a, b) => (a.order || 0) - (b.order || 0));

                            return (
                                <div key={item._id || index} className="space-y-1">
                                    <button
                                        onClick={() => toggleModule(item._id, !hasSubmenu ? item.path : null)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group/item ${
                                            isActive
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                        } ${!isOpen && 'justify-center px-1'}`}
                                    >
                                        <div
                                            className={`shrink-0 ${
                                                !isActive && 'group-hover/item:scale-110 transition-transform'
                                            }`}
                                        >
                                            <DynamicIcon name={item.icon} />
                                        </div>
                                        {isOpen && (
                                            <>
                                                <span className="font-semibold text-sm tracking-wide whitespace-nowrap flex-1 text-left">
                                                    {item.name}
                                                </span>
                                                {hasSubmenu && (
                                                    <ChevronRight
                                                        size={14}
                                                        className={`transition-transform duration-200 ${
                                                            isExpanded ? 'rotate-90' : ''
                                                        }`}
                                                    />
                                                )}
                                            </>
                                        )}
                                    </button>

                                    {isOpen && hasSubmenu && isExpanded && sortedMenus.length > 0 && (
                                        <div className="ml-9 space-y-1 py-1">
                                            {sortedMenus.map((subItem) => (
                                                <button
                                                    key={subItem._id}
                                                    onClick={() => navigateAndMaybeClose(subItem.path)}
                                                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                                        location.pathname === subItem.path
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
