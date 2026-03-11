import React, { useState, useEffect } from 'react';
import { getDepartmentsAPI, createDepartmentAPI, updateDepartmentAPI, deleteDepartmentAPI } from '../../api/org';
import {
    Building2,
    Plus,
    X,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Hash,
    Target,
    Edit2,
    Trash2
} from 'lucide-react';

const DepartmentManagement = () => {
    const [departments, setDepartments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingDept, setEditingDept] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        budgetLimit: 0
    });

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const data = await getDepartmentsAPI();
            setDepartments(data);
        } catch (error) {
            console.error('Error fetching departments:', error);
            setMessage({ type: 'error', text: 'Failed to load departments.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (dept = null) => {
        if (dept) {
            setEditingDept(dept);
            setFormData({
                name: dept.name,
                code: dept.code,
                budgetLimit: dept.budgetLimit || 0
            });
        } else {
            setEditingDept(null);
            setFormData({ name: '', code: '', budgetLimit: 0 });
        }
        setShowModal(true);
    };

    const validateForm = () => {
        if (!formData.name.trim()) return "Department Name is required";
        if (!formData.code.trim()) return "Department Code is required";
        if (formData.budgetLimit < 0) return "Budget Limit cannot be negative";
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationError = validateForm();
        if (validationError) {
            setMessage({ type: 'error', text: validationError });
            return;
        }

        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            if (editingDept) {
                await updateDepartmentAPI(editingDept._id, formData);
                setMessage({ type: 'success', text: 'Department updated successfully!' });
            } else {
                await createDepartmentAPI(formData);
                setMessage({ type: 'success', text: 'Department created successfully!' });
            }
            setShowModal(false);
            fetchDepartments();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to process department.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this department?')) return;
        try {
            await deleteDepartmentAPI(id);
            setMessage({ type: 'success', text: 'Department deleted successfully!' });
            fetchDepartments();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to delete department.' });
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
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 px-0 sm:px-2 min-w-0">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Organization Units</h1>
                    <p className="text-slate-500 text-sm font-medium">Manage departments and their budgetary controls.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 active:scale-95"
                >
                    <Plus size={18} />
                    New Department
                </button>
            </div>

            {message.text && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top duration-300 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <p className="text-sm font-bold">{message.text}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {departments.map((dept) => (
                    <div key={dept._id} className="bg-white p-6 rounded-[32px] border border-slate-200/60 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />

                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <Building2 size={24} />
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleOpenModal(dept)} className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors">
                                    <Edit2 size={14} />
                                </button>
                                <button onClick={() => handleDelete(dept._id)} className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-lg font-black text-slate-900 mb-4 truncate relative z-10">{dept.name}</h3>

                        <div className="space-y-3 relative z-10">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400 font-bold uppercase tracking-wider">Annual Budget</span>
                                <span className="text-slate-900 font-black">₹{dept.budgetLimit?.toLocaleString()}</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                                <div className="h-full bg-primary/20 w-1/4 rounded-full" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create/Edit Dept Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                                    {editingDept ? 'Edit Department' : 'Add Department'}
                                </h3>
                                <p className="text-xs text-slate-500 font-medium">Register a new business unit and set controls.</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department Name</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                        <Target size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-600/20 focus:bg-white transition-all font-medium text-sm"
                                        placeholder="e.g. Information Technology"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dept Code</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                        <Hash size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        maxLength={10}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-600/20 focus:bg-white transition-all font-medium text-sm uppercase"
                                        placeholder="e.g. IT"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Budget Limit (₹)</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                        <span className="font-bold text-sm">₹</span>
                                    </div>
                                    <input
                                        type="number"
                                        required
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-600/20 focus:bg-white transition-all font-medium text-sm"
                                        placeholder="0.00"
                                        value={formData.budgetLimit}
                                        onChange={(e) => setFormData({ ...formData, budgetLimit: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full mt-4 py-4 bg-indigo-600 text-white rounded-[20px] font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:translate-y-0"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Building2 size={18} />
                                        {editingDept ? 'Update Details' : 'Establish Department'}
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DepartmentManagement;
