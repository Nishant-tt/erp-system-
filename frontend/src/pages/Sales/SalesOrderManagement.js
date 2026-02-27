import React, { useState, useEffect } from 'react';
import {
    ShoppingBag,
    Plus,
    Truck,
    CheckCircle2,
    Calendar,
    ArrowUpRight,
    Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSalesOrdersAPI } from '../../api/salesOrder';

const SalesOrderManagement = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await getSalesOrdersAPI();
            setOrders(data);
        } catch (error) {
            console.error('Error fetching sales orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'SHIPPED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'PARTIALLY_SHIPPED': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'INVOICED': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'OPEN': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            case 'CLOSED': return 'bg-slate-50 text-slate-600 border-slate-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    return (
        <div className="p-8 pb-24 text-slate-900">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                            <ShoppingBag size={24} />
                        </div>
                        Sales Orders
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Track and fulfill customer orders</p>
                </div>
                <button
                    onClick={() => navigate('/sales-orders/create')}
                    className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:shadow-xl transition-all active:scale-95"
                >
                    <Plus size={20} />
                    Create New Order
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white border border-slate-100 p-6 rounded-[32px] flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                        <Calendar size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Orders</p>
                        <h3 className="text-2xl font-black">{orders.length}</h3>
                    </div>
                </div>
                <div className="bg-white border border-slate-100 p-6 rounded-[32px] flex items-center gap-4">
                    <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                        <Truck size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Pending Shipment</p>
                        <h3 className="text-2xl font-black">{orders.filter(o => o.status === 'OPEN' || o.status === 'PARTIALLY_SHIPPED').length}</h3>
                    </div>
                </div>
                <div className="bg-white border border-slate-100 p-6 rounded-[32px] flex items-center gap-4">
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                        <CheckCircle2 size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Fulfilled Orders</p>
                        <h3 className="text-2xl font-black">{orders.filter(o => o.status === 'SHIPPED' || o.status === 'INVOICED').length}</h3>
                    </div>
                </div>
            </div>

            {/* Orders List */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 overflow-x-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="animate-spin text-primary" size={40} />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Order Book...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <ShoppingBag className="text-slate-200 mb-4" size={60} />
                            <h3 className="text-lg font-black text-slate-900">No Sales Orders</h3>
                            <p className="text-slate-500 max-w-xs mt-2">Create an order from an accepted quotation or manually.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr>
                                    <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Order & Date</th>
                                    <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Customer</th>
                                    <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Progress</th>
                                    <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                    <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Total</th>
                                    <th className="pb-6 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {orders.map((order) => (
                                    <tr key={order._id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="py-6">
                                            <p className="font-black text-slate-900">{order.soNumber}</p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <Calendar size={12} className="text-slate-400" />
                                                <p className="text-[10px] font-bold text-slate-500 uppercase">{new Date(order.orderDate).toLocaleDateString()}</p>
                                            </div>
                                        </td>
                                        <td className="py-6">
                                            <p className="font-bold text-slate-900">{order.customer?.name}</p>
                                            <p className="text-[10px] font-medium text-slate-400 mt-0.5">Quote: {order.quotationReference?.quotationNumber || 'Direct'}</p>
                                        </td>
                                        <td className="py-6">
                                            <div className="flex items-center gap-4 max-w-[120px]">
                                                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className={`h-full ${order.status === 'SHIPPED' || order.status === 'INVOICED' ? 'bg-emerald-500 w-full' : order.status === 'PARTIALLY_SHIPPED' ? 'bg-amber-500 w-1/2' : 'bg-indigo-400 w-1/4'}`}></div>
                                                </div>
                                                <span className="text-[10px] font-black text-slate-500">
                                                    {order.status === 'SHIPPED' || order.status === 'INVOICED' ? '100%' : order.status === 'PARTIALLY_SHIPPED' ? '50%' : '20%'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-6">
                                            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black border uppercase tracking-widest ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="py-6 text-right text-slate-900 font-black">
                                            ₹{order.grandTotal.toLocaleString()}
                                        </td>
                                        <td className="py-6 pr-4 text-right">
                                            <button
                                                onClick={() => navigate(`/sales-orders/edit/${order._id}`)}
                                                className="text-slate-300 hover:text-slate-900 transition-colors"
                                            >
                                                <ArrowUpRight size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SalesOrderManagement;

