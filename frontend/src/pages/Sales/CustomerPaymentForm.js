import React, { useState, useEffect } from 'react';
import {
    ArrowLeft,
    Info,
    Banknote,
    CheckCircle2,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { createCustomerPaymentAPI, getCustomerPaymentByIdAPI } from '../../api/customerPayment';
import { getSalesInvoicesAPI } from '../../api/salesInvoice';

const CustomerPaymentForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Resources
    const [invoices, setInvoices] = useState([]);

    // Form
    const [formData, setFormData] = useState({
        customer: '',
        invoiceReference: '',
        amount: 0,
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'BANK_TRANSFER',
        transactionId: '',
        notes: ''
    });

    useEffect(() => {
        fetchResources();
        if (id) fetchPayment();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchResources = async () => {
        try {
            const data = await getSalesInvoicesAPI();
            setInvoices(data.filter(i => i.status !== 'PAID'));
        } catch (error) {
            console.error('Error resources:', error);
        }
    };

    const fetchPayment = async () => {
        try {
            const data = await getCustomerPaymentByIdAPI(id);
            setFormData(data);
        } catch (error) {
            console.error('Error fetch payment:', error);
        }
    };

    const handleInvoiceLink = (invId) => {
        const inv = invoices.find(i => i._id === invId);
        if (inv) {
            setFormData({
                ...formData,
                invoiceReference: invId,
                customer: inv.customer?._id || inv.customer,
                amount: inv.balanceAmount
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await createCustomerPaymentAPI(formData);
            navigate('/customer-payments');
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 pb-24 sm:pb-32 max-w-7xl mx-auto min-w-0 text-slate-900">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate('/customer-payments')} className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Record Collection</h1>
                    <p className="text-slate-500 font-medium text-sm">Post customer payments and clear outstanding dues</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Select Invoice */}
                    <div className="bg-violet-50 rounded-[32px] p-8 border border-violet-100 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-sm font-black text-violet-900 mb-6 uppercase tracking-widest">Link Pending Invoice</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <select
                                    className="w-full bg-white border-violet-100 rounded-2xl p-4 font-bold text-slate-900 focus:ring-violet-500"
                                    onChange={(e) => handleInvoiceLink(e.target.value)}
                                    value={formData.invoiceReference}
                                    required
                                >
                                    <option value="">Select Invoice</option>
                                    {invoices.map(i => <option key={i._id} value={i._id}>{i.invoiceNumber} - {i.customer?.name} (₹{i.balanceAmount.toLocaleString()})</option>)}
                                </select>
                                <div className="space-y-2">
                                    <input
                                        type="number"
                                        className="w-full bg-white border-violet-100 rounded-2xl p-4 font-black text-violet-600 focus:ring-violet-500 text-lg"
                                        placeholder="Payment Amount"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                                        required
                                    />
                                    <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest ml-2">Total amount to be credited</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Details */}
                    <div className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Payment Method</label>
                            <select
                                className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-900"
                                value={formData.paymentMethod}
                                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                            >
                                <option value="CASH">CASH</option>
                                <option value="BANK_TRANSFER">BANK TRANSFER</option>
                                <option value="CHEQUE">CHEQUE</option>
                                <option value="CREDIT_CARD">CREDIT CARD</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Transaction ID / Ref</label>
                            <input
                                type="text"
                                className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-900"
                                value={formData.transactionId}
                                onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                                placeholder="UTR / Cheque No / Txn ID"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Collection Date</label>
                            <input
                                type="date"
                                className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-900"
                                value={formData.paymentDate}
                                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl">
                        <div className="flex items-center gap-3 mb-8">
                            <Banknote className="text-violet-400" size={20} />
                            <h3 className="font-black text-xs uppercase tracking-widest text-white/40">Posting Preview</h3>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="text-center py-6 bg-white/5 rounded-3xl border border-white/10">
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Receipt Total</p>
                                <p className="text-4xl font-black text-violet-400">₹{formData.amount.toLocaleString()}</p>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="w-full bg-violet-600 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-violet-500 transition-all shadow-lg shadow-violet-600/20 active:scale-95 flex items-center justify-center gap-3">
                            <CheckCircle2 size={18} />
                            {loading ? 'Posting...' : 'Post Payment'}
                        </button>
                    </div>

                    <div className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm">
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                            <Info size={14} className="inline mr-2 text-violet-500" />
                            Once posted, this payment will be applied to the linked invoice and update its balance automatically.
                        </p>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CustomerPaymentForm;
