import React, { useState, useEffect } from 'react';
import { getFinancialYearsAPI, createFinancialYearAPI, updateFinancialYearAPI, deleteFinancialYearAPI } from '../../api/financialYear';
import {
    Calendar,
    Plus,
    Edit2,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Loader2,
    X,
    Clock,
    Globe
} from 'lucide-react';

const FinancialYearManagement = () => {
    const [fyears, setFyears] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingFY, setEditingFY] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        startDate: '',
        endDate: '',
        isActive: false
    });

    useEffect(() => {
        fetchFYs();
    }, []);

    const fetchFYs = async () => {
        try {
            const data = await getFinancialYearsAPI();
            setFyears(data);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to load financial years.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (fy = null) => {
        if (fy) {
            setEditingFY(fy);
            setFormData({
                name: fy.name,
                code: fy.code || '',
                startDate: fy.startDate.split('T')[0],
                endDate: fy.endDate.split('T')[0],
                isActive: fy.isActive
            });
        } else {
            setEditingFY(null);
            setFormData({ name: '', code: '', startDate: '', endDate: '', isActive: false });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            if (editingFY) {
                await updateFinancialYearAPI(editingFY._id, formData);
                setMessage({ type: 'success', text: 'Financial year updated!' });
            } else {
                await createFinancialYearAPI(formData);
                setMessage({ type: 'success', text: 'Financial year created!' });
            }
            setShowModal(false);
            fetchFYs();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to process request.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this financial year?')) return;
        try {
            await deleteFinancialYearAPI(id);
            fetchFYs();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to delete.' });
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 px-0 sm:px-2 min-w-0">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Financial Years</h1>
                    <p className="text-slate-500 text-sm font-medium">Define accounting periods for your organization.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 active:scale-95"
                >
                    <Plus size={18} />
                    Create FY
                </button>
            </div>

            {message.text && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <p className="text-sm font-bold">{message.text}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {fyears.map((fy) => (
                    <div key={fy._id} className={`bg-white rounded-[32px] p-6 border-2 transition-all relative group ${fy.isActive ? 'border-primary ring-4 ring-primary/5' : 'border-slate-100 hover:border-slate-200'
                        }`}>
                        {fy.isActive && (
                            <span className="absolute -top-3 left-6 px-3 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                                Active Period
                            </span>
                        )}

                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-3 rounded-2xl ${fy.isActive ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400'}`}>
                                <Calendar size={24} />
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleOpenModal(fy)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-primary transition-colors">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDelete(fy._id)} className="p-2 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-500 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-black text-slate-900 leading-tight">{fy.name}</h3>
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200/50">
                                {fy.code}
                            </span>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-slate-500">
                                <Clock size={14} />
                                <span className="text-xs font-bold">
                                    {new Date(fy.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} -
                                    {new Date(fy.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-400">
                                <Globe size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest tracking-tighter">
                                    {fy.company?.name || 'Nexus Global Systems'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-black text-slate-900">
                                    {editingFY ? 'Edit FY' : 'New Financial Year'}
                                </h3>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-xl text-slate-400">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">FY Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all font-bold text-sm"
                                        placeholder="e.g. FY 2024-25"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">FY Code</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all font-bold text-sm"
                                        placeholder="e.g. FY24"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all font-bold text-sm"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all font-bold text-sm"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 rounded-lg border-2 border-slate-300 text-primary focus:ring-primary/20"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                />
                                <span className="text-sm font-bold text-slate-700 group-hover:text-primary transition-colors">Set as Active Period</span>
                            </label>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-primary text-white rounded-[20px] font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary-hover hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3"
                            >
                                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                                {editingFY ? 'Update Period' : 'Initialize FY'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinancialYearManagement;
