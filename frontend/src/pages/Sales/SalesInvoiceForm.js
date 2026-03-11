import React, { useState, useEffect } from 'react';
import {
    Save,
    ArrowLeft,
    Receipt,
    Truck
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { createSalesInvoiceAPI, getSalesInvoiceByIdAPI, updateSalesInvoiceAPI } from '../../api/salesInvoice';
import { getDeliveryNotesAPI, getDeliveryNoteByIdAPI } from '../../api/deliveryNote';

const SalesInvoiceForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Resources
    const [deliveries, setDeliveries] = useState([]);

    // Form
    const [formData, setFormData] = useState({
        customer: '',
        dnReference: '',
        dueDate: '',
        items: [{ item: '', quantity: 1, unitPrice: 0, total: 0 }],
        subtotal: 0,
        taxTotal: 0,
        grandTotal: 0,
        notes: ''
    });

    useEffect(() => {
        fetchResources();
        if (id) fetchInvoice();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchResources = async () => {
        try {
            const data = await getDeliveryNotesAPI();
            setDeliveries(data.filter(d => d.status === 'DELIVERED' || d.status === 'DISPATCHED'));
        } catch (error) {
            console.error('Error resources:', error);
        }
    };

    const fetchInvoice = async () => {
        try {
            const data = await getSalesInvoiceByIdAPI(id);
            setFormData(data);
        } catch (error) {
            console.error('Error fetch invoice:', error);
        }
    };

    const handleDeliveryLink = async (dnId) => {
        if (!dnId) return;
        try {
            setLoading(true);
            const dn = await getDeliveryNoteByIdAPI(dnId);
            if (dn) {
                // Use prices from Sales Order if available, else fall back to item standard rate
                const soItems = dn.soReference?.items || [];

                const mappedItems = dn.items.map(dnItem => {
                    const soMatch = soItems.find(si => si.item?._id === dnItem.item?._id || si.item === dnItem.item?._id);
                    const price = soMatch ? soMatch.unitPrice : (dnItem.item?.standardRate || 0);
                    const sub = dnItem.shippedQuantity * price;
                    return {
                        item: dnItem.item?._id || dnItem.item,
                        itemName: dnItem.item?.itemName || 'Unknown Item',
                        quantity: dnItem.shippedQuantity,
                        unitPrice: price,
                        taxAmount: sub * 0.18,
                        total: sub * 1.18
                    };
                });

                setFormData({
                    ...formData,
                    dnReference: dnId,
                    soReference: dn.soReference?._id || dn.soReference,
                    customer: dn.customer?._id || dn.customer,
                    items: mappedItems,
                    subtotal: mappedItems.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0),
                    taxTotal: mappedItems.reduce((sum, i) => sum + i.taxAmount, 0),
                    grandTotal: mappedItems.reduce((sum, i) => sum + i.total, 0)
                });
            }
        } catch (error) {
            console.error('Error linking delivery:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            if (id) {
                await updateSalesInvoiceAPI(id, formData);
            } else {
                await createSalesInvoiceAPI(formData);
            }
            navigate('/sales-invoices');
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 pb-24 sm:pb-32 max-w-7xl mx-auto min-w-0">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate('/sales-invoices')} className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sales Invoice</h1>
                    <p className="text-slate-500 font-medium text-sm">Create billing for delivered goods</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-slate-900">
                <div className="lg:col-span-2 space-y-6">
                    {/* Link Delivery */}
                    <div className="bg-blue-50 rounded-[32px] p-6 border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                                <Truck size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-blue-900 leading-tight">Link Delivery Note</h3>
                                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">Select shipment for billing</p>
                            </div>
                        </div>
                        <select
                            className="bg-white border-blue-100 rounded-xl text-xs font-bold text-blue-900 px-4 py-2 w-full sm:w-auto"
                            onChange={(e) => handleDeliveryLink(e.target.value)}
                            value={formData.dnReference}
                        >
                            <option value="">Select Delivery</option>
                            {deliveries.map(d => <option key={d._id} value={d._id}>{d.dnNumber} - {d.customer?.name}</option>)}
                        </select>
                    </div>

                    {/* Basic Info */}
                    <div className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Due Date</label>
                            <input
                                type="date"
                                className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-900"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    {/* Items */}
                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-slate-50">
                            <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Billing Items</h2>
                        </div>
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-slate-900">Description</th>
                                    <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 w-24 text-slate-900">Qty</th>
                                    <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right text-slate-900">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {formData.items.map((row, idx) => (
                                    <tr key={idx}>
                                        <td className="px-8 py-4 font-bold text-sm text-slate-700">{row.itemName || 'Selected Item'}</td>
                                        <td className="px-8 py-4 font-black">{row.quantity}</td>
                                        <td className="px-8 py-4 text-right font-black">₹{row.total.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl">
                        <div className="flex items-center gap-3 mb-8">
                            <Receipt className="text-blue-400" size={20} />
                            <h3 className="font-black text-xs uppercase tracking-widest">Invoicing Total</h3>
                        </div>
                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Taxable Amount</span>
                                <span className="font-black">₹{formData.subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-white/40 font-bold uppercase tracking-widest text-[10px]">IGST (18%)</span>
                                <span className="font-black text-rose-400">₹{formData.taxTotal.toLocaleString()}</span>
                            </div>
                            <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                                <span className="text-white font-black uppercase tracking-[0.2em] text-xs">Total Invoice</span>
                                <span className="text-3xl font-black text-blue-400">₹{formData.grandTotal.toLocaleString()}</span>
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="w-full bg-blue-600 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-3">
                            <Save size={18} />
                            {loading ? 'Finalizing...' : 'Create Sales Invoice'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default SalesInvoiceForm;
