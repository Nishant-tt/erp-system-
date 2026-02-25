import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInvoicesAPI } from '../../api/purchaseInvoice';
import {
    Receipt,
    Plus,
    Search,
    ChevronRight,
    Clock,
    CheckCircle2,
    Loader2,
    Calendar,
    Hash,
    AlertCircle,
    ArrowRight
} from 'lucide-react';

const InvoiceManagement = () => {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const data = await getInvoicesAPI();
            setInvoices(data);
        } catch (error) {
            console.error('Error fetching invoices:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'PAID': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'PARTIALLY_PAID': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'UNPAID': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-slate-50 text-slate-500 border-slate-100';
        }
    };

    const filteredInvoices = invoices.filter(inv =>
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.vendorInvoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.supplier?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-amber-600" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Purchase Invoices</h1>
                    <p className="text-slate-500 text-sm font-medium">Review vendor bills and track accounts payable.</p>
                </div>
                <button
                    onClick={() => navigate('/invoices/create')}
                    className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-2xl font-bold hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 active:scale-95"
                >
                    <Plus size={18} />
                    Book New Invoice
                </button>
            </div>

            <div className="relative group max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={18} />
                <input
                    type="text"
                    placeholder="Search invoice #, vendor bill #, or supplier..."
                    className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-amber-500/20 transition-all font-bold text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-[32px] shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice Details</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Supplier</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount & Balance</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredInvoices.map((inv) => (
                                <tr key={inv._id} className="group hover:bg-slate-50/50 transition-all">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                                                <Receipt size={20} />
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 group-hover:text-amber-600 transition-colors uppercase tracking-tight">{inv.invoiceNumber}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <Hash size={10} className="text-slate-400" />
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vendor #: {inv.vendorInvoiceNumber}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-700 text-sm">{inv.supplier?.name}</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase">{new Date(inv.invoiceDate).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="font-black text-slate-900">₹{inv.grandTotal.toLocaleString()}</span>
                                            {inv.balanceAmount > 0 && (
                                                <span className="text-[10px] font-black text-red-500 uppercase">Due: ₹{inv.balanceAmount.toLocaleString()}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(inv.status)}`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        {inv.status !== 'PAID' ? (
                                            <button
                                                onClick={() => navigate('/payments/process', { state: { invoice: inv } })}
                                                className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all flex items-center gap-2 ml-auto"
                                            >
                                                Pay Now
                                                <ArrowRight size={12} />
                                            </button>
                                        ) : (
                                            <CheckCircle2 size={20} className="text-emerald-500 ml-auto" />
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredInvoices.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-200">
                                                <Receipt size={40} />
                                            </div>
                                            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No invoices recorded</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InvoiceManagement;
