import React, { useState, useEffect } from 'react';
import {
    Plus,
    Trash2,
    Save,
    ArrowLeft,
    Info
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { createQuotationAPI, getQuotationByIdAPI } from '../../api/quotation';
import { getCustomersAPI } from '../../api/customer';
import { getItemsAPI } from '../../api/itemMaster';

const QuotationForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Dropdown Data
    const [customers, setCustomers] = useState([]);
    const [itemMaster, setItemMaster] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        customer: '',
        opportunityReference: '',
        validUntil: '',
        items: [{ item: '', quantity: 1, unitPrice: 0, taxRate: 18, total: 0 }],
        subtotal: 0,
        taxTotal: 0,
        grandTotal: 0,
        terms: 'Standard terms of sale apply.'
    });

    useEffect(() => {
        fetchResources();
        if (id) fetchQuotation();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchResources = async () => {
        try {
            const [custData, itemData] = await Promise.all([
                getCustomersAPI(),
                getItemsAPI()
            ]);
            setCustomers(custData);
            setItemMaster(itemData);
        } catch (error) {
            console.error('Error fetching resources:', error);
        }
    };

    const fetchQuotation = async () => {
        try {
            const data = await getQuotationByIdAPI(id);
            setFormData(data);
        } catch (error) {
            console.error('Error fetching quotation:', error);
        }
    };

    const calculateTotals = (items) => {
        let subtotal = 0;
        let taxTotal = 0;

        const updatedItems = items.map(item => {
            const lineTotal = item.quantity * item.unitPrice;
            const lineTax = lineTotal * (item.taxRate / 100);
            subtotal += lineTotal;
            taxTotal += lineTax;
            return { ...item, total: lineTotal + lineTax };
        });

        setFormData(prev => ({
            ...prev,
            items: updatedItems,
            subtotal,
            taxTotal,
            grandTotal: subtotal + taxTotal
        }));
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];

        if (field === 'item') {
            const selectedItem = itemMaster.find(i => i._id === value);
            newItems[index] = {
                ...newItems[index],
                item: value,
                unitPrice: selectedItem?.standardRate || 0
            };
        } else {
            newItems[index][field] = value;
        }

        calculateTotals(newItems);
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { item: '', quantity: 1, unitPrice: 0, taxRate: 18, total: 0 }]
        }));
    };

    const removeItem = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        calculateTotals(newItems);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await createQuotationAPI(formData);
            navigate('/quotations');
        } catch (error) {
            console.error('Error saving quotation:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 pb-24 sm:pb-32 max-w-7xl mx-auto min-w-0">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/quotations')}
                    className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-all"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                        {id ? 'Edit Quotation' : 'New Quotation'}
                    </h1>
                    <p className="text-slate-500 font-medium">Create a professional proposal for your customer</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Primary Info */}
                    <div className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                <Info size={18} />
                            </div>
                            <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Quotation Details</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Customer</label>
                                <select
                                    className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20"
                                    value={formData.customer}
                                    onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                                    required
                                >
                                    <option value="">Select Customer</option>
                                    {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Valid Until</label>
                                <input
                                    type="date"
                                    className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20"
                                    value={formData.validUntil}
                                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Line Items</h2>
                            <button
                                type="button"
                                onClick={addItem}
                                className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-all"
                            >
                                <Plus size={14} />
                                Add Row
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Item Name</th>
                                        <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 w-24">Qty</th>
                                        <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 w-32">Unit Price</th>
                                        <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 w-32 text-right">Total</th>
                                        <th className="px-8 py-4 w-16"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {formData.items.map((row, idx) => (
                                        <tr key={idx}>
                                            <td className="px-8 py-4">
                                                <select
                                                    className="w-full bg-transparent border-none p-0 font-bold text-sm focus:ring-0"
                                                    value={row.item}
                                                    onChange={(e) => handleItemChange(idx, 'item', e.target.value)}
                                                    required
                                                >
                                                    <option value="">Select Item</option>
                                                    {itemMaster.map(i => <option key={i._id} value={i._id}>{i.itemName}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-8 py-4">
                                                <input
                                                    type="number"
                                                    className="w-full bg-transparent border-none p-0 font-bold text-sm focus:ring-0"
                                                    value={row.quantity}
                                                    onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                                                    min="1"
                                                />
                                            </td>
                                            <td className="px-8 py-4">
                                                <input
                                                    type="number"
                                                    className="w-full bg-transparent border-none p-0 font-bold text-sm focus:ring-0"
                                                    value={row.unitPrice}
                                                    onChange={(e) => handleItemChange(idx, 'unitPrice', Number(e.target.value))}
                                                />
                                            </td>
                                            <td className="px-8 py-4 text-right font-black text-slate-900 text-sm">
                                                ₹{row.total.toLocaleString()}
                                            </td>
                                            <td className="px-8 py-4">
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(idx)}
                                                    className="text-slate-300 hover:text-rose-500 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: Summary */}
                <div className="space-y-6">
                    <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-xl shadow-slate-200">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-8 text-center">Summary</h2>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Subtotal</span>
                                <span className="font-black">₹{formData.subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Taxes (18%)</span>
                                <span className="font-black text-rose-400">₹{formData.taxTotal.toLocaleString()}</span>
                            </div>
                            <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                                <span className="text-white font-black uppercase tracking-[0.2em] text-xs">Grand Total</span>
                                <span className="text-2xl font-black text-blue-400">₹{formData.grandTotal.toLocaleString()}</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : (
                                <>
                                    <Save size={18} />
                                    Generate Quotation
                                </>
                            )}
                        </button>
                    </div>

                    <div className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block">Notes & Terms</label>
                        <textarea
                            className="w-full bg-slate-50 border-none rounded-2xl p-4 font-medium text-slate-900 text-xs h-32 resize-none focus:ring-2 focus:ring-blue-500/20"
                            value={formData.terms}
                            onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                        />
                    </div>
                </div>
            </form>
        </div>
    );
};

export default QuotationForm;
