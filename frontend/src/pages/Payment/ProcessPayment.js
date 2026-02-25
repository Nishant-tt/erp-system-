import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getInvoicesAPI } from '../../api/purchaseInvoice';
import { createPaymentAPI } from '../../api/vendorPayment';
import {
    CreditCard,
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
    Loader2,
    IndianRupee,
    Building,
    Hash,
    Receipt,
    Wallet,
    Calendar,
    Stamp,
    Banknote,
    ArrowUpRight
} from 'lucide-react';

const ProcessPayment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Data states
    const [unpaidInvoices, setUnpaidInvoices] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    // Form states
    const [selectedInvoice, setSelectedInvoice] = useState(location.state?.invoice || null);
    const [amount, setAmount] = useState(location.state?.invoice?.balanceAmount || 0);
    const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
    const [transactionId, setTransactionId] = useState('');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [remarks, setRemarks] = useState('');

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const data = await getInvoicesAPI();
                setUnpaidInvoices(data.filter(inv => ['UNPAID', 'PARTIALLY_PAID'].includes(inv.status)));
            } catch (err) {
                console.error('Failed to load invoices:', err);
                setMessage({ type: 'error', text: 'Failed to load pending bills.' });
            } finally {
                setLoadingData(false);
            }
        };
        fetchInvoices();
    }, []);

    const handleInvoiceSelect = (invId) => {
        const inv = unpaidInvoices.find(i => i._id === invId);
        if (inv) {
            setSelectedInvoice(inv);
            setAmount(inv.balanceAmount);
        } else {
            setSelectedInvoice(null);
            setAmount(0);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedInvoice) {
            setMessage({ type: 'error', text: 'Please select an invoice to pay.' });
            return;
        }
        if (amount <= 0 || amount > selectedInvoice.balanceAmount) {
            setMessage({ type: 'error', text: `Invalid amount. Max allowed: ₹${selectedInvoice.balanceAmount}` });
            return;
        }

        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            await createPaymentAPI({
                supplier: selectedInvoice.supplier._id,
                invoiceReference: selectedInvoice._id,
                amount,
                paymentDate,
                paymentMethod,
                transactionId,
                remarks,
                status: 'COMPLETED'
            });
            setMessage({ type: 'success', text: 'Payment processed and invoice updated!' });
            setTimeout(() => navigate('/payments'), 1500);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to process payment.' });
            setIsSubmitting(false);
        }
    };

    if (loadingData) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 className="animate-spin text-purple-600" size={32} />
                <span className="ml-3 text-sm font-bold text-slate-400 uppercase tracking-widest">Opening Treasury...</span>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-500 pb-20 text-left">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <button
                        onClick={() => navigate('/payments')}
                        className="flex items-center gap-2 text-slate-400 hover:text-purple-600 transition-colors font-bold text-xs uppercase tracking-widest mb-2"
                    >
                        <ArrowLeft size={14} />
                        Back to Payments
                    </button>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Wallet className="text-purple-600" size={28} />
                        Process Vendor Payment
                    </h1>
                </div>
            </div>

            {message.text && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <p className="text-sm font-bold">{message.text}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-200/60 space-y-8">
                        {/* Invoice Selection */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Select Outstanding Invoice</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {unpaidInvoices.map(inv => (
                                    <button
                                        key={inv._id}
                                        type="button"
                                        onClick={() => handleInvoiceSelect(inv._id)}
                                        className={`p-6 rounded-3xl border-2 text-left transition-all relative overflow-hidden group ${selectedInvoice?._id === inv._id
                                            ? 'border-purple-500 bg-purple-50/30'
                                            : 'border-slate-100 hover:border-slate-200'}`}
                                    >
                                        <div className="relative z-10">
                                            <p className={`font-black uppercase tracking-tight ${selectedInvoice?._id === inv._id ? 'text-purple-700' : 'text-slate-900'}`}>{inv.invoiceNumber}</p>
                                            <p className="text-xs font-bold text-slate-500 mt-1">{inv.supplier?.name}</p>
                                            <div className="flex gap-2 mt-4 items-center">
                                                <span className="text-[9px] font-black bg-white px-2 py-0.5 rounded-md border border-slate-100 text-red-500 uppercase tracking-widest">
                                                    DUE: ₹{inv.balanceAmount.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                        <Receipt className={`absolute -right-4 -bottom-4 transition-transform group-hover:scale-110 ${selectedInvoice?._id === inv._id ? 'text-purple-100/50' : 'text-slate-50'}`} size={80} />
                                    </button>
                                ))}
                                {unpaidInvoices.length === 0 && (
                                    <div className="col-span-2 py-10 px-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No outstanding bills to pay</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Payment Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Payment Method</label>
                                <select
                                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-purple-500/20 font-bold text-sm appearance-none"
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                >
                                    <option value="BANK_TRANSFER">NEFT / RTGS / IMPS</option>
                                    <option value="CASH">Cash Payment</option>
                                    <option value="CHEQUE">Cheque</option>
                                    <option value="UPI">UPI / Digital Wallet</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Payment Date</label>
                                <input
                                    type="date"
                                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-purple-500/20 font-bold text-sm"
                                    value={paymentDate}
                                    onChange={(e) => setPaymentDate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Transaction ID / Reference</label>
                                <div className="relative group">
                                    <Stamp className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" size={16} />
                                    <input
                                        type="text"
                                        placeholder="UTR, Chq#, or Txn ID"
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-purple-500/20 font-bold text-sm"
                                        value={transactionId}
                                        onChange={(e) => setTransactionId(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Amount to Pay (INR)</label>
                                <div className="relative group">
                                    <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" size={16} />
                                    <input
                                        type="number"
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-purple-500/20 font-black text-lg text-purple-600"
                                        value={amount}
                                        onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Confirm Panel */}
                <div className="space-y-6">
                    <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/10 rounded-br-full -ml-10 -mt-10" />

                        <h2 className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Disbursement Summary</h2>

                        <div className="space-y-6 mb-10">
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Payable To</p>
                                <div className="flex items-center gap-2">
                                    <Building size={14} className="text-purple-400" />
                                    <p className="font-black text-slate-200">{selectedInvoice?.supplier?.name || '---'}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Payment Method</p>
                                <p className="font-black text-slate-200">{paymentMethod.replace('_', ' ')}</p>
                            </div>
                            <div className="pt-6 border-t border-white/10">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Total Payout</span>
                                    <div className="text-right">
                                        <div className="flex items-center justify-end gap-1 text-4xl font-black tracking-tighter text-white">
                                            <IndianRupee size={24} className="text-purple-500 mb-1" />
                                            {amount.toLocaleString('en-IN')}
                                        </div>
                                    </div>
                                </div>
                                {selectedInvoice && (
                                    <p className="text-[9px] font-bold text-slate-500 text-right mt-2 uppercase">Remaining Balance: ₹{(selectedInvoice.balanceAmount - amount).toLocaleString()}</p>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || !selectedInvoice || amount <= 0}
                            className="w-full py-5 bg-purple-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-purple-500 shadow-xl shadow-purple-600/30 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <ArrowUpRight size={18} />}
                            Confirm & Transact
                        </button>
                    </div>

                    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 shrink-0">
                                <AlertCircle size={20} />
                            </div>
                            <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-widest">
                                Processing this payment will record a debit entry against the vendor account and mark the invoice as {amount === selectedInvoice?.balanceAmount ? 'PAID' : 'PARTIALLY PAID'}.
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ProcessPayment;
