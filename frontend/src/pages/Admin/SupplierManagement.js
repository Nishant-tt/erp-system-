import React, { useState, useEffect } from 'react';
import { getSuppliersAPI, createSupplierAPI, updateSupplierAPI, deleteSupplierAPI } from '../../api/supplier';
import {
    Truck,
    Plus,
    X,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Edit2,
    Trash2,
    Building2,
    Mail,
    Phone,
    MapPin,
    CreditCard,
    Hash,
    Search,
    Globe,
    Landmark
} from 'lucide-react';

const emptyForm = {
    name: '',
    tagline: '',
    address: { street: '', city: '', state: '', zipCode: '', country: 'India' },
    contact: { email: '', phone: '', website: '' },
    taxInfo: { gstin: '', pan: '', cin: '' },
    bankDetails: { bankName: '', accountNumber: '', ifscCode: '', branch: '' }
};

const SupplierManagement = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [errors, setErrors] = useState({});
    const [activeTab, setActiveTab] = useState('general');

    const [formData, setFormData] = useState({ ...emptyForm });

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            const data = await getSuppliersAPI();
            setSuppliers(data);
        } catch (error) {
            console.error('Error fetching suppliers:', error);
            setMessage({ type: 'error', text: 'Failed to load suppliers.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (supplier = null) => {
        if (supplier) {
            setEditingSupplier(supplier);
            setFormData({
                name: supplier.name || '',
                tagline: supplier.tagline || '',
                address: {
                    street: supplier.address?.street || '',
                    city: supplier.address?.city || '',
                    state: supplier.address?.state || '',
                    zipCode: supplier.address?.zipCode || '',
                    country: supplier.address?.country || 'India'
                },
                contact: {
                    email: supplier.contact?.email || '',
                    phone: supplier.contact?.phone || '',
                    website: supplier.contact?.website || ''
                },
                taxInfo: {
                    gstin: supplier.taxInfo?.gstin || '',
                    pan: supplier.taxInfo?.pan || '',
                    cin: supplier.taxInfo?.cin || ''
                },
                bankDetails: {
                    bankName: supplier.bankDetails?.bankName || '',
                    accountNumber: supplier.bankDetails?.accountNumber || '',
                    ifscCode: supplier.bankDetails?.ifscCode || '',
                    branch: supplier.bankDetails?.branch || ''
                }
            });
        } else {
            setEditingSupplier(null);
            setFormData({ ...emptyForm, address: { ...emptyForm.address }, contact: { ...emptyForm.contact }, taxInfo: { ...emptyForm.taxInfo }, bankDetails: { ...emptyForm.bankDetails } });
        }
        setErrors({});
        setActiveTab('general');
        setShowModal(true);
    };

    const handleChange = (e, section = null) => {
        const { name, value } = e.target;
        if (section) {
            setFormData(prev => ({
                ...prev,
                [section]: { ...prev[section], [name]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Supplier Name is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0 ? null : "Please correct the errors";
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();
        const error = validateForm();
        if (error) {
            setMessage({ type: 'error', text: error });
            return;
        }

        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            if (editingSupplier) {
                await updateSupplierAPI(editingSupplier._id, formData);
                setMessage({ type: 'success', text: 'Supplier updated successfully!' });
            } else {
                await createSupplierAPI(formData);
                setMessage({ type: 'success', text: 'Supplier created successfully!' });
            }
            setShowModal(false);
            fetchSuppliers();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to process supplier.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this supplier?')) return;
        try {
            await deleteSupplierAPI(id);
            setMessage({ type: 'success', text: 'Supplier deleted successfully!' });
            fetchSuppliers();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to delete supplier.' });
        }
    };

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.taxInfo?.gstin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.contact?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const tabs = [
        { id: 'general', label: 'General Info', icon: Building2 },
        { id: 'address', label: 'Address', icon: MapPin },
        { id: 'tax', label: 'Tax & IDs', icon: Hash },
        { id: 'bank', label: 'Bank Details', icon: Landmark }
    ];

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
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Supplier Master</h1>
                    <p className="text-slate-500 text-sm font-medium">Manage your vendor directory and payment credentials.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 active:scale-95"
                >
                    <Plus size={18} />
                    Add Supplier
                </button>
            </div>

            <div className="relative group max-w-md">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                    <Search size={18} />
                </div>
                <input
                    type="text"
                    placeholder="Search by name, GSTIN, or email..."
                    className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 transition-all font-medium text-sm shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {message.text && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top duration-300 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <p className="text-sm font-bold">{message.text}</p>
                    <button onClick={() => setMessage({ type: '', text: '' })} className="ml-auto font-black text-lg">×</button>
                </div>
            )}

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="table-responsive custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Supplier</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tax Identity</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredSuppliers.map((supplier) => (
                                <tr key={supplier._id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center font-bold shrink-0">
                                                <Truck size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{supplier.name}</p>
                                                {supplier.tagline && <p className="text-[10px] text-slate-400 font-medium">{supplier.tagline}</p>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-slate-400 uppercase w-10 text-right">GST:</span>
                                                <span className="text-xs font-bold text-slate-700 font-mono tracking-tight">{supplier.taxInfo?.gstin || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-slate-400 uppercase w-10 text-right">PAN:</span>
                                                <span className="text-xs font-bold text-slate-700 font-mono tracking-tight">{supplier.taxInfo?.pan || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1 text-xs font-medium text-slate-600">
                                            <p className="flex items-center gap-2"><Mail size={12} className="text-slate-400" /> {supplier.contact?.email || 'N/A'}</p>
                                            <p className="flex items-center gap-2"><Phone size={12} className="text-slate-400" /> {supplier.contact?.phone || 'N/A'}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs font-medium text-slate-600">
                                            <p className="flex items-center gap-2"><MapPin size={12} className="text-slate-400" /> {supplier.address?.city || 'N/A'}, {supplier.address?.state || ''}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleOpenModal(supplier)}
                                                className="p-2 hover:bg-primary/10 text-slate-400 hover:text-primary rounded-xl transition-all"
                                                title="Edit Supplier"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(supplier._id)}
                                                className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all"
                                                title="Delete Supplier"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredSuppliers.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-16 text-center">
                                        <Truck size={40} className="text-slate-200 mx-auto mb-3" />
                                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No suppliers found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative w-full max-w-3xl bg-white rounded-[40px] shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                                    {editingSupplier ? 'Edit Supplier' : 'Register New Vendor'}
                                </h3>
                                <p className="text-sm text-slate-500 font-medium">Complete procurement onboarding details.</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-3 hover:bg-white rounded-2xl transition-colors text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex border-b border-slate-100 px-8 pt-2 bg-slate-50/30">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === tab.id
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    <tab.icon size={14} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar flex-1">
                            {activeTab === 'general' && (
                                <div className="space-y-6 animate-in fade-in duration-200">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center ml-1">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Supplier Name</label>
                                                {errors.name && <span className="text-[9px] font-bold text-red-500 uppercase animate-pulse">{errors.name}</span>}
                                            </div>
                                            <input
                                                type="text" name="name" required
                                                className={`w-full px-5 py-3.5 bg-slate-50 border-2 rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all font-bold text-sm ${errors.name ? 'border-red-200' : 'border-slate-100'}`}
                                                placeholder="Enter supplier name"
                                                value={formData.name}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tagline</label>
                                            <input
                                                type="text" name="tagline"
                                                className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all font-bold text-sm"
                                                placeholder="Company's slogan"
                                                value={formData.tagline}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                            <div className="relative group">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
                                                <input
                                                    type="email" name="email"
                                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all font-bold text-sm"
                                                    placeholder="contact@vendor.com"
                                                    value={formData.contact.email}
                                                    onChange={(e) => handleChange(e, 'contact')}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                            <div className="relative group">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
                                                <input
                                                    type="text" name="phone"
                                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all font-bold text-sm"
                                                    placeholder="+91 0000 000000"
                                                    value={formData.contact.phone}
                                                    onChange={(e) => handleChange(e, 'contact')}
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2 space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Website URL</label>
                                            <div className="relative group">
                                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
                                                <input
                                                    type="text" name="website"
                                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all font-bold text-sm"
                                                    placeholder="https://www.vendor.com"
                                                    value={formData.contact.website}
                                                    onChange={(e) => handleChange(e, 'contact')}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'address' && (
                                <div className="space-y-6 animate-in fade-in duration-200">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Street Address</label>
                                        <input type="text" name="street"
                                            className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all font-bold text-sm"
                                            placeholder="House/Office No., Street name"
                                            value={formData.address.street}
                                            onChange={(e) => handleChange(e, 'address')}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">City</label>
                                            <input type="text" name="city"
                                                className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all font-bold text-sm"
                                                placeholder="Mumbai"
                                                value={formData.address.city}
                                                onChange={(e) => handleChange(e, 'address')}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">State / Province</label>
                                            <input type="text" name="state"
                                                className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all font-bold text-sm"
                                                placeholder="Maharashtra"
                                                value={formData.address.state}
                                                onChange={(e) => handleChange(e, 'address')}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Zip / Postal Code</label>
                                            <input type="text" name="zipCode"
                                                className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all font-bold text-sm"
                                                placeholder="400001"
                                                value={formData.address.zipCode}
                                                onChange={(e) => handleChange(e, 'address')}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Country</label>
                                            <input type="text" name="country"
                                                className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all font-bold text-sm"
                                                placeholder="India"
                                                value={formData.address.country}
                                                onChange={(e) => handleChange(e, 'address')}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'tax' && (
                                <div className="space-y-6 animate-in fade-in duration-200">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">GSTIN</label>
                                            <input type="text" name="gstin"
                                                className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all font-bold text-sm font-mono uppercase"
                                                placeholder="27AAACN1234A1Z1"
                                                value={formData.taxInfo.gstin}
                                                onChange={(e) => handleChange({ target: { name: 'gstin', value: e.target.value.toUpperCase() } }, 'taxInfo')}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">PAN Number</label>
                                            <input type="text" name="pan"
                                                className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all font-bold text-sm font-mono uppercase"
                                                placeholder="AAACN1234A"
                                                value={formData.taxInfo.pan}
                                                onChange={(e) => handleChange({ target: { name: 'pan', value: e.target.value.toUpperCase() } }, 'taxInfo')}
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CIN (Company Identification Number)</label>
                                            <input type="text" name="cin"
                                                className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all font-bold text-sm font-mono uppercase"
                                                placeholder="L12345MH2023PLC123456"
                                                value={formData.taxInfo.cin}
                                                onChange={(e) => handleChange({ target: { name: 'cin', value: e.target.value.toUpperCase() } }, 'taxInfo')}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'bank' && (
                                <div className="space-y-6 animate-in fade-in duration-200">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bank Name</label>
                                            <input type="text" name="bankName"
                                                className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all font-bold text-sm"
                                                placeholder="HDFC Bank"
                                                value={formData.bankDetails.bankName}
                                                onChange={(e) => handleChange(e, 'bankDetails')}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Number</label>
                                            <div className="relative group">
                                                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
                                                <input type="text" name="accountNumber"
                                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all font-bold text-sm font-mono"
                                                    placeholder="50100123456789"
                                                    value={formData.bankDetails.accountNumber}
                                                    onChange={(e) => handleChange(e, 'bankDetails')}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">IFSC Code</label>
                                            <input type="text" name="ifscCode"
                                                className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all font-bold text-sm font-mono uppercase"
                                                placeholder="HDFC0000001"
                                                value={formData.bankDetails.ifscCode}
                                                onChange={(e) => handleChange({ target: { name: 'ifscCode', value: e.target.value.toUpperCase() } }, 'bankDetails')}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Branch Name</label>
                                            <input type="text" name="branch"
                                                className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all font-bold text-sm"
                                                placeholder="Main Branch, Mumbai"
                                                value={formData.bankDetails.branch}
                                                onChange={(e) => handleChange(e, 'bankDetails')}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </form>

                        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-4 text-sm font-black uppercase text-slate-400 tracking-widest hover:text-slate-600 transition-colors"
                            >
                                Discard
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex-[2] py-4 bg-primary text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                                {editingSupplier ? 'Save Changes' : 'Onboard Supplier'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupplierManagement;
