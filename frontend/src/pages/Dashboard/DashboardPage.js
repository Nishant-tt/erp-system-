import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Users, ShoppingBag, IndianRupee, ArrowUpRight, ArrowDownRight, MoreHorizontal, Plus } from 'lucide-react';


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
    const navigate = useNavigate();
    const stats = [
        { icon: <ShoppingBag size={22} />, label: 'Pending PRs', value: '12', trend: '8%', isPositive: false, colorClass: 'bg-amber-50 text-amber-600' },
        { icon: <IndianRupee size={22} />, label: 'Approved Value', value: '₹12.4L', trend: '15%', isPositive: true, colorClass: 'bg-emerald-50 text-emerald-600' },
        { icon: <Users size={22} />, label: 'Onboarded Vendors', value: '48', trend: '4%', isPositive: true, colorClass: 'bg-blue-50 text-blue-600' },
        { icon: <TrendingUp size={22} />, label: 'Budget Utilization', value: '64.2%', trend: '2.1%', isPositive: true, colorClass: 'bg-indigo-50 text-indigo-600' },
    ];

    return (
        <>
            <div className="mb-10 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                        Procurement Command
                    </h1>
                    <p className="text-slate-500 font-medium italic text-sm">Real-time oversight of requisition lifecycles and vendor performance.</p>
                </div>
                <div className="flex gap-3">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold">U{i}</div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Quick Actions & Chart */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button
                            onClick={() => navigate('/prs/create')}
                            className="bg-primary p-6 rounded-[32px] text-white text-left group hover:shadow-xl hover:shadow-primary/20 transition-all"
                        >
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Plus size={20} />
                            </div>
                            <h4 className="font-black text-[10px] uppercase tracking-widest mb-1">Raise PR</h4>
                            <p className="text-[8px] opacity-60 font-medium uppercase tracking-widest leading-relaxed">New Requisition</p>
                        </button>
                        <button
                            onClick={() => navigate('/grns/create')}
                            className="bg-emerald-600 p-6 rounded-[32px] text-white text-left group hover:shadow-xl hover:shadow-emerald-600/20 transition-all font-bold"
                        >
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform font-bold">
                                <ShoppingBag size={20} />
                            </div>
                            <h4 className="font-black text-[10px] uppercase tracking-widest mb-1 font-bold">Inward Goods</h4>
                            <p className="text-[8px] opacity-60 font-medium uppercase tracking-widest leading-relaxed font-bold">Process GRN</p>
                        </button>
                        <button
                            onClick={() => navigate('/invoices/create')}
                            className="bg-amber-500 p-6 rounded-[32px] text-white text-left group hover:shadow-xl hover:shadow-amber-500/20 transition-all font-bold"
                        >
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform font-bold">
                                <TrendingUp size={20} />
                            </div>
                            <h4 className="font-black text-[10px] uppercase tracking-widest mb-1">Book Bill</h4>
                            <p className="text-[8px] opacity-60 font-medium uppercase tracking-widest leading-relaxed">Book Invoice</p>
                        </button>
                        <button
                            onClick={() => navigate('/payments/process')}
                            className="bg-slate-900 p-6 rounded-[32px] text-white text-left group hover:shadow-xl transition-all font-bold"
                        >
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform font-bold">
                                <Users size={20} />
                            </div>
                            <h4 className="font-black text-[10px] uppercase tracking-widest mb-1 font-bold">Disburse</h4>
                            <p className="text-[8px] opacity-40 font-medium uppercase tracking-widest leading-relaxed font-bold">Pay Vendor</p>
                        </button>
                    </div>

                    <div className="bg-white p-8 rounded-[40px] border border-slate-200/60 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 text-primary/5 -mr-8 -mt-8">
                            <TrendingUp size={160} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Requisition Velocity</h3>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Submission rate vs Approval time (Avg 4.2 days)</p>
                                </div>
                            </div>
                            <div className="h-[240px] bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 border border-dashed border-slate-200 font-black tracking-[0.2em] uppercase text-[10px]">
                                Temporal Analytics Active
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Alerts */}
                <div className="bg-white p-8 rounded-[40px] border border-slate-200/60 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Action Required</h3>
                        <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">3 NEW</span>
                    </div>
                    <div className="space-y-6">
                        {[
                            { title: 'PR-2024-012 Pending', desc: 'Marketing Laptop Upgrade (₹2,45,000)', time: '2 mins ago', color: 'bg-amber-500' },
                            { title: 'New Vendor Onboarded', desc: 'Silicon Systems Ltd (GST Verified)', time: '45 mins ago', color: 'bg-emerald-500' },
                            { title: 'PR Rejected', desc: 'Office Supplies (Missing justification)', time: '2 hours ago', color: 'bg-rose-500' },
                            { title: 'Budget Alert', desc: 'IT Dept has consumed 85% of Q1 limit', time: '5 hours ago', color: 'bg-blue-500' },
                        ].map((log, i) => (
                            <div key={i} className="flex gap-4 items-start group cursor-pointer hover:bg-slate-50 p-2 rounded-2xl transition-all">
                                <div className={`w-2.5 h-2.5 rounded-full mt-2 shrink-0 ${log.color} shadow-lg shadow-${log.color.split('-')[1]}-500/40`}></div>
                                <div>
                                    <p className="text-sm font-black text-slate-800 tracking-tight leading-tight mb-1">{log.title}</p>
                                    <p className="text-[10px] font-medium text-slate-400 uppercase mb-2 tracking-wide">{log.desc}</p>
                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{log.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-8 py-4 border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase text-slate-400 tracking-widest hover:border-primary/20 hover:text-primary transition-all">
                        View Audit Log
                    </button>
                </div>
            </div>
        </>
    );
};

export default DashboardPage;
