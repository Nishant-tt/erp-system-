import React, { useState, useEffect } from 'react';
import {
    Receipt,
    Plus,
    Search,
    TrendingUp,
    CheckCircle2,
    Clock,
    DollarSign,
    Loader2,
    Calendar,
    ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSalesInvoicesAPI } from '../../api/salesInvoice';

const SalesInvoiceManagement = () => {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const data = await getSalesInvoicesAPI();
            setInvoices(data);
        } catch (error) {
            console.error('Error fetching invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PAID': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'PARTIALLY_PAID': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'UNPAID': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    const totalReceivable = invoices.reduce((sum, inv) => sum + inv.balanceAmount, 0);

    return (
        <div className="p-8 pb-24 text-slate-900">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600">
                            <Receipt size={24} />
                        </div>
                        Sales Invoices
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Outbound billing and accounts receivable</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center justify-center gap-2 bg-slate-100 text-slate-900 px-6 py-3 rounded-2xl font-bold hover:bg-slate-200 transition-all">
                        Statement
                    </button>
                    <button
                        onClick={() => navigate('/sales-invoices/create')}
                        className="flex items-center justify-center gap-2 bg-rose-600 text-white px-6 py-3 rounded-2xl font-bold hover:shadow-lg hover:shadow-rose-600/30 transition-all active:scale-95"
                    >
                        <Plus size={20} />
                        Raise Invoice
                    </button>
                </div>
            </div>

            {/* Financial Overview */}
            <div className="bg-slate-900 rounded-[40px] p-8 mb-8 text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Total Accounts Receivable</p>
                    <h2 className="text-4xl font-black">₹{totalReceivable.toLocaleString()}</h2>
                    <div className="flex items-center gap-4 mt-6">
                        <div className="bg-white/10 px-4 py-2 rounded-xl flex items-center gap-2">
                            <TrendingUp size={16} className="text-emerald-400" />
                            <span className="text-xs font-black">₹{invoices.reduce((sum, i) => sum + i.grandTotal, 0).toLocaleString()} <span className="text-white/40 font-bold ml-1">Total Billable</span></span>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full md:w-auto relative z-10">
                    <div className="bg-white/5 border border-white/10 p-5 rounded-3xl">
                        <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Received</p>
                        <p className="text-lg font-black">₹{invoices.reduce((sum, i) => sum + i.amountPaid, 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-5 rounded-3xl">
                        <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-1">Outstanding</p>
                        <p className="text-lg font-black">{invoices.filter(i => i.status !== 'PAID').length} Invoices</p>
                    </div>
                </div>
                {/* Abstract shape */}
                <div className="absolute -right-20 -top-20 w-80 h-80 bg-rose-600/20 blur-[100px] rounded-full"></div>
            </div>

            {/* Invoices List */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="animate-spin text-rose-600" size={40} />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Billing Data...</p>
                        </div>
                    ) : invoices.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <Receipt className="text-slate-100 mb-4" size={60} />
                            <h3 className="text-lg font-black text-slate-900">Zero Invoices Recorded</h3>
                            <p className="text-slate-500 max-w-xs mt-2">Book your first customer invoice by clicking the button above.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr>
                                    <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Invoice Detail</th>
                                    <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Customer</th>
                                    <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Total Amount</th>
                                    <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Balance</th>
                                    <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                    <th className="pb-6 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {invoices.map((inv) => (
                                    <tr key={inv._id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="py-6">
                                            <p className="font-black text-slate-900">{inv.invoiceNumber}</p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <Calendar size={12} className="text-slate-400" />
                                                <p className="text-[10px] font-bold text-slate-500 uppercase">{new Date(inv.invoiceDate).toLocaleDateString()}</p>
                                            </div>
                                        </td>
                                        <td className="py-6">
                                            <p className="font-bold text-slate-900">{inv.customer?.name}</p>
                                            <p className="text-[10px] font-medium text-slate-400 mt-1">Ref: {inv.soReference?.soNumber || inv.dnReference?.dnNumber}</p>
                                        </td>
                                        <td className="py-6 text-right font-black text-slate-900">
                                            ₹{inv.grandTotal.toLocaleString()}
                                        </td>
                                        <td className="py-6 text-right font-black text-rose-500">
                                            ₹{inv.balanceAmount.toLocaleString()}
                                        </td>
                                        <td className="py-6">
                                            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black border uppercase tracking-widest ${getStatusColor(inv.status)}`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="py-6 text-right">
                                            <button
                                                onClick={() => navigate(`/sales-invoices/edit/${inv._id}`)}
                                                className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <ArrowRight size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SalesInvoiceManagement;
