import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGRNsAPI } from '../../api/grn';
import { createInvoiceAPI } from '../../api/purchaseInvoice';
import {
    Receipt,
    Truck,
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
    Loader2,
    Package,
    Hash,
    IndianRupee,
    Building,
    Tag,
    Save
} from 'lucide-react';

const CreateInvoice = () => {
    const navigate = useNavigate();
    const userRole = localStorage.getItem('role');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Data states
    const [grns, setGRNs] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    // Form states
    const [selectedGRN, setSelectedGRN] = useState(null);
    const [vendorInvoiceNumber, setVendorInvoiceNumber] = useState('');
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState('');
    const [items, setItems] = useState([]);

    useEffect(() => {
        const allowedRoles = ['Admin', 'Accounts Payable'];
        if (!allowedRoles.includes(userRole)) {
            navigate('/dashboard');
            return;
        }
        const fetchGRNs = async () => {
            try {
                const data = await getGRNsAPI();
                // We only show GRNs that haven't been invoiced (this is simplified logic)
                setGRNs((data || []).filter(g => g.verificationStatus === 'VERIFIED'));
            } catch (err) {
                console.error('Failed to load GRNs:', err);
                setMessage({ type: 'error', text: 'Failed to load receipt data.' });
            } finally {
                setLoadingData(false);
            }
        };
        fetchGRNs();
    }, [navigate, userRole]);

    const handleGRNSelect = (grnId) => {
        const grn = grns.find(g => g._id === grnId);
        if (grn) {
            setSelectedGRN(grn);
            setItems(grn.items.map(item => ({
                item: item.item._id,
                itemName: item.item.itemName,
                itemCode: item.item.itemCode,
                description: item.item.description || item.item.itemName,
                quantity: Math.max(0, item.receivedQuantity - (item.rejectedQuantity || 0)),
                unitCost: item.unitCost,
                taxAmount: (Math.max(0, item.receivedQuantity - (item.rejectedQuantity || 0)) * item.unitCost) * 0.18,
                totalCost: (Math.max(0, item.receivedQuantity - (item.rejectedQuantity || 0)) * item.unitCost) * 1.18
            })));
        } else {
            setSelectedGRN(null);
            setItems([]);
        }
    };

    const calculateSubtotal = () => items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
    const calculateTaxTotal = () => items.reduce((sum, item) => sum + item.taxAmount, 0);
    const calculateGrandTotal = () => calculateSubtotal() + calculateTaxTotal();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedGRN) {
            setMessage({ type: 'error', text: 'Please select a Receipt (GRN) to invoice.' });
            return;
        }
        if (!vendorInvoiceNumber) {
            setMessage({ type: 'error', text: 'Please enter the vendor invoice number.' });
            return;
        }

        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            await createInvoiceAPI({
                vendorInvoiceNumber,
                poReference: selectedGRN.poReference?._id,
                grnReference: selectedGRN._id,
                supplier: selectedGRN.supplier._id,
                items,
                subtotal: calculateSubtotal(),
                taxTotal: calculateTaxTotal(),
                grandTotal: calculateGrandTotal(),
                balanceAmount: calculateGrandTotal(),
                invoiceDate,
                dueDate,
                status: 'UNPAID'
            });
            setMessage({ type: 'success', text: 'Invoice booked successfully!' });
            setTimeout(() => navigate('/invoices'), 1500);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to book invoice.' });
            setIsSubmitting(false);
        }
    };

    if (loadingData) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 className="animate-spin text-amber-500" size={32} />
                <span className="ml-3 text-sm font-bold text-slate-400 uppercase tracking-widest">Reconciling purchase history...</span>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 px-2 sm:px-0 min-w-0 animate-in slide-in-from-bottom-8 duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <button
                        onClick={() => navigate('/invoices')}
                        className="flex items-center gap-2 text-slate-400 hover:text-amber-600 transition-colors font-bold text-xs uppercase tracking-widest mb-2"
                    >
                        <ArrowLeft size={14} />
                        Back to Payables
                    </button>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Receipt className="text-amber-500" size={28} />
                        Book Purchase Invoice
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
                        {/* Source GRN Selection */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Select Received Goods (GRN) to Invoice</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {grns.map(getReceipt => (
                                    <button
                                        key={getReceipt._id}
                                        type="button"
                                        onClick={() => handleGRNSelect(getReceipt._id)}
                                        className={`p-6 rounded-3xl border-2 text-left transition-all relative overflow-hidden group ${selectedGRN?._id === getReceipt._id
                                            ? 'border-amber-500 bg-amber-50/30'
                                            : 'border-slate-100 hover:border-slate-200'}`}
                                    >
                                        <div className="relative z-10">
                                            <p className={`font-black uppercase tracking-tight ${selectedGRN?._id === getReceipt._id ? 'text-amber-700' : 'text-slate-900'}`}>{getReceipt.grnNumber}</p>
                                            <p className="text-xs font-bold text-slate-500 mt-1">{getReceipt.supplier?.name}</p>
                                            <div className="flex gap-2 mt-4 items-center">
                                                <span className="text-[9px] font-black bg-white px-2 py-0.5 rounded-md border border-slate-100 text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                    <Tag size={10} /> PO: {getReceipt.poReference?.poNumber || 'Direct'}
                                                </span>
                                            </div>
                                        </div>
                                        <Truck className={`absolute -right-4 -bottom-4 transition-transform group-hover:scale-110 ${selectedGRN?._id === getReceipt._id ? 'text-amber-100/50' : 'text-slate-50'}`} size={80} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Items Section */}
                        {selectedGRN && (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Line Items from Receipt</h2>
                                <div className="space-y-3">
                                    {items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                            <div className="flex gap-3 items-center">
                                                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-400">
                                                    <Package size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{item.itemName}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.quantity} units @ â‚¹{item.unitCost}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-black text-slate-900">â‚¹{item.totalCost.toLocaleString()}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase">Incl. GST</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Billing Details Panel */}
                <div className="space-y-6">
                    <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-200/60 space-y-6">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-4 flex items-center gap-2">
                            <Building size={16} className="text-amber-500" /> Vendor Billing
                        </h3>

                        <div className="space-y-5 text-left">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Supplier Invoice Number</label>
                                <div className="relative group">
                                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Enter the number on vendor's bill"
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-amber-500/20 font-bold text-sm"
                                        value={vendorInvoiceNumber}
                                        onChange={(e) => setVendorInvoiceNumber(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Invoice Date</label>
                                <input
                                    type="date"
                                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-amber-500/20 font-bold text-sm"
                                    value={invoiceDate}
                                    onChange={(e) => setInvoiceDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Due Date</label>
                                <input
                                    type="date"
                                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-amber-500/20 font-bold text-sm"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-bl-full -mr-10 -mt-10" />

                        <h2 className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Payable Breakdown</h2>

                        <div className="space-y-4 mb-10">
                            <div className="flex justify-between items-center text-slate-400">
                                <span className="text-[10px] font-bold uppercase tracking-widest">Base Amount</span>
                                <span className="text-sm font-black text-white flex items-center gap-1">
                                    <IndianRupee size={12} /> {calculateSubtotal().toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-slate-400">
                                <span className="text-[10px] font-bold uppercase tracking-widest">Calculated TAX</span>
                                <span className="text-sm font-black text-white flex items-center gap-1">
                                    <IndianRupee size={12} /> {calculateTaxTotal().toLocaleString()}
                                </span>
                            </div>
                            <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Final Bill</span>
                                <div className="text-right">
                                    <div className="flex items-center justify-end gap-1 text-4xl font-black tracking-tighter text-white">
                                        <IndianRupee size={24} className="text-amber-500 mb-1" />
                                        {calculateGrandTotal().toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                    </div>
                                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1 italic">Calculated from receipt</p>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || !selectedGRN}
                            className="w-full py-5 bg-amber-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-amber-500 shadow-xl shadow-amber-600/30 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            Record Invoice
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CreateInvoice;

