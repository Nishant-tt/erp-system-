import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPRByIdAPI, approvePRAPI, rejectPRAPI, submitPRAPI } from '../../api/pr';
import {
    ArrowLeft,
    Clock,
    CheckCircle2,
    XCircle,
    IndianRupee,
    User,
    Building2,
    Calendar,
    Send,
    ThumbsUp,
    ThumbsDown,
    Loader2,
    AlertCircle
} from 'lucide-react';

const PRDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pr, setPr] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isActioning, setIsActioning] = useState(false);
    const [comments, setComments] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });

    const userRole = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        fetchPRDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);


    const fetchPRDetails = async () => {
        try {
            const data = await getPRByIdAPI(id);
            setPr(data);
        } catch (error) {
            console.error('Error fetching PR details:', error);
            setMessage({ type: 'error', text: 'Failed to load requisition details.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async () => {
        setIsActioning(true);
        try {
            await approvePRAPI(id, comments);
            setMessage({ type: 'success', text: 'Requisition approved successfully!' });
            fetchPRDetails();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to approve requisition.' });
        } finally {
            setIsActioning(false);
        }
    };

    const handleReject = async () => {
        if (!comments.trim()) {
            setMessage({ type: 'error', text: 'Please provide a reason for rejection in the comments.' });
            return;
        }
        setIsActioning(true);
        try {
            await rejectPRAPI(id, comments);
            setMessage({ type: 'success', text: 'Requisition rejected.' });
            fetchPRDetails();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to reject requisition.' });
        } finally {
            setIsActioning(false);
        }
    };

    const handleSubmit = async () => {
        setIsActioning(true);
        try {
            await submitPRAPI(id);
            setMessage({ type: 'success', text: 'Requisition submitted for approval!' });
            fetchPRDetails();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to submit requisition.' });
        } finally {
            setIsActioning(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    if (!pr) {
        return (
            <div className="text-center py-20">
                <AlertCircle className="mx-auto text-slate-300 mb-4" size={48} />
                <h2 className="text-xl font-black text-slate-900 uppercase">PR Not Found</h2>
                <button onClick={() => navigate('/prs')} className="mt-4 text-primary font-bold uppercase text-xs">Return to Dashboard</button>
            </div>
        );
    }

    const canApprove = (userRole === 'Admin' || userRole === 'Manager') && pr.status === 'PENDING_APPROVAL';
    const canSubmit = pr.status === 'DRAFT' && pr.requestedBy?._id === userId;

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <button
                        onClick={() => navigate('/prs')}
                        className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors font-bold text-xs uppercase tracking-widest mb-2"
                    >
                        <ArrowLeft size={14} />
                        Back to List
                    </button>
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">{pr.prNumber}</h1>
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 ${pr.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            pr.status === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-100' :
                                pr.status === 'PENDING_APPROVAL' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                    'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                            {pr.status === 'APPROVED' ? <CheckCircle2 size={14} /> :
                                pr.status === 'REJECTED' ? <XCircle size={14} /> :
                                    <Clock size={14} />}
                            {pr.status.replace('_', ' ')}
                        </span>
                    </div>
                </div>
            </div>

            {message.text && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <p className="text-sm font-bold">{message.text}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Items Table */}
                    <div className="bg-white rounded-[40px] border border-slate-200/60 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-slate-100 bg-slate-50/30">
                            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Line Items</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Qty</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Unit Cost</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {pr.items.map((item, idx) => (
                                        <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-6">
                                                {item.item ? (
                                                    <div>
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.item.itemCode}</span>
                                                        <p className="text-sm font-bold text-slate-900">{item.item.itemName}</p>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm font-bold text-slate-900">{item.description}</p>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className="text-xs font-black text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                                                    {item.quantity} {item.unit}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right text-xs font-bold text-slate-500">
                                                ₹{item.estimatedUnitCost.toLocaleString('en-IN')}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <p className="text-sm font-black text-slate-900">₹{(item.quantity * item.estimatedUnitCost).toLocaleString('en-IN')}</p>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-slate-900 text-white">
                                        <td colSpan="3" className="px-8 py-6 text-sm font-black uppercase tracking-widest text-slate-400 text-right">Grand Total</td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-1 text-2xl font-black tracking-tighter">
                                                <IndianRupee size={20} className="text-primary" />
                                                {pr.totalAmount.toLocaleString('en-IN')}
                                            </div>
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Timeline / History */}
                    <div className="bg-white rounded-[40px] border border-slate-200/60 shadow-sm p-8 space-y-6">
                        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Process Timeline</h2>
                        <div className="space-y-8 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-100">
                            <div className="relative pl-10">
                                <div className="absolute left-0 top-0 w-6 h-6 bg-primary rounded-full border-4 border-white shadow-sm z-10" />
                                <div className="space-y-1">
                                    <p className="text-sm font-black text-slate-900">Requisition Created</p>
                                    <p className="text-xs font-medium text-slate-400">{new Date(pr.createdAt).toLocaleString()}</p>
                                    <p className="text-xs font-bold text-slate-600">By {pr.requestedBy?.name}</p>
                                </div>
                            </div>
                            {pr.status !== 'DRAFT' && (
                                <div className="relative pl-10">
                                    <div className="absolute left-0 top-0 w-6 h-6 bg-amber-500 rounded-full border-4 border-white shadow-sm z-10" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-black text-slate-900">Submitted for Approval</p>
                                        <p className="text-xs font-medium text-slate-400">Status changed from DRAFT to PENDING</p>
                                    </div>
                                </div>
                            )}
                            {pr.status === 'APPROVED' && (
                                <div className="relative pl-10">
                                    <div className="absolute left-0 top-0 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white shadow-sm z-10" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-black text-slate-900">Provision Authorized</p>
                                        <p className="text-xs font-medium text-slate-400">{new Date(pr.approvalDate).toLocaleString()}</p>
                                        <p className="text-xs font-bold text-slate-600">Approved by {pr.approver?.name}</p>
                                        {pr.comments && (
                                            <div className="mt-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs font-medium text-emerald-700 italic">
                                                "{pr.comments}"
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            {pr.status === 'REJECTED' && (
                                <div className="relative pl-10">
                                    <div className="absolute left-0 top-0 w-6 h-6 bg-red-500 rounded-full border-4 border-white shadow-sm z-10" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-black text-slate-900">Requisition Rejected</p>
                                        <p className="text-xs font-bold text-slate-600">By {pr.approver?.name}</p>
                                        {pr.reasonForRejection && (
                                            <div className="mt-3 p-4 bg-red-50 rounded-2xl border border-red-100 text-xs font-medium text-red-700 italic">
                                                "{pr.reasonForRejection}"
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Details */}
                <div className="space-y-6">
                    <div className="bg-white rounded-[40px] border border-slate-200/60 shadow-sm p-8 space-y-8">
                        <div>
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Entity Context</h2>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                                        <Building2 size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</p>
                                        <p className="text-sm font-bold text-slate-900">{pr.department?.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Requester</p>
                                        <p className="text-sm font-bold text-slate-900">{pr.requestedBy?.name}</p>
                                        <p className="text-[10px] font-medium text-slate-400">{pr.requestedBy?.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center shrink-0">
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Raised On</p>
                                        <p className="text-sm font-bold text-slate-900">{new Date(pr.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions for Manager/Admin */}
                        {(canApprove || canSubmit) && (
                            <div className="pt-8 border-t border-slate-100 space-y-4">
                                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Workflow Actions</h2>

                                {canApprove && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Approval Comments</label>
                                            <textarea
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium outline-none focus:border-primary/20 transition-all resize-none"
                                                placeholder="Add notes for the audit trail..."
                                                rows={3}
                                                value={comments}
                                                onChange={(e) => setComments(e.target.value)}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={handleApprove}
                                                disabled={isActioning}
                                                className="py-3.5 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                                            >
                                                {isActioning ? <Loader2 size={14} className="animate-spin" /> : <ThumbsUp size={14} />}
                                                Approve
                                            </button>
                                            <button
                                                onClick={handleReject}
                                                disabled={isActioning}
                                                className="py-3.5 bg-red-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
                                            >
                                                {isActioning ? <Loader2 size={14} className="animate-spin" /> : <ThumbsDown size={14} />}
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {canSubmit && (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isActioning}
                                        className="w-full py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                                    >
                                        {isActioning ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                        Submit for Approval
                                    </button>
                                )}
                            </div>
                        )}

                        {!canApprove && !canSubmit && pr.status === 'PENDING_APPROVAL' && (
                            <div className="p-6 bg-amber-50 rounded-[32px] border border-amber-100 text-center space-y-3">
                                <Clock size={24} className="text-amber-500 mx-auto" />
                                <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Awaiting Authorization</p>
                                <p className="text-xs font-medium text-amber-600 leading-relaxed">
                                    Your request is currently with the department heads for operational review.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PRDetails;
