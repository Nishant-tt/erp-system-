import React, { useState, useEffect } from 'react';
import {
    Truck,
    ArrowLeft,
    Navigation,
    ShoppingBag
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { createDeliveryNoteAPI, getDeliveryNoteByIdAPI } from '../../api/deliveryNote';
import { getSalesOrdersAPI } from '../../api/salesOrder';

const DeliveryNoteForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Resources
    const [salesOrders, setSalesOrders] = useState([]);

    // Form
    const [formData, setFormData] = useState({
        customer: '',
        salesOrderReference: '',
        deliveryDate: new Date().toISOString().split('T')[0],
        items: [{ item: '', shippedQuantity: 1, uom: 'pcs' }],
        shippingAddress: '',
        transporter: '',
        lrNumber: '',
        status: 'DISPATCHED'
    });

    useEffect(() => {
        fetchResources();
        if (id) fetchDelivery();
    }, [id]);

    const fetchResources = async () => {
        try {
            const orders = await getSalesOrdersAPI();
            setSalesOrders(orders.filter(o => o.status === 'OPEN' || o.status === 'PARTIALLY_SHIPPED'));
        } catch (error) {
            console.error('Error resources:', error);
        }
    };

    const fetchDelivery = async () => {
        try {
            const data = await getDeliveryNoteByIdAPI(id);
            setFormData(data);
        } catch (error) {
            console.error('Error fetch delivery:', error);
        }
    };

    const handleOrderLink = (orderId) => {
        const order = salesOrders.find(o => o._id === orderId);
        if (order) {
            setFormData({
                ...formData,
                salesOrderReference: orderId,
                customer: order.customer?._id || order.customer,
                items: order.items.map(item => ({
                    item: item.item?._id || item.item,
                    shippedQuantity: item.quantity,
                    uom: 'pcs'
                }))
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await createDeliveryNoteAPI(formData);
            navigate('/delivery-notes');
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
                <button onClick={() => navigate('/delivery-notes')} className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight text-center sm:text-left">Dispatch Goods</h1>
                    <p className="text-slate-500 font-medium text-sm text-center sm:text-left">Generate delivery notes and shipping documents</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-slate-900">
                <div className="lg:col-span-2 space-y-6">
                    {/* Link Sales Order */}
                    <div className="bg-indigo-50 rounded-[32px] p-6 border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                                <ShoppingBag size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-indigo-900 leading-tight">Link Sales Order</h3>
                                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-0.5">Select order to fulfill</p>
                            </div>
                        </div>
                        <select
                            className="bg-white border-indigo-100 rounded-xl text-xs font-bold text-indigo-900 px-4 py-2 w-full sm:w-auto"
                            onChange={(e) => handleOrderLink(e.target.value)}
                            value={formData.salesOrderReference}
                        >
                            <option value="">Select Order</option>
                            {salesOrders.map(o => <option key={o._id} value={o._id}>{o.soNumber} - {o.customer?.name}</option>)}
                        </select>
                    </div>

                    {/* Logistics Info */}
                    <div className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Shipping Address</label>
                            <textarea
                                className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-900 h-24 resize-none"
                                value={formData.shippingAddress}
                                onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                                placeholder="Full destination address..."
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Transporter / Courier</label>
                            <input
                                type="text"
                                className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-900"
                                value={formData.transporter}
                                onChange={(e) => setFormData({ ...formData, transporter: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">L.R. / Tracking Number</label>
                            <input
                                type="text"
                                className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-900"
                                value={formData.lrNumber}
                                onChange={(e) => setFormData({ ...formData, lrNumber: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Shipped Items */}
                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-slate-50">
                            <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Packing List</h2>
                        </div>
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-slate-900">Item Name</th>
                                    <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 w-32 text-slate-900">Qty for Dispatch</th>
                                    <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 w-24 text-slate-900">UOM</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {formData.items.map((row, idx) => (
                                    <tr key={idx}>
                                        <td className="px-8 py-4 font-bold text-sm text-slate-600">
                                            {/* In a real app we'd fetch item names, here we assume it's linked */}
                                            {typeof row.item === 'string' ? 'Linked Product' : row.item?.itemName}
                                        </td>
                                        <td className="px-8 py-4">
                                            <input
                                                type="number"
                                                className="w-full bg-slate-50 border-none rounded-lg px-3 py-2 font-black text-sm text-slate-900"
                                                value={row.shippedQuantity}
                                                onChange={(e) => {
                                                    const newItems = [...formData.items];
                                                    newItems[idx].shippedQuantity = Number(e.target.value);
                                                    setFormData({ ...formData, items: newItems });
                                                }}
                                            />
                                        </td>
                                        <td className="px-8 py-4 font-medium text-xs text-slate-400">{row.uom}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl">
                        <div className="flex items-center gap-3 mb-8">
                            <Navigation className="text-indigo-400" size={20} />
                            <h3 className="font-black text-xs uppercase tracking-widest">Dispatch Status</h3>
                        </div>
                        <div className="space-y-2 mb-8">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Current Stage</label>
                            <select
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-black text-xs text-white focus:ring-indigo-500"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="DISPATCHED">DISPATCHED</option>
                                <option value="IN_TRANSIT">IN TRANSIT</option>
                                <option value="DELIVERED">DELIVERED</option>
                            </select>
                        </div>
                        <button type="submit" disabled={loading} className="w-full bg-indigo-600 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-3">
                            <Truck size={18} />
                            {loading ? 'Processing...' : 'Generate Dispatch'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default DeliveryNoteForm;
