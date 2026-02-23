import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsersAPI } from '../../api/user';
import {
    Shield,
    Users,
    Building2,
    ShieldCheck,
    ChevronRight,
    ArrowRight,
    Lock,
    Settings,
    UserPlus,
    Truck
} from 'lucide-react';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        users: 0,
        departments: 0,
        roles: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const users = await getUsersAPI();
                setStats({
                    users: users.length,
                    departments: 4,
                    roles: 5
                });
            } catch (error) {
                console.error('Error fetching admin stats:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const managementCards = [
        {
            title: "User Management",
            description: "Create new members, assign roles, and link departments.",
            icon: <Users className="text-blue-600" size={24} />,
            path: "/admin/users",
            color: "bg-blue-50"
        },
        {
            title: "Roles & Permissions",
            description: "Define system access levels and operational capabilities.",
            icon: <Shield className="text-emerald-600" size={24} />,
            path: "/admin/roles",
            color: "bg-emerald-50"
        },
        {
            title: "Department Master",
            description: "Manage business units, codes, and budgetary controls.",
            icon: <Building2 className="text-indigo-600" size={24} />,
            path: "/admin/departments",
            color: "bg-indigo-50"
        },
        {
            title: "Supplier Master",
            description: "Onboard vendors, track GST/PAN, and manage bank data.",
            icon: <Truck className="text-orange-600" size={24} />,
            path: "/admin/suppliers",
            color: "bg-orange-50"
        }
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-200/60 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-full -mr-20 -mt-20 transition-transform group-hover:scale-110" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">
                                Control Center
                            </span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Admin Console</h1>
                        <p className="text-slate-500 font-medium text-lg mt-1">Configure your organization's digital ecosystem.</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => navigate('/admin/users')}
                            className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-primary-hover transition-all hover:-translate-y-1 shadow-xl shadow-primary/20 active:translate-y-0"
                        >
                            <UserPlus size={18} />
                            Provision User
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Management Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {managementCards.map((card, idx) => (
                    <button
                        key={idx}
                        onClick={() => navigate(card.path)}
                        className="bg-white p-8 rounded-[40px] border border-slate-200/60 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all text-left group relative overflow-hidden"
                    >
                        <div className={`w-14 h-14 ${card.color} rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
                            {card.icon}
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-3">{card.title}</h3>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6">
                            {card.description}
                        </p>
                        <div className="flex items-center text-primary font-black text-[10px] uppercase tracking-widest gap-2">
                            Manage Details
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </button>
                ))}
            </div>

            {/* Quick Actions & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden">
                    <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-tl-full -mb-10 -mr-10" />
                    <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                        <Settings size={24} className="text-primary" />
                        System Health
                    </h3>
                    <div className="space-y-6 relative z-10">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                            <span className="text-sm font-bold text-slate-400">Database Connection</span>
                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase rounded-md tracking-widest border border-emerald-500/20">Optimal</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                            <span className="text-sm font-bold text-slate-400">Auth Service</span>
                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase rounded-md tracking-widest border border-emerald-500/20">Operational</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white p-8 rounded-[40px] border border-slate-200/60 shadow-sm flex flex-col justify-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Platform Users</p>
                        <p className="text-4xl font-black text-slate-900 tracking-tighter">{stats.users}</p>
                    </div>
                    <div className="bg-white p-8 rounded-[40px] border border-slate-200/60 shadow-sm flex flex-col justify-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Business Units</p>
                        <p className="text-4xl font-black text-slate-900 tracking-tighter">{stats.departments}</p>
                    </div>
                    <div className="col-span-2 bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[40px] text-white shadow-xl shadow-indigo-600/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mb-1">Access Roles</p>
                                <p className="text-3xl font-black">{stats.roles}</p>
                            </div>
                            <ShieldCheck size={40} className="text-white/20" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
