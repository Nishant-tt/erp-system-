import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    TrendingUp,
    Users,
    Target,
    DollarSign,
    PieChart,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    Filter,
    Download
} from 'lucide-react';
import { getOpportunitiesAPI } from '../../api/opportunity';
import { getSalesInvoicesAPI } from '../../api/salesInvoice';

const SalesAnalytics = () => {
    const [stats, setStats] = useState({
        revenue: 0,
        pipeline: 0,
        winRate: 0,
        avgDealSize: 0,
        monthlyData: [],
        topCustomers: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const [opps, invoices] = await Promise.all([
                getOpportunitiesAPI(),
                getSalesInvoicesAPI()
            ]);

            const totalRevenue = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
            const totalPipeline = opps.reduce((sum, opp) => sum + opp.expectedValue, 0);
            const wonOpps = opps.filter(o => o.stage === 'WON').length;
            const winRate = opps.length ? (wonOpps / opps.length) * 100 : 0;
            const avgDeal = invoices.length ? totalRevenue / invoices.length : 0;

            setStats({
                revenue: totalRevenue,
                pipeline: totalPipeline,
                winRate: Math.round(winRate),
                avgDealSize: Math.round(avgDeal),
                monthlyData: [
                    { month: 'Jan', revenue: totalRevenue * 0.8 },
                    { month: 'Feb', revenue: totalRevenue },
                ],
                topCustomers: invoices.slice(0, 5).map(inv => ({
                    name: inv.customer?.name,
                    value: inv.grandTotal
                }))
            });
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 pb-24 text-slate-900">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                            <BarChart3 size={24} />
                        </div>
                        Sales Performance
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Real-time insights across your sales lifecycle</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-white border border-slate-200 px-5 py-2.5 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all">
                        <Calendar size={18} />
                        Last 30 Days
                    </button>
                    <button className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:shadow-lg transition-all active:scale-95">
                        <Download size={18} />
                        Export Report
                    </button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Total Revenue', value: stats.revenue, prefix: '₹', trend: '+12%', up: true, icon: <DollarSign size={24} />, color: 'bg-emerald-500' },
                    { label: 'Pipeline Value', value: stats.pipeline, prefix: '₹', trend: '+18%', up: true, icon: <Target size={24} />, color: 'bg-indigo-500' },
                    { label: 'Win Rate', value: stats.winRate, suffix: '%', trend: '-2%', up: false, icon: <TrendingUp size={24} />, color: 'bg-amber-500' },
                    { label: 'Avg Deal Size', value: stats.avgDealSize, prefix: '₹', trend: '+5%', up: true, icon: <Users size={24} />, color: 'bg-rose-500' },
                ].map((metric, i) => (
                    <div key={i} className="bg-white p-7 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className={`w-12 h-12 ${metric.color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-opacity-20`}>
                                {metric.icon}
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{metric.label}</p>
                            <h3 className="text-2xl font-black text-slate-900 mb-2">
                                {metric.prefix}{metric.value.toLocaleString()}{metric.suffix}
                            </h3>
                            <div className="flex items-center gap-1.5 pt-2 border-t border-slate-50 mt-4">
                                {metric.up ? <ArrowUpRight size={14} className="text-emerald-500" /> : <ArrowDownRight size={14} className="text-rose-500" />}
                                <span className={`text-[10px] font-black ${metric.up ? 'text-emerald-500' : 'text-rose-500'} uppercase tracking-widest leading-none`}>
                                    {metric.trend} <span className="text-slate-400 ml-1">vs last month</span>
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Revenue Chart Placeholder */}
                <div className="lg:col-span-2 bg-slate-900 rounded-[40px] p-8 text-white">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold mb-1">Revenue Trend</h3>
                            <p className="text-white/40 text-xs font-medium">Monthly performance overview</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="bg-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Monthly</button>
                            <button className="bg-white/5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40">Weekly</button>
                        </div>
                    </div>
                    {/* Visualizer placeholder */}
                    <div className="h-64 flex items-end justify-between gap-4 px-4 pb-4">
                        {[40, 60, 45, 70, 55, 90, 80, 75, 85, 95, 88].map((val, i) => (
                            <div key={i} className="flex-1 group relative">
                                <div
                                    className="w-full bg-indigo-500/30 group-hover:bg-indigo-500 rounded-t-lg transition-all"
                                    style={{ height: `${val}%` }}
                                ></div>
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-slate-900 px-2 py-1 rounded-md text-[9px] font-black opacity-0 group-hover:opacity-100 transition-opacity">
                                    ₹{Math.round(val * 10).toLocaleString()}k
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between px-4 mt-4 text-[10px] font-black uppercase tracking-widest text-white/30">
                        <span>Jan</span>
                        <span>Feb</span>
                        <span>Mar</span>
                        <span>Apr</span>
                        <span>May</span>
                        <span>Jun</span>
                        <span>Jul</span>
                        <span>Aug</span>
                        <span>Sep</span>
                        <span>Oct</span>
                        <span>Nov</span>
                    </div>
                </div>

                {/* Top Customers */}
                <div className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Focus Customers</h3>
                        <PieChart size={20} className="text-slate-400" />
                    </div>
                    <div className="space-y-6">
                        {stats.topCustomers.map((customer, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 font-black text-xs">
                                    {customer.name?.[0]}
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-sm text-slate-900 truncate">{customer.name}</p>
                                    <div className="flex items-center justify-between mt-1">
                                        <div className="w-full max-w-[100px] h-1.5 bg-slate-50 rounded-full overflow-hidden mr-3">
                                            <div className="h-full bg-indigo-600" style={{ width: `${(customer.value / stats.revenue) * 100}%` }}></div>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400">₹{customer.value.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all">
                        View Customer Insights
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SalesAnalytics;
