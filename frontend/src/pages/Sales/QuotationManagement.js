import React, { useState, useEffect } from 'react';
import {
    FileText,
    Plus,
    Search,
    Eye,
    CheckCircle2,
    Clock,
    XCircle,
    Copy,
    Send,
    Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getQuotationsAPI } from '../../api/quotation';

const QuotationManagement = () => {
    const navigate = useNavigate();
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchQuotations();
    }, []);

    const fetchQuotations = async () => {
        try {
            setLoading(true);
            const data = await getQuotationsAPI();
            setQuotations(data);
        } catch (error) {
            console.error('Error fetching quotations:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'ACCEPTED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'REJECTED': return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'SENT': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'DRAFT': return 'bg-slate-50 text-slate-600 border-slate-100';
            case 'EXPIRED': return 'bg-amber-50 text-amber-600 border-amber-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    return (
        <div className="p-8 pb-24 text-slate-900">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                            <FileText size={24} />
                        </div>
                        Quotations
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Manage and track your proposals</p>
                </div>
                <button
                    onClick={() => navigate('/quotations/create')}
                    className="flex items-center gap-2 bg-amber-500 text-white px-6 py-3 rounded-2xl font-bold hover:shadow-lg hover:shadow-amber-500/30 transition-all active:scale-95"
                >
                    <Plus size={20} />
                    New Quotation
                </button>
            </div>

            {/* Quick Filters */}
            <div className="flex overflow-x-auto gap-4 mb-8 pb-2">
                {['ALL', 'DRAFT', 'SENT', 'ACCEPTED', 'REJECTED'].map((filter) => (
                    <button key={filter} className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${filter === 'ALL' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'bg-white text-slate-500 border border-slate-100 hover:border-slate-200'}`}>
                        {filter}
                    </button>
                ))}
            </div>

            {/* Main Table */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by quote # or customer..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-amber-500/20 transition-all font-medium text-slate-900"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <Loader2 className="animate-spin text-amber-500" size={40} />
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Fetching Proposals...</p>
                    </div>
                ) : quotations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4">
                            <FileText size={40} />
                        </div>
                        <h3 className="text-lg font-black text-slate-900">No Quotations Found</h3>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Quotation Detail</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Customer</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Total Amount</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Expiry</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {quotations.map((quote) => (
                                    <tr key={quote._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-5">
                                            <p className="font-black text-slate-900">{quote.quotationNumber}</p>
                                            <p className="text-[10px] font-medium text-slate-400">Created: {new Date(quote.createdAt).toLocaleDateString()}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="font-bold text-slate-900">{quote.customer?.name}</p>
                                        </td>
                                        <td className="px-6 py-5 text-right font-black text-slate-900">
                                            ₹{quote.grandTotal.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-xs font-bold text-slate-600">
                                                {quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : 'No Limit'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black border uppercase tracking-widest ${getStatusColor(quote.status)}`}>
                                                {quote.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2 text-slate-400">
                                                <button
                                                    onClick={() => navigate(`/quotations/edit/${quote._id}`)}
                                                    title="View/Edit"
                                                    className="p-2 hover:bg-white rounded-xl transition-all hover:text-primary border border-transparent hover:border-slate-100 shadow-sm"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button title="Copy" className="p-2 hover:bg-white rounded-xl transition-all hover:text-slate-900 border border-transparent hover:border-slate-100 shadow-sm"><Copy size={16} /></button>
                                                <button title="Send" className="p-2 hover:bg-white rounded-xl transition-all hover:text-blue-500 border border-transparent hover:border-slate-100 shadow-sm"><Send size={16} /></button>
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

export default QuotationManagement;
