import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPRsAPI } from '../../api/pr';
import { getSuppliersAPI } from '../../api/supplier';
import { createPOAPI } from '../../api/po';
import {
    FileText,
    Trash2,
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
    IndianRupee,
    Loader2,
    Package,
    Calendar,
    FileSpreadsheet
} from 'lucide-react';

const CreatePurchaseOrder = () => {
    const navigate = useNavigate();
    const userRole = localStorage.getItem('role');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Data states
    const [approvedPRs, setApprovedPRs] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    // Form states
    const [selectedPR, setSelectedPR] = useState(null);
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [items, setItems] = useState([]);
    const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
    const [terms, setTerms] = useState('');
    const [deliveryLocation, setDeliveryLocation] = useState('');
    const [shippingMethod, setShippingMethod] = useState('ROAD');
    const [costCenter, setCostCenter] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        const allowedRoles = ['Admin', 'Manager', 'Purchase Manager'];
        if (!allowedRoles.includes(userRole)) {
            navigate('/dashboard');
            return;
        }
        const fetchData = async () => {
            try {
                const [prsData, suppliersData] = await Promise.all([
                    getPRsAPI(),
                    getSuppliersAPI()
                ]);
                setApprovedPRs(prsData.filter(pr => pr.status === 'APPROVED'));
                setSuppliers(suppliersData);
            } catch (err) {
                console.error('Failed to load data:', err);
                setMessage({ type: 'error', text: 'Failed to load master data.' });
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, [navigate, userRole]);

    const handlePRSelect = (prId) => {
        const pr = approvedPRs.find(p => p._id === prId);
        if (pr) {
            setSelectedPR(pr);
            setCostCenter(pr.costCenter || '');
            setItems(pr.items.map(item => ({
                item: item.item._id,
                itemName: item.item.itemName,
                itemCode: item.item.itemCode,
                description: item.description || '',
                quantity: item.quantity,
                receivedQuantity: 0,
                unit: item.unit || 'pcs',
                unitCost: item.estimatedUnitCost,
                discount: 0,
                gstRate: Number(item.item.gstRate || 0),
                taxableValue: item.quantity * item.estimatedUnitCost,
                gstAmount: (item.quantity * item.estimatedUnitCost) * (Number(item.item.gstRate || 0) / 100),
                lineTotal: (item.quantity * item.estimatedUnitCost) * (1 + (Number(item.item.gstRate || 0) / 100)),
                totalCost: item.quantity * item.estimatedUnitCost
            })));
        } else {
            setSelectedPR(null);
            setItems([]);
        }
    };

    const updateItem = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;

        if (['quantity', 'unitCost', 'discount', 'gstRate'].includes(field)) {
            const qty = Number(newItems[index].quantity) || 0;
            const unitCost = Number(newItems[index].unitCost) || 0;
            const discount = Math.max(0, Number(newItems[index].discount) || 0);
            const gstRate = Math.max(0, Number(newItems[index].gstRate) || 0);

            const taxableValue = Math.max(0, (qty * unitCost) - discount);
            const gstAmount = taxableValue * (gstRate / 100);
            const lineTotal = taxableValue + gstAmount;

            newItems[index].taxableValue = taxableValue;
            newItems[index].gstAmount = gstAmount;
            newItems[index].lineTotal = lineTotal;
            newItems[index].totalCost = taxableValue; // legacy pre-GST
        }
        setItems(newItems);
    };

    const removeItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const calculateSubtotal = () => items.reduce((sum, item) => sum + (Number(item.taxableValue || item.totalCost || 0)), 0);
    // const calculateGstTotal = () => items.reduce((sum, item) => sum + (Number(item.gstAmount || 0)), 0);
    // const calculateGrandTotal = () => calculateSubtotal() + calculateGstTotal();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedSupplier) {
            setMessage({ type: 'error', text: 'Please select a supplier.' });
            return;
        }
        if (items.length === 0) {
            setMessage({ type: 'error', text: 'Please add at least one item.' });
            return;
        }

        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            await createPOAPI({
                prReference: selectedPR?._id,
                supplier: selectedSupplier,
                items: items,
                totalAmount: 0, // backend will compute and sync to grandTotal
                expectedDeliveryDate,
                deliveryLocation,
                shippingMethod,
                costCenter: costCenter || selectedPR?.costCenter || '',
                paymentTerms: terms,
                terms,
                notes,
                status: 'DRAFT'
            });
            setMessage({ type: 'success', text: 'Purchase Order created and submitted for approval!' });
            setTimeout(() => navigate('/purchase-orders'), 1500);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to create PO.' });
            setIsSubmitting(false);
        }
    };

    if (loadingData) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 className="animate-spin text-primary" size={32} />
                <span className="ml-3 text-sm font-bold text-slate-400 uppercase tracking-widest">Warming up engines...</span>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 px-2 sm:px-0 min-w-0 animate-in slide-in-from-bottom-8 duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <button
                        onClick={() => navigate('/purchase-orders')}
                        className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors font-bold text-xs uppercase tracking-widest mb-2"
                    >
                        <ArrowLeft size={14} />
                        Back to Orders
                    </button>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <FileText className="text-indigo-600" size={28} />
                        Issue Purchase Order
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
                {/* Main Config */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-200/60 space-y-8">
                        {/* Reference & Supplier */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">PR Reference (Optional)</label>
                                <select
                                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 transition-all font-bold text-sm appearance-none"
                                    onChange={(e) => handlePRSelect(e.target.value)}
                                    value={selectedPR?._id || ''}
                                >
                                    <option value="">Manual Order (No PR)</option>
                                    {approvedPRs.map(pr => (
                                        <option key={pr._id} value={pr._id}>{pr.prNumber} - {pr.department?.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Select Supplier</label>
                                <select
                                    required
                                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 transition-all font-bold text-sm appearance-none"
                                    value={selectedSupplier}
                                    onChange={(e) => setSelectedSupplier(e.target.value)}
                                >
                                    <option value="">Choose a Vendor...</option>
                                    {suppliers.map(s => (
                                        <option key={s._id} value={s._id}>{s.name} ({s.taxInfo?.gstin || 'No GST'})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Order Items</h2>
                                {items.length > 0 && (
                                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                        {items.length} Line Items
                                    </span>
                                )}
                            </div>

                            <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                                {items.map((item, idx) => (
                                    <div key={idx} className="bg-slate-50/50 p-6 rounded-[32px] border border-slate-100/50 group hover:bg-white hover:shadow-lg transition-all relative">
                                        <div className="grid grid-cols-12 gap-6 items-end">
                                            <div className="col-span-12 md:col-span-1 border-r border-slate-100">
                                                <p className="text-[10px] font-black text-slate-300">#{(idx + 1).toString().padStart(2, '0')}</p>
                                            </div>
                                            <div className="col-span-12 md:col-span-5 space-y-1.5">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Item Details</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-black text-indigo-500 font-mono">{item.itemCode}</span>
                                                    <span className="text-slate-300">|</span>
                                                    <span className="font-bold text-sm text-slate-900 truncate">{item.itemName}</span>
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-medium italic">{item.description}</p>
                                            </div>
                                            <div className="col-span-4 md:col-span-2 space-y-1.5">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Qty</p>
                                                <input
                                                    type="number"
                                                    className="w-full px-4 py-2.5 bg-white border-2 border-slate-100 rounded-xl outline-none focus:border-primary/20 text-center font-black text-sm"
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                                                />
                                            </div>
                                            <div className="col-span-4 md:col-span-2 space-y-1.5">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Rate</p>
                                                <div className="relative">
                                                    <IndianRupee size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type="number"
                                                        className="w-full pl-8 pr-3 py-2.5 bg-white border-2 border-slate-100 rounded-xl outline-none focus:border-primary/20 font-black text-sm"
                                                        value={item.unitCost}
                                                        onChange={(e) => updateItem(idx, 'unitCost', parseFloat(e.target.value) || 0)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-span-4 md:col-span-2 text-right">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Amount</p>
                                                <p className="font-black text-slate-900 text-sm">â‚¹{item.totalCost.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(idx)}
                                            className="absolute -top-2 -right-2 p-2 bg-white text-slate-300 hover:text-red-500 rounded-full shadow-sm border border-slate-100 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                                {items.length === 0 && (
                                    <div className="py-20 text-center bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-200">
                                        <Package size={40} className="text-slate-200 mx-auto mb-4" />
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Select a PR to load items</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Logistics & Summary */}
                <div className="space-y-6">
                    <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-200/60 space-y-6">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-4">Logistics & Terms</h3>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Calendar size={12} /> Expected Delivery
                                </label>
                                <input
                                    type="date"
                                    className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 font-bold text-sm"
                                    value={expectedDeliveryDate}
                                    onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Terms</label>
                                <textarea
                                    rows="2"
                                    placeholder="e.g. Net 30 days"
                                    className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 font-bold text-sm resize-none"
                                    value={terms}
                                    onChange={(e) => setTerms(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Delivery Location</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Main Warehouse"
                                    className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 font-bold text-sm"
                                    value={deliveryLocation}
                                    onChange={(e) => setDeliveryLocation(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shipping Method</label>
                                    <select
                                        className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 font-bold text-sm"
                                        value={shippingMethod}
                                        onChange={(e) => setShippingMethod(e.target.value)}
                                    >
                                        <option value="ROAD">ROAD</option>
                                        <option value="AIR">AIR</option>
                                        <option value="SEA">SEA</option>
                                        <option value="COURIER">COURIER</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cost Center</label>
                                    <input
                                        type="text"
                                        placeholder="Cost Center"
                                        className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 font-bold text-sm"
                                        value={costCenter}
                                        onChange={(e) => setCostCenter(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">External Notes</label>
                                <textarea
                                    rows="2"
                                    placeholder="Instructions for vendor..."
                                    className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 font-bold text-sm resize-none"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl shadow-indigo-900/40 relative overflow-hidden">
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-tl-full -mb-10 -mr-10" />

                        <h2 className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Order Value</h2>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center text-slate-400">
                                <span className="text-[10px] font-bold uppercase tracking-widest">Basic Value</span>
                                <span className="text-sm font-black text-white">â‚¹{calculateSubtotal().toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-400">
                                <span className="text-[10px] font-bold uppercase tracking-widest">GST (18%)</span>
                                <span className="text-sm font-black text-white">â‚¹{(calculateSubtotal() * 0.18).toLocaleString()}</span>
                            </div>
                            <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Grand Total</span>
                                <div className="text-right">
                                    <div className="text-4xl font-black tracking-tighter text-white">
                                        {(calculateSubtotal() * 1.18).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                    </div>
                                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">Rounded Estimate</p>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || items.length === 0}
                            className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-500 shadow-xl shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <FileSpreadsheet size={18} />}
                            Generate Purchase Order
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CreatePurchaseOrder;

