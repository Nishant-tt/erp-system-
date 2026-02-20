import React from 'react';
import { TrendingUp, Users, ShoppingBag, DollarSign, ArrowUpRight, ArrowDownRight, MoreHorizontal } from 'lucide-react';


const StatCard = ({ icon, label, value, trend, isPositive, colorClass }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${colorClass}`}>
                {icon}
            </div>
            <button className="text-slate-400 hover:text-slate-600">
                <MoreHorizontal size={20} />
            </button>
        </div>
        <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">{label}</p>
            <div className="flex items-end justify-between">
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
                <div className={`flex items-center gap-1 text-sm font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    {trend}
                </div>
            </div>
        </div>
    </div>
);

const DashboardPage = () => {
    const stats = [
        { icon: <Users size={22} />, label: 'Total Customers', value: '1,284', trend: '12%', isPositive: true, colorClass: 'bg-blue-50 text-blue-600' },
        { icon: <ShoppingBag size={22} />, label: 'New Orders', value: '156', trend: '5.4%', isPositive: true, colorClass: 'bg-rose-50 text-rose-600' },
        { icon: <TrendingUp size={22} />, label: 'Growth Rate', value: '24.8%', trend: '2.1%', isPositive: true, colorClass: 'bg-emerald-50 text-emerald-600' },
        { icon: <DollarSign size={22} />, label: 'Total Revenue', value: '$45,280', trend: '1.5%', isPositive: false, colorClass: 'bg-amber-50 text-amber-600' },
    ];

    return (
        <>
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
                    Systems Overview
                </h1>
                <p className="text-slate-500 font-medium">Monitoring business metrics and system performance in real-time.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Revenue Analytics</h3>
                            <p className="text-sm text-slate-500 font-medium">Monthly revenue progression for 2024</p>
                        </div>
                        <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-semibold outline-none focus:border-blue-600">
                            <option>Last 12 Months</option>
                            <option>Last 6 Months</option>
                        </select>
                    </div>
                    <div className="h-[320px] bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-dashed border-slate-300 font-bold tracking-widest uppercase text-xs">
                        Analytics Visualisation Engine
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-lg font-bold text-slate-900">Recent Logs</h3>
                        <button className="text-blue-600 text-sm font-bold hover:underline">View All</button>
                    </div>
                    <div className="space-y-6">
                        {[
                            { title: 'New User Registered', time: '12 mins ago', color: 'bg-blue-500' },
                            { title: 'Server Cache Cleared', time: '45 mins ago', color: 'bg-emerald-500' },
                            { title: 'System Batch Update', time: '2 hours ago', color: 'bg-amber-500' },
                            { title: 'API Connection Refused', time: '5 hours ago', color: 'bg-rose-500' },
                            { title: 'Database Optimized', time: '1 day ago', color: 'bg-indigo-500' },
                        ].map((log, i) => (
                            <div key={i} className="flex gap-4 items-start">
                                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${log.color}`}></div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800 leading-none mb-1.5">{log.title}</p>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-tighter">{log.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default DashboardPage;
