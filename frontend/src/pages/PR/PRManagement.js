import React, { useState, useEffect } from 'react';
import { getPRsAPI, submitPRAPI, approvePRAPI, rejectPRAPI } from '../../api/pr';
import {
    ClipboardList,
    Plus,
    Search,
    Filter,
    Clock,
    CheckCircle2,
    XCircle,
    FileText,
    ChevronRight,
    Loader2,
    MessageSquare,
    IndianRupee
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PRManagement = () => {
    const navigate = useNavigate();
    const [prs, setPrs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const userRole = sessionStorage.getItem('role');

    useEffect(() => {
        fetchPRs();
    }, []);

    const fetchPRs = async () => {
        try {
            const data = await getPRsAPI();
            setPrs(data);
        } catch (error) {
            console.error('Error fetching PRs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'DRAFT': return 'bg-slate-100 text-slate-600 border-slate-200';
            case 'PENDING_APPROVAL': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'APPROVED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'REJECTED': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'DRAFT': return <FileText size={14} />;
            case 'PENDING_APPROVAL': return <Clock size={14} className="animate-pulse" />;
            case 'APPROVED': return <CheckCircle2 size={14} />;
            case 'REJECTED': return <XCircle size={14} />;
            default: return null;
        }
    };

    const filteredPRs = prs.filter(pr => {
        const matchesSearch = pr.prNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pr.requestedBy?.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || pr.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Requisition Dashboard</h1>
                    <p className="text-slate-500 font-medium">Manage and track your procurement requests.</p>
                </div>
                <button
                    onClick={() => navigate('/prs/create')}
                    className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 hover:-translate-y-1 active:translate-y-0"
                >
                    <Plus size={18} />
                    New Requisition
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total PRs', count: prs.length, color: 'bg-white text-slate-900' },
                    { label: 'Pending', count: prs.filter(p => p.status === 'PENDING_APPROVAL').length, color: 'bg-amber-500 text-white' },
                    { label: 'Approved', count: prs.filter(p => p.status === 'APPROVED').length, color: 'bg-emerald-500 text-white' },
                    { label: 'Drafts', count: prs.filter(p => p.status === 'DRAFT').length, color: 'bg-slate-900 text-white' }
                ].map((stat, idx) => (
                    <div key={idx} className={`${stat.color} p-6 rounded-[32px] border border-slate-200/60 shadow-sm`}>
                        <p className={`text-[10px] font-black uppercase tracking-widest opacity-60 mb-1`}>{stat.label}</p>
                        <p className="text-3xl font-black tracking-tighter">{stat.count}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search by PR# or Requester..."
                        className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 transition-all font-bold text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    {['ALL', 'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-6 py-4 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === status
                                    ? 'bg-slate-900 border-slate-900 text-white'
                                    : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                                }`}
                        >
                            {status === 'PENDING_APPROVAL' ? 'Pending' : status === 'ALL' ? 'Total' : status}
                        </button>
                    ))}
                </div>
            </div>

            {/* PR List */}
            <div className="grid grid-cols-1 gap-4">
                {filteredPRs.map((pr) => (
                    <div
                        key={pr._id}
                        onClick={() => navigate(`/prs/${pr._id}`)}
                        className="bg-white p-6 rounded-[32px] border border-slate-200/60 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group cursor-pointer flex flex-col md:flex-row md:items-center gap-6"
                    >
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
                            <ClipboardList className="text-slate-400 group-hover:text-primary" size={24} />
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <span className="text-lg font-black text-slate-900 tracking-tight">{pr.prNumber}</span>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(pr.status)} flex items-center gap-1.5`}>
                                    {getStatusIcon(pr.status)}
                                    {pr.status.replace('_', ' ')}
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400">
                                <span className="flex items-center gap-1.5 uppercase tracking-widest">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40"></div>
                                    {pr.department?.name}
                                </span>
                                <span className="flex items-center gap-1.5 uppercase tracking-widest">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                                    Requested by: <span className="text-slate-600">{pr.requestedBy?.name}</span>
                                </span>
                                <span>{new Date(pr.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            </div>
                        </div>

                        <div className="text-right flex flex-col items-end gap-2">
                            <div className="flex items-center gap-1 text-2xl font-black text-slate-900 tracking-tighter">
                                <IndianRupee size={20} className="text-slate-400" />
                                {pr.totalAmount.toLocaleString('en-IN')}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-primary tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                View Details
                                <ChevronRight size={14} />
                            </div>
                        </div>
                    </div>
                ))}

                {filteredPRs.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-20 h-20 bg-slate-50 rounded-[40px] flex items-center justify-center text-slate-200">
                            <FileText size={40} />
                        </div>
                        <div className="max-w-xs">
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">No Requisitions Found</h3>
                            <p className="text-sm text-slate-500 font-medium">Either you haven't raised any requests, or they don't match your filters.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PRManagement;
