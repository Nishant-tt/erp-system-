import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPOsAPI } from '../../api/po';
import { createGRNAPI } from '../../api/grn';
import {
    Truck,
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
    Loader2,
    Package,
    Calendar,
    FileText,
    Hash,
    ClipboardCheck,
    AlertTriangle
} from 'lucide-react';

const CreateGRN = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Data states
    const [openPOs, setOpenPOs] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    // Form states
    const [selectedPO, setSelectedPO] = useState(null);
    const [items, setItems] = useState([]);
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [billNumber, setBillNumber] = useState('');
    const [billDate, setBillDate] = useState('');
    const [remarks, setRemarks] = useState('');

    useEffect(() => {
        const fetchPOs = async () => {
            try {
                const data = await getPOsAPI();
                setOpenPOs(data.filter(po => ['OPEN', 'PARTIALLY_RECEIVED'].includes(po.status)));
            } catch (err) {
                console.error('Failed to load POs:', err);
                setMessage({ type: 'error', text: 'Failed to load purchase orders.' });
            } finally {
                setLoadingData(false);
            }
        };
        fetchPOs();
    }, []);

    const handlePOSelect = (poId) => {
        const po = openPOs.find(p => p._id === poId);
        if (po) {
            setSelectedPO(po);
            // Only suggest lines that haven't been fully received
            setItems(po.items.filter(item => item.receivedQuantity < item.quantity).map(item => ({
                item: item.item._id,
                itemName: item.item.itemName,
                itemCode: item.item.itemCode,
                orderedQuantity: item.quantity,
                alreadyReceived: item.receivedQuantity,
                receivedQuantity: item.quantity - item.receivedQuantity,
                rejectedQuantity: 0,
                unit: item.unit,
                unitCost: item.unitCost
            })));
        } else {
            setSelectedPO(null);
            setItems([]);
        }
    };

    const updateItem = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = parseFloat(value) || 0;
        setItems(newItems);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedPO) {
            setMessage({ type: 'error', text: 'Please select a Purchase Order.' });
            return;
        }

        const validItems = items.filter(i => i.receivedQuantity > 0);
        if (validItems.length === 0) {
            setMessage({ type: 'error', text: 'Please record at least one received item.' });
            return;
        }

        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            await createGRNAPI({
                poReference: selectedPO._id,
                supplier: selectedPO.supplier._id,
                items: validItems,
                receivedDate: new Date(),
                vehicleNumber,
                billNumber,
                billDate,
                remarks
            });
            setMessage({ type: 'success', text: 'Goods Receipt recorded successfully!' });
            setTimeout(() => navigate('/grns'), 1500);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to record GRN.' });
            setIsSubmitting(false);
        }
    };

    if (loadingData) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 className="animate-spin text-emerald-600" size={32} />
                <span className="ml-3 text-sm font-bold text-slate-400 uppercase tracking-widest">Scanning inventory logs...</span>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <button
                        onClick={() => navigate('/grns')}
                        className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 transition-colors font-bold text-xs uppercase tracking-widest mb-2"
                    >
                        <ArrowLeft size={14} />
                        Back to Inventory
                    </button>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Truck className="text-emerald-600" size={28} />
                        Material Inward (GRN)
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
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-200/60 space-y-8">
                        {/* Reference Selection */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Select Open Purchase Order</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {openPOs.map(po => (
                                    <button
                                        key={po._id}
                                        type="button"
                                        onClick={() => handlePOSelect(po._id)}
                                        className={`p-6 rounded-3xl border-2 text-left transition-all relative overflow-hidden group ${selectedPO?._id === po._id
                                            ? 'border-emerald-500 bg-emerald-50/30'
                                            : 'border-slate-100 hover:border-slate-200'}`}
                                    >
                                        <div className="relative z-10">
                                            <p className={`font-black uppercase tracking-tight ${selectedPO?._id === po._id ? 'text-emerald-700' : 'text-slate-900'}`}>{po.poNumber}</p>
                                            <p className="text-xs font-bold text-slate-500 mt-1">{po.supplier?.name}</p>
                                            <div className="flex gap-2 mt-4">
                                                <span className="text-[9px] font-black bg-white px-2 py-0.5 rounded-md border border-slate-100 text-slate-400 uppercase tracking-widest">
                                                    {po.items.length} Items
                                                </span>
                                            </div>
                                        </div>
                                        <FileText className={`absolute -right-4 -bottom-4 transition-transform group-hover:scale-110 ${selectedPO?._id === po._id ? 'text-emerald-100' : 'text-slate-50'}`} size={80} />
                                    </button>
                                ))}
                                {openPOs.length === 0 && (
                                    <div className="col-span-2 py-10 px-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No open POs found for receipt</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Line Items Verification */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Received Items Verification</h2>
                                {items.length > 0 && <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg uppercase tracking-widest">Pending Reconciliation</span>}
                            </div>

                            <div className="space-y-4">
                                {items.map((item, idx) => (
                                    <div key={idx} className="bg-slate-50/30 p-6 rounded-[32px] border border-slate-100/50 space-y-6">
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-4 items-center">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                                                    <Package size={20} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-black text-indigo-500 font-mono tracking-tighter">{item.itemCode}</span>
                                                        <span className="font-bold text-slate-900">{item.itemName}</span>
                                                    </div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ordered: {item.orderedQuantity} {item.unit} | Received: {item.alreadyReceived}</p>
                                                </div>
                                            </div>
                                            {item.receivedQuantity + item.alreadyReceived > item.orderedQuantity && (
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-xl border border-amber-100 text-amber-600">
                                                    <AlertTriangle size={14} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Over-delivery</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-8 pt-4 border-t border-white">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Quantity Received</label>
                                                <input
                                                    type="number"
                                                    className="w-full px-5 py-3 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald-500/20 font-black text-lg transition-all"
                                                    value={item.receivedQuantity}
                                                    onChange={(e) => updateItem(idx, 'receivedQuantity', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Quantity Rejected</label>
                                                <input
                                                    type="number"
                                                    className="w-full px-5 py-3 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-red-500/20 font-black text-lg transition-all text-red-500"
                                                    value={item.rejectedQuantity}
                                                    onChange={(e) => updateItem(idx, 'rejectedQuantity', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {selectedPO && items.length === 0 && (
                                    <div className="p-8 text-center bg-emerald-50/50 rounded-3xl border border-emerald-100">
                                        <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-3" />
                                        <p className="text-xs font-black text-emerald-700 uppercase tracking-widest">All items from this PO have been received!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Logistics Side Panel */}
                <div className="space-y-6">
                    <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-200/60 space-y-8">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-4 flex items-center gap-2">
                            <Truck size={16} className="text-emerald-500" /> Dispatch Info
                        </h3>

                        <div className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                                    Vehicle Number
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. MH-12-AB-1234"
                                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald-500/20 font-bold text-sm"
                                    value={vehicleNumber}
                                    onChange={(e) => setVehicleNumber(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                                    <Hash size={12} /> Supplier Bill/Invoice #
                                </label>
                                <input
                                    type="text"
                                    placeholder="Order reference from vendor"
                                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald-500/20 font-bold text-sm"
                                    value={billNumber}
                                    onChange={(e) => setBillNumber(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                                    <Calendar size={12} /> Bill Date
                                </label>
                                <input
                                    type="date"
                                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald-500/20 font-bold text-sm"
                                    value={billDate}
                                    onChange={(e) => setBillDate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Remarks</label>
                                <textarea
                                    rows="3"
                                    placeholder="Condition of goods, shortages..."
                                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald-500/20 font-bold text-sm resize-none"
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || !selectedPO || items.length === 0}
                            className="w-full py-5 bg-emerald-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-700 shadow-xl shadow-emerald-600/30 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <ClipboardCheck size={18} />}
                            Finalize Receipt
                        </button>
                    </div>

                    <div className="bg-emerald-900 rounded-[40px] p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full -mr-10 -mt-10" />
                        <div className="relative z-10 flex items-start gap-4">
                            <AlertTriangle size={24} className="text-amber-400 shrink-0 mt-1" />
                            <p className="text-[10px] font-bold text-emerald-100/60 leading-relaxed uppercase tracking-wider">
                                Confirming this GRN will automatically update inventory levels and Purchase Order progress. Ensure quantities are physically tallied.
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CreateGRN;
