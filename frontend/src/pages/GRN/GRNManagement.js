import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGRNsAPI } from '../../api/grn';
import {
    Truck,
    Plus,
    Search,
    ChevronRight,
    Clock,
    CheckCircle2,
    Package,
    Loader2,
    Calendar,
    Hash
} from 'lucide-react';

const GRNManagement = () => {
    const navigate = useNavigate();
    const [grns, setGRNs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchGRNs();
    }, []);

    const fetchGRNs = async () => {
        try {
            const data = await getGRNsAPI();
            setGRNs(data);
        } catch (error) {
            console.error('Error fetching GRNs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredGRNs = grns.filter(grn =>
        grn.grnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grn.supplier?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grn.poReference?.poNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Goods Receipt Notes (GRN)</h1>
                    <p className="text-slate-500 text-sm font-medium">Record and verify incoming shipments against Purchase Orders.</p>
                </div>
                <button
                    onClick={() => navigate('/grns/create')}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                    <Plus size={18} />
                    New Material Inward
                </button>
            </div>

            <div className="relative group max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input
                    type="text"
                    placeholder="Search GRN, PO, or Supplier..."
                    className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald-500/20 transition-all font-bold text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-[32px] shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">GRN Details</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Supplier & PO</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Inward Items</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Received Date</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredGRNs.map((grn) => (
                                <tr key={grn._id} className="group hover:bg-slate-50/50 transition-all cursor-pointer">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                                                <Truck size={20} />
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{grn.grnNumber}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <Hash size={10} className="text-slate-400" />
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bill: {grn.billNumber || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="space-y-1">
                                            <p className="font-bold text-slate-700 text-sm">{grn.supplier?.name}</p>
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 rounded-md w-max">
                                                <span className="text-[9px] font-black text-slate-500">REF: {grn.poReference?.poNumber || 'Direct'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                            {grn.items?.length || 0} Skus
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Calendar size={14} className="text-slate-400" />
                                            <span className="text-xs font-bold">{new Date(grn.receivedDate).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <ChevronRight className="inline-block text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" size={20} />
                                    </td>
                                </tr>
                            ))}
                            {filteredGRNs.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-100">
                                                <Package size={40} />
                                            </div>
                                            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No goods receipts found</p>
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

export default GRNManagement;
