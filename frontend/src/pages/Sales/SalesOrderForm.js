import React, { useState, useEffect } from 'react';
import {
    ShoppingBag,
    Plus,
    Trash2,
    Save,
    ArrowLeft,
    Package,
    Calculator,
    Info,
    Calendar,
    FileText
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { createSalesOrderAPI, getSalesOrderByIdAPI } from '../../api/salesOrder';
import { getQuotationsAPI } from '../../api/quotation';
import { getCustomersAPI } from '../../api/customer';
import { getItemsAPI } from '../../api/itemMaster';

const SalesOrderForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Resources
    const [customers, setCustomers] = useState([]);
    const [quotations, setQuotations] = useState([]);
    const [itemMaster, setItemMaster] = useState([]);

    // Form
    const [formData, setFormData] = useState({
        customer: '',
        quotationReference: '',
        deliveryDate: '',
        items: [{ item: '', quantity: 1, unitPrice: 0, total: 0 }],
        subtotal: 0,
        taxTotal: 0,
        grandTotal: 0,
        notes: ''
    });

    useEffect(() => {
        fetchResources();
        if (id) fetchOrder();
    }, [id]);

    const fetchResources = async () => {
        try {
            const [custData, quoteData, itemData] = await Promise.all([
                getCustomersAPI(),
                getQuotationsAPI(),
                getItemsAPI()
            ]);
            setCustomers(custData);
            setQuotations(quoteData.filter(q => q.status === 'ACCEPTED'));
            setItemMaster(itemData);
        } catch (error) {
            console.error('Error resources:', error);
        }
    };

    const fetchOrder = async () => {
        try {
            const data = await getSalesOrderByIdAPI(id);
            setFormData(data);
        } catch (error) {
            console.error('Error fetch order:', error);
        }
    };

    const handleQuotationLink = (quoteId) => {
        const quote = quotations.find(q => q._id === quoteId);
        if (quote) {
            setFormData({
                ...formData,
                quotationReference: quoteId,
                customer: quote.customer?._id || quote.customer,
                items: quote.items.map(item => ({
                    item: item.item?._id || item.item,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    total: item.total
                })),
                subtotal: quote.subtotal,
                taxTotal: quote.taxTotal,
                grandTotal: quote.grandTotal
            });
        }
    };

    const calculateTotals = (items) => {
        const subtotal = items.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0);
        const taxTotal = subtotal * 0.18;
        setFormData(prev => ({
            ...prev,
            items: items.map(i => ({ ...i, total: (i.quantity * i.unitPrice) * 1.18 })),
            subtotal,
            taxTotal,
            grandTotal: subtotal + taxTotal
        }));
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        if (field === 'item') {
            const item = itemMaster.find(i => i._id === value);
            newItems[index] = { ...newItems[index], item: value, unitPrice: item?.standardRate || 0 };
        } else {
            newItems[index][field] = value;
        }
        calculateTotals(newItems);
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { item: '', quantity: 1, unitPrice: 0, total: 0 }]
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
            await createSalesOrderAPI(formData);
            navigate('/sales-orders');
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 pb-32 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate('/sales-orders')} className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Confirmed Sales Order</h1>
                    <p className="text-slate-500 font-medium text-sm">Convert a quotation or register a direct order</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Link Quotation Section */}
                    <div className="bg-emerald-50 rounded-[32px] p-6 border border-emerald-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                                <FileText size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-emerald-900 leading-tight">Link Accepted Quotation</h3>
                                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">Auto-fill order details</p>
                            </div>
                        </div>
                        <select
                            className="bg-white border-emerald-100 rounded-xl text-xs font-bold text-emerald-900 px-4 py-2 focus:ring-emerald-500"
                            onChange={(e) => handleQuotationLink(e.target.value)}
                            value={formData.quotationReference}
                        >
                            <option value="">Select a Quote</option>
                            {quotations.map(q => <option key={q._id} value={q._id}>{q.quotationNumber} - {q.customer?.name}</option>)}
                        </select>
                    </div>

                    {/* Order Details */}
                    <div className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Customer</label>
                                <select
                                    className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-900"
                                    value={formData.customer}
                                    onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                                    required
                                >
                                    <option value="">Select Customer</option>
                                    {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Expected Delivery</label>
                                <input
                                    type="date"
                                    className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-900"
                                    value={formData.deliveryDate}
                                    onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Order Items</h2>
                            <button type="button" onClick={addItem} className="text-emerald-600 font-black text-[10px] uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-xl transition-all">Add Item</button>
                        </div>
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Product</th>
                                    <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 w-24">Qty</th>
                                    <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Rate</th>
                                    <th className="px-8 py-4 w-16"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {formData.items.map((row, idx) => (
                                    <tr key={idx}>
                                        <td className="px-8 py-4">
                                            <select
                                                className="w-full bg-transparent border-none p-0 font-bold text-sm"
                                                value={row.item}
                                                onChange={(e) => handleItemChange(idx, 'item', e.target.value)}
                                                required
                                            >
                                                <option value="">Select Item</option>
                                                {itemMaster.map(i => <option key={i._id} value={i._id}>{i.itemName}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-8 py-4">
                                            <input type="number" className="w-full bg-transparent border-none p-0 font-bold text-sm" value={row.quantity} onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))} />
                                        </td>
                                        <td className="px-8 py-4 text-right">
                                            <input type="number" className="w-full bg-transparent border-none p-0 font-black text-right text-sm" value={row.unitPrice} onChange={(e) => handleItemChange(idx, 'unitPrice', Number(e.target.value))} />
                                        </td>
                                        <td className="px-8 py-4 text-center">
                                            <button type="button" onClick={() => removeItem(idx)} className="text-slate-300 hover:text-rose-500"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl">
                        <div className="flex items-center gap-3 mb-8">
                            <Calculator className="text-emerald-400" size={20} />
                            <h3 className="font-black text-xs uppercase tracking-widest">Order Summary</h3>
                        </div>
                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Taxable Amount</span>
                                <span className="font-black">₹{formData.subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Sales GST (18%)</span>
                                <span className="font-black text-rose-400">₹{formData.taxTotal.toLocaleString()}</span>
                            </div>
                            <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                                <span className="text-white font-black uppercase tracking-[0.2em] text-xs">Total Payable</span>
                                <span className="text-3xl font-black text-emerald-400">₹{formData.grandTotal.toLocaleString()}</span>
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="w-full bg-emerald-500 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-3">
                            <Save size={18} />
                            {loading ? 'Processing...' : 'Confirm Sales Order'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default SalesOrderForm;
