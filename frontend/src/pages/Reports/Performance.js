import React from 'react';
import {
    BarChart3,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Users,
    Clock,
    IndianRupee,
    AlertTriangle,
    CheckCircle2
} from 'lucide-react';

const ReportCard = ({ title, value, sub, trend, isPositive, icon, colorClass }) => (
    <div className="bg-white p-8 rounded-[40px] border border-slate-200/60 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
        <div className={`absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform ${colorClass}`}>
            {icon}
        </div>
        <div className="relative z-10 space-y-6">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-slate-200/50 ${colorClass}`}>
                {React.cloneElement(icon, { size: 24 })}
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{value}</h3>
                    <span className="text-sm font-bold text-slate-500 uppercase">{sub}</span>
                </div>
            </div>
            <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {trend}
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">vs Last Quarter</span>
            </div>
        </div>
    </div>
);

const Performance = () => {
    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <BarChart3 className="text-indigo-600" size={32} />
                        Performance Hub
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Measuring procurement efficiency and organizational spend velocity.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">
                        Export PDF
                    </button>
                    <button className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20">
                        View Audit trail
                    </button>
                </div>
            </div>

            {/* Top KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ReportCard
                    title="Avg Approval Time"
                    value="4.2"
                    sub="Days"
                    trend="12%"
                    isPositive={true}
                    icon={<Clock />}
                    colorClass="bg-amber-50 text-amber-600"
                />
                <ReportCard
                    title="Procurement Spend"
                    value="₹12.4"
                    sub="Lakhs"
                    trend="24%"
                    isPositive={false}
                    icon={<IndianRupee />}
                    colorClass="bg-indigo-50 text-indigo-600"
                />
                <ReportCard
                    title="Vendor Reliability"
                    value="98.2"
                    sub="%"
                    trend="1.5%"
                    isPositive={true}
                    icon={<CheckCircle2 />}
                    colorClass="bg-emerald-50 text-emerald-600"
                />
                <ReportCard
                    title="Rejected PRs"
                    value="14"
                    sub="Units"
                    trend="5%"
                    isPositive={true}
                    icon={<AlertTriangle />}
                    colorClass="bg-rose-50 text-rose-600"
                />
            </div>

            {/* Graphs Layer */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-[48px] border border-slate-200/60 shadow-sm min-h-[400px] flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 text-blue-500/5 -mr-12 -mt-12">
                            <TrendingUp size={240} />
                        </div>
                        <div className="relative z-10 flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Spend Trajectory</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">Real-time expenditure visualization engine (VFX Optimized)</p>
                            </div>
                            <div className="flex gap-2">
                                <span className="w-3 h-3 rounded-full bg-indigo-500" />
                                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                                <span className="w-3 h-3 rounded-full bg-slate-200" />
                            </div>
                        </div>
                        <div className="flex-1 bg-slate-50/50 rounded-[32px] border border-dashed border-slate-200 flex items-center justify-center">
                            <div className="text-center space-y-4">
                                <TrendingUp className="text-slate-200 mx-auto" size={48} />
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Holographic Chart Engine Initializing...</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 p-10 rounded-[48px] text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden">
                    <div className="relative z-10 space-y-10">
                        <div className="pb-8 border-b border-white/10">
                            <h3 className="text-lg font-black tracking-tight mb-2">Efficiency Insight</h3>
                            <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                Our data models suggest a **14% increase** in inter-departmental requisition speed after Phase 3 automation.
                            </p>
                        </div>

                        <div className="space-y-8">
                            {[
                                { label: 'Data Quality', value: '94%', color: 'bg-emerald-500' },
                                { label: 'System Uptime', value: '99.9%', color: 'bg-indigo-500' },
                                { label: 'Compliance Index', value: '88%', color: 'bg-amber-500' },
                            ].map((item, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</span>
                                        <span className="text-sm font-black italic">{item.value}</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className={`h-full ${item.color} rounded-full`} style={{ width: item.value }} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-8 border-t border-white/10">
                            <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all text-blue-400 flex items-center justify-center gap-2">
                                <Users size={14} />
                                View Team Leaderboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Performance;
