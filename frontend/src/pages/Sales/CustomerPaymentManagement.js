import React, { useState, useEffect } from 'react';
import {
    IndianRupee,
    Plus,
    Search,
    CreditCard,
    CheckCircle2,
    Clock,
    User,
    ArrowRight,
    Loader2,
    Calendar,
    Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCustomerPaymentsAPI } from '../../api/customerPayment';

const CustomerPaymentManagement = () => {
    const navigate = useNavigate();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const data = await getCustomerPaymentsAPI();
            setPayments(data);
        } catch (error) {
            console.error('Error fetching payments:', error);
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
                            <CreditCard size={24} />
                        </div>
                        Collections
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Recorded payments and customer receipts</p>
                </div>
                <button
                    onClick={() => navigate('/customer-payments/create')}
                    className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:shadow-lg hover:shadow-indigo-600/30 transition-all active:scale-95"
                >
                    <Plus size={20} />
                    Collect Payment
                </button>
            </div>

            {/* List */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Find collections by ID or invoice..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-slate-900"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="animate-spin text-indigo-600" size={40} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Collections...</p>
                    </div>
                ) : payments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-200 mb-4">
                            <IndianRupee size={40} />
                        </div>
                        <h3 className="text-lg font-black text-slate-900">No Payments Recorded</h3>
                        <p className="text-slate-500 max-w-xs mt-2">All incoming customer payments will be listed here for reconciliation.</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Ref & Date</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Customer</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Invoice Ref</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Method</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Amount</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                <th className="px-8 py-6 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {payments.map((pay) => (
                                <tr key={pay._id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <p className="font-black text-slate-900">{pay.paymentNumber}</p>
                                        <p className="text-[11px] font-medium text-slate-400 mt-0.5">{new Date(pay.paymentDate).toLocaleDateString()}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="font-bold text-slate-900">{pay.customer?.name}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-xs font-black text-slate-600 bg-slate-100 px-3 py-1 rounded-lg inline-block">{pay.invoiceReference?.invoiceNumber}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                                                <CreditCard size={12} />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{pay.paymentMethod}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right font-black text-emerald-600 text-lg">
                                        ₹{pay.amount.toLocaleString()}
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="px-4 py-1.5 rounded-xl text-[10px] font-black border uppercase tracking-widest bg-emerald-50 text-emerald-600 border-emerald-100">
                                            {pay.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button
                                            onClick={() => navigate(`/customer-payments/edit/${pay._id}`)}
                                            className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all opacity-0 group-hover:opacity-100"
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
    );
};

export default CustomerPaymentManagement;
