import React, { useState, useEffect } from 'react';
import {
    Truck,
    Plus,
    Search,
    Box,
    CheckCircle2,
    Clock,
    User,
    ArrowUpRight,
    Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDeliveryNotesAPI } from '../../api/deliveryNote';

const DeliveryManagement = () => {
    const navigate = useNavigate();
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDeliveries();
    }, []);

    const fetchDeliveries = async () => {
        try {
            setLoading(true);
            const data = await getDeliveryNotesAPI();
            setDeliveries(data);
        } catch (error) {
            console.error('Error fetching delivery notes:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 pb-24 text-slate-900">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center text-sky-600">
                            <Truck size={24} />
                        </div>
                        Delivery Notes
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Logistics and outbound shipment tracking</p>
                </div>
                <button
                    onClick={() => navigate('/delivery-notes/create')}
                    className="flex items-center gap-2 bg-sky-600 text-white px-6 py-3 rounded-2xl font-bold hover:shadow-lg hover:shadow-sky-600/30 transition-all active:scale-95"
                >
                    <Plus size={20} />
                    Process Shipment
                </button>
            </div>

            {/* Delivery List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {loading ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-24 gap-4 bg-white rounded-[40px] border border-slate-100 shadow-sm">
                        <Loader2 className="animate-spin text-sky-600" size={40} />
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Logistics Deck...</p>
                    </div>
                ) : deliveries.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center bg-white rounded-[40px] border border-slate-100 shadow-sm">
                        <div className="w-20 h-20 bg-sky-50 rounded-full flex items-center justify-center text-sky-200 mb-4">
                            <Truck size={40} />
                        </div>
                        <h3 className="text-lg font-black text-slate-900">No Active Deliveries</h3>
                        <p className="text-slate-500 max-w-xs mt-2">Shipments will appear here once you process a sales order delivery.</p>
                    </div>
                ) : (
                    deliveries.map((dn) => (
                        <div key={dn._id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-600 group-hover:scale-110 transition-transform">
                                        <Box size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900 uppercase tracking-tighter">{dn.dnNumber}</h3>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-sky-600 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-100">
                                                {dn.status}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400">
                                                Order: {dn.soReference?.soNumber}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-slate-900">{new Date(dn.deliveryDate).toLocaleDateString()}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Delivery Date</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-3xl p-6 mb-6 text-slate-900">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Items Shipped</h4>
                                    <span className="text-[10px] font-black text-slate-700">{dn.items?.length || 0} Products</span>
                                </div>
                                <div className="space-y-3">
                                    {dn.items?.slice(0, 2).map((item, i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <p className="text-xs font-bold text-slate-700">{item.item?.itemName}</p>
                                            <p className="text-xs font-black text-slate-900">{item.shippedQuantity} {item.item?.uom || 'PCS'}</p>
                                        </div>
                                    ))}
                                    {dn.items?.length > 2 && (
                                        <p className="text-[10px] font-bold text-sky-600 pt-1">+{dn.items.length - 2} more items</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                                            <User size={14} />
                                        </div>
                                        <div className="text-[10px]">
                                            <p className="font-black text-slate-900 leading-none">{dn.transporter || 'Logistics Partner'}</p>
                                            <p className="text-slate-400 font-bold mt-0.5">Courier</p>
                                        </div>
                                    </div>
                                    <div className="border-l border-slate-100 pl-4 text-[10px]">
                                        <p className="font-black text-slate-900 leading-none">{dn.lrNumber || 'N/A'}</p>
                                        <p className="text-slate-400 font-bold mt-0.5">L.R. / Tracking</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate(`/delivery-notes/edit/${dn._id}`)}
                                    className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:text-sky-600 hover:border-sky-100 hover:bg-sky-50 transition-all font-bold"
                                >
                                    <ArrowUpRight size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DeliveryManagement;
