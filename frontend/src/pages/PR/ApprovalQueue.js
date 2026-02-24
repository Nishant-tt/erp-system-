import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPRsAPI } from '../../api/pr';
import {
    CheckCircle,
    Clock,
    ArrowRight,
    Search,
    Filter,
    ShieldCheck,
    Loader2,
    IndianRupee,
    User,
    Building2,
    AlertCircle
} from 'lucide-react';

const ApprovalQueue = () => {
    const navigate = useNavigate();
    const [prs, setPrs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const userRole = localStorage.getItem('role');

    useEffect(() => {
        if (userRole !== 'Admin' && userRole !== 'Manager') {
            navigate('/dashboard');
            return;
        }
        fetchPendingPRs();
    }, [userRole, navigate]);

    const fetchPendingPRs = async () => {
        try {
            const data = await getPRsAPI();
            // Filter only pending approval
            setPrs(data.filter(pr => pr.status === 'PENDING_APPROVAL'));
        } catch (error) {
            console.error('Error fetching approval queue:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredPRs = prs.filter(pr =>
        pr.prNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pr.requestedBy?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pr.department?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <CheckCircle className="text-amber-500" size={32} />
                        Approval Queue
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Review and authorize pending purchase requisitions.</p>
                </div>
                <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-100">
                    <ShieldCheck size={18} className="text-amber-600" />
                    <span className="text-xs font-black text-amber-700 uppercase tracking-widest">{prs.length} Pending Actions</span>
                </div>
            </div>

            {/* Search & Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search by PR#, Requester, or Department..."
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[32px] outline-none focus:border-primary/20 shadow-sm font-medium transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-100 text-slate-600 rounded-[32px] font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all border border-slate-200">
                    <Filter size={18} />
                    Filters
                </button>
            </div>

            {filteredPRs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPRs.map((pr) => (
                        <div key={pr._id} className="bg-white rounded-[40px] border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all group overflow-hidden flex flex-col">
                            {/* Card Header */}
                            <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-xs font-black text-primary px-3 py-1 bg-primary/5 rounded-lg border border-primary/10">
                                        {pr.prNumber}
                                    </span>
                                    <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                                        <Clock size={12} />
                                        Pending
                                    </div>
                                </div>
                                <h3 className="text-xl font-black text-slate-900 leading-tight line-clamp-2 min-h-[56px]">
                                    {pr.items[0]?.description} {pr.items.length > 1 && `+ ${pr.items.length - 1} more`}
                                </h3>
                            </div>

                            {/* Card Body */}
                            <div className="p-8 space-y-6 flex-1">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Requester</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-600 uppercase">
                                                {pr.requestedBy?.name.charAt(0)}
                                            </div>
                                            <span className="text-xs font-bold text-slate-700">{pr.requestedBy?.name}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</p>
                                        <div className="flex items-center gap-2 text-slate-700">
                                            <Building2 size={12} className="text-slate-400" />
                                            <span className="text-xs font-bold">{pr.department?.name}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-50 flex justify-between items-end">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estimated Value</p>
                                        <div className="flex items-center gap-1 text-2xl font-black text-slate-900 tracking-tighter">
                                            <IndianRupee size={18} className="text-primary-hover" />
                                            {pr.totalAmount.toLocaleString('en-IN')}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/prs/${pr._id}`)}
                                        className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center group-hover:bg-primary transition-colors shadow-lg shadow-slate-900/10 group-hover:shadow-primary/20"
                                    >
                                        <ArrowRight size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-[40px] border border-slate-200 border-dashed p-20 text-center space-y-4">
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Queue Clear</h3>
                    <p className="text-slate-500 font-medium max-w-sm mx-auto">
                        No pending purchase requisitions currently awaiting your review. Great job!
                    </p>
                </div>
            )}
        </div>
    );
};

export default ApprovalQueue;
