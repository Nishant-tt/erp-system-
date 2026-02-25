import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPOsAPI } from '../../api/po';
import {
    FileText,
    Plus,
    Search,
    Filter,
    ChevronRight,
    Clock,
    CheckCircle2,
    AlertCircle,
    Truck,
    CircleDot,
    Loader2
} from 'lucide-react';

const PurchaseOrderManagement = () => {
    const navigate = useNavigate();
    const [pos, setPOs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPOs();
    }, []);

    const fetchPOs = async () => {
        try {
            const data = await getPOsAPI();
            setPOs(data);
        } catch (error) {
            console.error('Error fetching POs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'OPEN': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'PARTIALLY_RECEIVED': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'RECEIVED': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'CLOSED': return 'bg-slate-50 text-slate-600 border-slate-100';
            case 'CANCELLED': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-slate-50 text-slate-500 border-slate-100';
        }
    };

    const filteredPOs = pos.filter(po =>
        po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.supplier?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Purchase Orders</h1>
                    <p className="text-slate-500 text-sm font-medium">Manage and track your official procurement orders.</p>
                </div>
                <button
                    onClick={() => navigate('/purchase-orders/create')}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 active:scale-95"
                >
                    <Plus size={18} />
                    Create New PO
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative group w-full md:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search PO number or supplier..."
                        className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 transition-all font-bold text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-[32px] shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Details</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Supplier</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Amount</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredPOs.map((po) => (
                                <tr
                                    key={po._id}
                                    className="group hover:bg-slate-50/50 transition-all cursor-pointer"
                                    onClick={() => navigate(`/purchase-orders/${po._id}`)}
                                >
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 group-hover:text-primary transition-colors">{po.poNumber}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <Clock size={12} className="text-slate-400" />
                                                    <span className="text-xs font-bold text-slate-400">{new Date(po.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <Truck size={14} className="text-slate-400" />
                                            <span className="font-bold text-slate-700">{po.supplier?.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="font-black text-slate-900">₹{po.totalAmount.toLocaleString()}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(po.status)}`}>
                                            {po.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end rotate group-hover:translate-x-1 transition-transform">
                                            <ChevronRight className="text-slate-300 group-hover:text-primary" size={20} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredPOs.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                                <FileText size={40} />
                                            </div>
                                            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No Purchase Orders found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PurchaseOrderManagement;
