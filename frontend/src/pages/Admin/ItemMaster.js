import React, { useState, useEffect } from 'react';
import { getItemsAPI, createItemAPI, updateItemAPI, deleteItemAPI } from '../../api/itemMaster';
import {
    Package,
    Plus,
    X,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Edit2,
    Trash2,
    Search,
    Tag,
    Layers,
    BarChart2,
    Hash,
    Scale,
    ChevronDown,
} from 'lucide-react';

const UOM_OPTIONS = ['PCS', 'KG', 'LTR', 'MTR', 'BOX', 'SET', 'TON', 'NOS', 'BAG', 'ROLL', 'PAIR'];
const CATEGORY_OPTIONS = ['Raw Material', 'Finished Goods', 'Semi-Finished', 'Consumables', 'Packing Material', 'Spare Parts', 'Services'];
const GST_RATES = [0, 5, 12, 18, 28];

const EMPTY_FORM = {
    itemCode: '',
    itemName: '',
    description: '',
    category: '',
    subCategory: '',
    uom: '',
    hsn: '',
    gstRate: 18,
    standardRate: '',
    minOrderQty: 1,
    leadTimeDays: 0,
};

const ItemMaster = () => {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState(EMPTY_FORM);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setIsLoading(true);
        try {
            const data = await getItemsAPI();
            setItems(data);
        } catch (error) {
            console.error('Error fetching items:', error);
            setMessage({ type: 'error', text: 'Failed to load items.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                itemCode: item.itemCode || '',
                itemName: item.itemName || '',
                description: item.description || '',
                category: item.category || '',
                subCategory: item.subCategory || '',
                uom: item.uom || '',
                hsn: item.hsn || '',
                gstRate: item.gstRate ?? 18,
                standardRate: item.standardRate || '',
                minOrderQty: item.minOrderQty || 1,
                leadTimeDays: item.leadTimeDays || 0,
            });
        } else {
            setEditingItem(null);
            setFormData(EMPTY_FORM);
        }
        setErrors({});
        setShowModal(true);
    };

    const validateField = (field, value) => {
        let error = '';
        if (field === 'itemCode' && !value.trim()) error = 'Item Code is required';
        if (field === 'itemName' && !value.trim()) error = 'Item Name is required';
        if (field === 'category' && !value) error = 'Category is required';
        if (field === 'uom' && !value) error = 'UOM is required';
        if (field === 'standardRate' && value !== '' && isNaN(Number(value))) error = 'Must be a number';
        setErrors(prev => ({ ...prev, [field]: error }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.itemCode.trim()) newErrors.itemCode = 'Item Code is required';
        if (!formData.itemName.trim()) newErrors.itemName = 'Item Name is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.uom) newErrors.uom = 'Unit of Measure is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0 ? null : 'Please correct the highlighted errors';
    };

    const handleSubmit = async (e) => {
        e && e.preventDefault();
        const error = validateForm();
        if (error) {
            setMessage({ type: 'error', text: error });
            return;
        }
        setIsSubmitting(true);
        setMessage({ type: '', text: '' });
        try {
            const payload = {
                ...formData,
                standardRate: Number(formData.standardRate) || 0,
                minOrderQty: Number(formData.minOrderQty) || 1,
                leadTimeDays: Number(formData.leadTimeDays) || 0,
                gstRate: Number(formData.gstRate) || 0,
            };
            if (editingItem) {
                await updateItemAPI(editingItem._id, payload);
                setMessage({ type: 'success', text: 'Item updated successfully!' });
            } else {
                await createItemAPI(payload);
                setMessage({ type: 'success', text: 'Item created successfully!' });
            }
            setShowModal(false);
            fetchItems();
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to save item.';
            setMessage({ type: 'error', text: msg });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        try {
            await deleteItemAPI(id);
            setMessage({ type: 'success', text: 'Item deleted successfully!' });
            fetchItems();
        } catch {
            setMessage({ type: 'error', text: 'Failed to delete item.' });
        }
    };

    const filteredItems = items.filter(item => {
        const matchSearch =
            item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.hsn && item.hsn.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchCategory = !filterCategory || item.category === filterCategory;
        return matchSearch && matchCategory;
    });

    const categoryColors = {
        'Raw Material': 'bg-blue-50 text-blue-700',
        'Finished Goods': 'bg-emerald-50 text-emerald-700',
        'Semi-Finished': 'bg-teal-50 text-teal-700',
        'Consumables': 'bg-amber-50 text-amber-700',
        'Packing Material': 'bg-purple-50 text-purple-700',
        'Spare Parts': 'bg-rose-50 text-rose-700',
        'Services': 'bg-indigo-50 text-indigo-700',
    };

    const inputClass = (hasError) =>
        `w-full px-5 py-3.5 bg-slate-50 border-2 rounded-2xl outline-none focus:border-primary/30 focus:bg-white transition-all font-semibold text-sm ${hasError ? 'border-red-200' : 'border-slate-100'}`;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Item Master</h1>
                    <p className="text-slate-500 text-sm font-medium">Manage your product and material catalogue.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    id="add-item-btn"
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 active:scale-95"
                >
                    <Plus size={18} />
                    Add Item
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative group flex-1 max-w-md">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        id="item-search"
                        placeholder="Search by name, code or HSN..."
                        className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 transition-all font-medium text-sm shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <select
                        id="category-filter"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="appearance-none pl-4 pr-10 py-3 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 font-semibold text-sm text-slate-600 shadow-sm cursor-pointer"
                    >
                        <option value="">All Categories</option>
                        {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
            </div>

            {/* Notification */}
            {message.text && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top duration-300 ${message.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <p className="text-sm font-bold flex-1">{message.text}</p>
                    <button onClick={() => setMessage({ type: '', text: '' })} className="font-black text-lg leading-none">×</button>
                </div>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Items', value: items.length, icon: Package, color: 'text-blue-600 bg-blue-50' },
                    { label: 'Active', value: items.filter(i => i.isActive !== false).length, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
                    { label: 'Categories', value: [...new Set(items.map(i => i.category))].length, icon: Layers, color: 'text-purple-600 bg-purple-50' },
                    { label: 'Showing', value: filteredItems.length, icon: Search, color: 'text-amber-600 bg-amber-50' },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${color}`}><Icon size={18} /></div>
                        <div>
                            <p className="text-xl font-black text-slate-900">{value}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">UOM / HSN</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">GST / Rate</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center">
                                        <Package size={40} className="mx-auto text-slate-200 mb-3" />
                                        <p className="text-slate-400 font-bold text-sm">No items found</p>
                                        <p className="text-slate-300 text-xs mt-1">Try adjusting your search or add a new item</p>
                                    </td>
                                </tr>
                            ) : filteredItems.map((item) => (
                                <tr key={item._id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center shrink-0">
                                                <Package size={18} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{item.itemName}</p>
                                                <p className="text-[10px] font-mono text-slate-400">{item.itemCode}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${categoryColors[item.category] || 'bg-slate-100 text-slate-600'}`}>
                                            {item.category}
                                        </span>
                                        {item.subCategory && <p className="text-[10px] text-slate-400 mt-1">{item.subCategory}</p>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5">
                                                <Scale size={11} className="text-slate-400" />
                                                <span className="text-xs font-bold text-slate-700">{item.uom}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Hash size={11} className="text-slate-400" />
                                                <span className="text-[10px] font-mono text-slate-500">{item.hsn || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5">
                                                <Tag size={11} className="text-slate-400" />
                                                <span className="text-xs font-bold text-slate-700">{item.gstRate}% GST</span>
                                            </div>
                                            <p className="text-xs font-bold text-emerald-600">
                                                ₹{Number(item.standardRate || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleOpenModal(item)}
                                                className="p-2 hover:bg-primary/10 text-slate-400 hover:text-primary rounded-xl transition-all"
                                                title="Edit Item"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item._id)}
                                                className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all"
                                                title="Delete Item"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative w-full max-w-4xl bg-white rounded-[40px] shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">

                        {/* Modal Header */}
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                                    {editingItem ? 'Edit Item' : 'Add New Item'}
                                </h3>
                                <p className="text-sm text-slate-500 font-medium">
                                    {editingItem ? 'Update item master details.' : 'Register a new product or material.'}
                                </p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-3 hover:bg-white rounded-2xl transition-colors text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

                                {/* LEFT: Identity & Classification */}
                                <div className="space-y-5">
                                    <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                                        <div className="p-2 bg-primary/10 text-primary rounded-xl"><Package size={20} /></div>
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Identity & Classification</h4>
                                    </div>

                                    {/* Item Code */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center ml-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Item Code *</label>
                                            {errors.itemCode && <span className="text-[9px] font-bold text-red-500 uppercase animate-pulse">{errors.itemCode}</span>}
                                        </div>
                                        <input
                                            type="text"
                                            id="item-code"
                                            className={inputClass(errors.itemCode)}
                                            placeholder="e.g. RAW-001"
                                            value={formData.itemCode}
                                            onChange={(e) => { setFormData({ ...formData, itemCode: e.target.value.toUpperCase() }); if (errors.itemCode) setErrors(p => ({ ...p, itemCode: '' })); }}
                                            onBlur={(e) => validateField('itemCode', e.target.value)}
                                        />
                                    </div>

                                    {/* Item Name */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center ml-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Item Name *</label>
                                            {errors.itemName && <span className="text-[9px] font-bold text-red-500 uppercase animate-pulse">{errors.itemName}</span>}
                                        </div>
                                        <input
                                            type="text"
                                            id="item-name"
                                            className={inputClass(errors.itemName)}
                                            placeholder="e.g. High Tensile Steel Rod"
                                            value={formData.itemName}
                                            onChange={(e) => { setFormData({ ...formData, itemName: e.target.value }); if (errors.itemName) setErrors(p => ({ ...p, itemName: '' })); }}
                                            onBlur={(e) => validateField('itemName', e.target.value)}
                                        />
                                    </div>

                                    {/* Category */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center ml-1">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category *</label>
                                                {errors.category && <span className="text-[9px] font-bold text-red-500 uppercase animate-pulse">{errors.category}</span>}
                                            </div>
                                            <div className="relative">
                                                <select
                                                    id="item-category"
                                                    className={`appearance-none ${inputClass(errors.category)} pr-10 cursor-pointer`}
                                                    value={formData.category}
                                                    onChange={(e) => { setFormData({ ...formData, category: e.target.value }); if (errors.category) setErrors(p => ({ ...p, category: '' })); }}
                                                    onBlur={(e) => validateField('category', e.target.value)}
                                                >
                                                    <option value="">Select...</option>
                                                    {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                                <ChevronDown size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sub-Category</label>
                                            <input
                                                type="text"
                                                className={inputClass(false)}
                                                placeholder="e.g. Steel"
                                                value={formData.subCategory}
                                                onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                                        <textarea
                                            rows={3}
                                            className={inputClass(false)}
                                            placeholder="Brief description of the item..."
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* RIGHT: Commercial & Logistics */}
                                <div className="space-y-5">
                                    <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><BarChart2 size={20} /></div>
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Commercial & Logistics</h4>
                                    </div>

                                    {/* UOM + HSN */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center ml-1">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit of Measure *</label>
                                                {errors.uom && <span className="text-[9px] font-bold text-red-500 uppercase animate-pulse">{errors.uom}</span>}
                                            </div>
                                            <div className="relative">
                                                <select
                                                    id="item-uom"
                                                    className={`appearance-none ${inputClass(errors.uom)} pr-10 cursor-pointer`}
                                                    value={formData.uom}
                                                    onChange={(e) => { setFormData({ ...formData, uom: e.target.value }); if (errors.uom) setErrors(p => ({ ...p, uom: '' })); }}
                                                    onBlur={(e) => validateField('uom', e.target.value)}
                                                >
                                                    <option value="">Select...</option>
                                                    {UOM_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                                                </select>
                                                <ChevronDown size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">HSN / SAC Code</label>
                                            <input
                                                type="text"
                                                id="item-hsn"
                                                className={inputClass(false)}
                                                placeholder="e.g. 7213"
                                                value={formData.hsn}
                                                onChange={(e) => setFormData({ ...formData, hsn: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* GST Rate + Standard Rate */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">GST Rate (%)</label>
                                            <div className="relative">
                                                <select
                                                    id="item-gst"
                                                    className="appearance-none w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/30 focus:bg-white transition-all font-semibold text-sm pr-10 cursor-pointer"
                                                    value={formData.gstRate}
                                                    onChange={(e) => setFormData({ ...formData, gstRate: Number(e.target.value) })}
                                                >
                                                    {GST_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
                                                </select>
                                                <ChevronDown size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Standard Rate (₹)</label>
                                            <input
                                                type="number"
                                                id="item-rate"
                                                min="0"
                                                step="0.01"
                                                className={inputClass(errors.standardRate)}
                                                placeholder="0.00"
                                                value={formData.standardRate}
                                                onChange={(e) => { setFormData({ ...formData, standardRate: e.target.value }); if (errors.standardRate) setErrors(p => ({ ...p, standardRate: '' })); }}
                                                onBlur={(e) => validateField('standardRate', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Min Order Qty + Lead Time */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Min. Order Qty</label>
                                            <input
                                                type="number"
                                                min="1"
                                                className={inputClass(false)}
                                                placeholder="1"
                                                value={formData.minOrderQty}
                                                onChange={(e) => setFormData({ ...formData, minOrderQty: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lead Time (Days)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                className={inputClass(false)}
                                                placeholder="0"
                                                value={formData.leadTimeDays}
                                                onChange={(e) => setFormData({ ...formData, leadTimeDays: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Info Box */}
                                    <div className="mt-4 p-5 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[28px]">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Tip</p>
                                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed text-center">
                                            HSN codes are required for GST compliance. The standard rate is used as a reference price during Purchase Requisitions and PO generation.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4 shrink-0">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-4 text-sm font-black uppercase text-slate-400 tracking-widest hover:text-slate-600 transition-colors"
                            >
                                Discard
                            </button>
                            <button
                                type="button"
                                id="save-item-btn"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex-[2] py-4 bg-primary text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                                {editingItem ? 'Save Changes' : 'Create Item'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ItemMaster;
