import React, { useState, useEffect } from 'react';
import {
    Users,
    Plus,
    Search,
    Filter,
    Mail,
    Phone,
    Building2,
    Calendar,
    ArrowUpRight,
    CheckCircle2,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getLeadsAPI } from '../../api/lead';

const LeadManagement = () => {
    const navigate = useNavigate();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            setLoading(true);
            const data = await getLeadsAPI();
            setLeads(data);
        } catch (error) {
            console.error('Error fetching leads:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'NEW': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'CONTACTED': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'QUALIFIED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'LOST': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    const filteredLeads = leads.filter(lead =>
        lead.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.leadNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 pb-24 text-slate-900">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                            <Users size={24} />
                        </div>
                        Lead Management
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Track and nurture your sales prospects</p>
                </div>
                <button
                    onClick={() => navigate('/leads/create')}
                    className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-bold hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-95"
                >
                    <Plus size={20} />
                    Create New Lead
                </button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Total Leads', value: leads.length, icon: <Users size={20} />, color: 'bg-slate-900' },
                    { label: 'Qualified', value: leads.filter(l => l.status === 'QUALIFIED').length, icon: <CheckCircle2 size={20} />, color: 'bg-emerald-600' },
                    { label: 'Follow Ups', value: leads.filter(l => l.status === 'CONTACTED').length, icon: <Calendar size={20} />, color: 'bg-amber-500' },
                    { label: 'Lost', value: leads.filter(l => l.status === 'LOST').length, icon: <AlertCircle size={20} />, color: 'bg-rose-500' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                        <div className={`w-10 h-10 ${stat.color} rounded-2xl flex items-center justify-center text-white mb-4`}>
                            {stat.icon}
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                        <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search leads by name, company or ID..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-900"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-slate-50 text-slate-600 rounded-2xl font-bold hover:bg-slate-100 transition-all">
                        <Filter size={18} />
                        Filter
                    </button>
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-slate-50 text-slate-600 rounded-2xl font-bold hover:bg-slate-100 transition-all">
                        Export
                    </button>
                </div>
            </div>

            {/* Leads Table */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <Loader2 className="animate-spin text-primary" size={40} />
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Leads...</p>
                    </div>
                ) : filteredLeads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4">
                            <Users size={40} />
                        </div>
                        <h3 className="text-lg font-black text-slate-900">No Leads Found</h3>
                        <p className="text-slate-500 max-w-xs mt-2">Try adjusting your search or create a new lead to get started.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Lead ID & Name</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Company & Contact</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Source</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Assigned To</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredLeads.map((lead) => (
                                    <tr key={lead._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-black text-xs">
                                                    {lead.firstName?.[0]}{lead.lastName?.[0]}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-primary uppercase tracking-tighter mb-0.5">{lead.leadNumber}</p>
                                                    <p className="font-bold text-slate-900">{lead.firstName} {lead.lastName}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-1">
                                                <Building2 size={14} className="text-slate-400" />
                                                {lead.companyName || 'Individual'}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                                                    <Mail size={12} /> {lead.email}
                                                </span>
                                                <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium border-l border-slate-200 pl-3">
                                                    <Phone size={12} /> {lead.phone}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-xs font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
                                                {lead.source}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black border uppercase tracking-widest ${getStatusColor(lead.status)}`}>
                                                {lead.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-[8px] font-black text-slate-900">
                                                    {lead.assignedTo?.name?.[0] || '?'}
                                                </div>
                                                <span className="text-sm font-bold text-slate-700">{lead.assignedTo?.name || 'Unassigned'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {lead.status === 'QUALIFIED' && (
                                                    <button
                                                        onClick={() => navigate(`/opportunities/create?leadId=${lead._id}`)}
                                                        title="Convert to Opportunity"
                                                        className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-xl transition-all border border-transparent hover:border-emerald-100"
                                                    >
                                                        <CheckCircle2 size={18} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => navigate(`/leads/edit/${lead._id}`)}
                                                    className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-primary hover:shadow-sm border border-transparent hover:border-slate-100"
                                                >
                                                    <ArrowUpRight size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeadManagement;
