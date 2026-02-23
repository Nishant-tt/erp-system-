import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPRAPI } from '../../api/pr';
import {
    Plus,
    Trash2,
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
    IndianRupee,
    ShoppingCart,
    Info,
    ChevronDown,
    Save,
    Send,
    Loader2
} from 'lucide-react';

const RaisePR = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [items, setItems] = useState([
        { description: '', quantity: 1, unit: 'pcs', estimatedUnitCost: 0 }
    ]);
    const [itemErrors, setItemErrors] = useState([{}]);

    const addItem = () => {
        setItems([...items, { description: '', quantity: 1, unit: 'pcs', estimatedUnitCost: 0 }]);
        setItemErrors([...itemErrors, {}]);
    };

    const removeItem = (index) => {
        if (items.length === 1) return;
        setItems(items.filter((_, i) => i !== index));
        setItemErrors(itemErrors.filter((_, i) => i !== index));
    };

    const updateItem = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);

        // Clear error when user starts typing again
        if (itemErrors[index][field]) {
            const newErrors = [...itemErrors];
            newErrors[index][field] = '';
            setItemErrors(newErrors);
        }
    };

    const validateField = (index, field, value) => {
        let error = '';
        if (field === 'description' && !value.trim()) error = 'Required';
        if (field === 'quantity' && (isNaN(value) || value <= 0)) error = 'Min 1';
        if (field === 'estimatedUnitCost' && (isNaN(value) || value <= 0)) error = 'Required';

        const newErrors = [...itemErrors];
        newErrors[index][field] = error;
        setItemErrors(newErrors);
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + (item.quantity * item.estimatedUnitCost), 0);
    };

    const handleSubmit = async (status = 'DRAFT') => {
        // Validation
        const validItems = items.filter(item => item.description.trim() !== '' && item.quantity > 0 && item.estimatedUnitCost > 0);
        if (validItems.length === 0) {
            setMessage({ type: 'error', text: 'Please add at least one valid item.' });
            return;
        }

        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            await createPRAPI({
                items: validItems,
                status: status
            });
            setMessage({ type: 'success', text: status === 'DRAFT' ? 'Requisition saved as draft!' : 'Requisition submitted for approval!' });
            setTimeout(() => navigate('/prs'), 1500);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to create requisition.' });
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <button
                        onClick={() => navigate('/prs')}
                        className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors font-bold text-xs uppercase tracking-widest mb-2"
                    >
                        <ArrowLeft size={14} />
                        Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <ShoppingCart className="text-primary" size={28} />
                        Create Purchase Requisition
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Items List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-200/60 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 text-slate-50/50 -mr-4 -mt-4">
                            <ShoppingCart size={120} />
                        </div>

                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                                <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Requisition Items</h2>
                                <button
                                    onClick={addItem}
                                    className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest hover:bg-primary/5 px-4 py-2 rounded-xl transition-all"
                                >
                                    <Plus size={14} />
                                    Add New Row
                                </button>
                            </div>

                            <div className="space-y-4">
                                {items.map((item, idx) => (
                                    <div key={idx} className="grid grid-cols-12 gap-4 items-start bg-slate-50/50 p-6 rounded-[32px] border border-slate-100/50 relative group transition-all hover:bg-white hover:shadow-md">
                                        <div className="col-span-12 md:col-span-6 space-y-1.5">
                                            <div className="flex justify-between items-center ml-1">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Item Description</label>
                                                {itemErrors[idx]?.description && <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest animate-pulse">{itemErrors[idx].description}</span>}
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="What are you requesting?"
                                                className={`w-full px-5 py-3.5 bg-white border-2 rounded-2xl outline-none focus:border-primary/20 font-bold text-sm transition-all ${itemErrors[idx]?.description ? 'border-red-200' : 'border-slate-100'}`}
                                                value={item.description}
                                                onChange={(e) => updateItem(idx, 'description', e.target.value)}
                                                onBlur={(e) => validateField(idx, 'description', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-4 md:col-span-2 space-y-1.5">
                                            <div className="flex justify-between items-center ml-1">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Quantity</label>
                                                {itemErrors[idx]?.quantity && <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest animate-pulse">{itemErrors[idx].quantity}</span>}
                                            </div>
                                            <input
                                                type="number"
                                                className={`w-full px-5 py-3.5 bg-white border-2 rounded-2xl outline-none focus:border-primary/20 font-black text-sm text-center transition-all ${itemErrors[idx]?.quantity ? 'border-red-200' : 'border-slate-100'}`}
                                                value={item.quantity}
                                                onChange={(e) => updateItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                                                onBlur={(e) => validateField(idx, 'quantity', parseFloat(e.target.value) || 0)}
                                            />
                                        </div>
                                        <div className="col-span-6 md:col-span-3 space-y-1.5">
                                            <div className="flex justify-between items-center ml-1">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Est. Unit Cost</label>
                                                {itemErrors[idx]?.estimatedUnitCost && <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest animate-pulse">{itemErrors[idx].estimatedUnitCost}</span>}
                                            </div>
                                            <div className="relative">
                                                <IndianRupee size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="number"
                                                    className={`w-full pl-10 pr-5 py-3.5 bg-white border-2 rounded-2xl outline-none focus:border-primary/20 font-black text-sm transition-all ${itemErrors[idx]?.estimatedUnitCost ? 'border-red-200' : 'border-slate-100'}`}
                                                    value={item.estimatedUnitCost}
                                                    onChange={(e) => updateItem(idx, 'estimatedUnitCost', parseFloat(e.target.value) || 0)}
                                                    onBlur={(e) => validateField(idx, 'estimatedUnitCost', parseFloat(e.target.value) || 0)}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-span-2 md:col-span-1 pt-8 flex justify-center">
                                            <button
                                                onClick={() => removeItem(idx)}
                                                className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                                title="Remove Item"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary & Actions */}
                <div className="space-y-6">
                    <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden sticky top-8">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full -mr-10 -mt-10" />

                        <h2 className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Order Summary</h2>

                        <div className="space-y-4 mb-10">
                            <div className="flex justify-between items-center text-slate-400">
                                <span className="text-xs font-bold uppercase tracking-widest">Subtotal</span>
                                <span className="text-sm font-black text-white flex items-center gap-1">
                                    <IndianRupee size={14} />
                                    {calculateTotal().toLocaleString('en-IN')}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-slate-400">
                                <span className="text-xs font-bold uppercase tracking-widest">GST (Estimated)</span>
                                <span className="text-sm font-black text-white flex items-center gap-1">
                                    <IndianRupee size={14} />
                                    {(calculateTotal() * 0.18).toLocaleString('en-IN')}
                                </span>
                            </div>
                            <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Grand Total</span>
                                <div className="text-right">
                                    <div className="flex items-center justify-end gap-1 text-4xl font-black tracking-tighter text-white">
                                        <IndianRupee size={24} className="text-primary mb-1" />
                                        {(calculateTotal() * 1.18).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                    </div>
                                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1 italic">*Final cost subject to vendor quote</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => handleSubmit('PENDING_APPROVAL')}
                                disabled={isSubmitting}
                                className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 active:translate-y-1 disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                                Send for Approval
                            </button>
                            <button
                                onClick={() => handleSubmit('DRAFT')}
                                disabled={isSubmitting}
                                className="w-full py-4 bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/20 transition-all border border-white/10 disabled:opacity-50"
                            >
                                <Save size={16} />
                                Save as Draft
                            </button>
                        </div>

                        <div className="mt-8 flex items-start gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                            <Info className="text-primary shrink-0" size={16} />
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed uppercase tracking-wider">
                                Once submitted, PR cannot be edited until rejected or authorized by your manager.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RaisePR;
