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
    Search
} from 'lucide-react';

const SupplierManagement = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        name: '',
        gstin: '',
        pan: '',
        contact: {
            person: '',
            email: '',
            phone: '',
            address: ''
        },
        bank_details: {
            bankName: '',
            accountNumber: '',
            ifscCode: '',
            branch: ''
        }
    });

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
                name: supplier.name,
                gstin: supplier.gstin || '',
                pan: supplier.pan || '',
                contact: {
                    person: supplier.contact?.person || '',
                    email: supplier.contact?.email || '',
                    phone: supplier.contact?.phone || '',
                    address: supplier.contact?.address || ''
                },
                bank_details: {
                    bankName: supplier.bank_details?.bankName || '',
                    accountNumber: supplier.bank_details?.accountNumber || '',
                    ifscCode: supplier.bank_details?.ifscCode || '',
                    branch: supplier.bank_details?.branch || ''
                }
            });
        } else {
            setEditingSupplier(null);
            setFormData({
                name: '',
                gstin: '',
                pan: '',
                contact: { person: '', email: '', phone: '', address: '' },
                bank_details: { bankName: '', accountNumber: '', ifscCode: '', branch: '' }
            });
        }
        setErrors({});
        setShowModal(true);
    };

    const validateField = (field, value, group = null) => {
        let error = '';
        if (field === 'name' && !value.trim()) error = "Name is required";
        if (field === 'gstin' && value && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value)) error = "Invalid GSTIN";
        if (field === 'pan' && value && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) error = "Invalid PAN";
        if (field === 'email' && value && !/\S+@\S+\.\S+/.test(value)) error = "Invalid Email";
        if (field === 'ifscCode' && value && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value)) error = "Invalid IFSC";

        const key = group ? `${group}.${field}` : field;
        setErrors(prev => ({ ...prev, [key]: error }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Supplier Name is required";
        if (formData.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstin)) newErrors.gstin = "Invalid GSTIN format";
        if (formData.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan)) newErrors.pan = "Invalid PAN format";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0 ? null : "Please correct frontend errors";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
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
        s.gstin?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
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
                    placeholder="Search by name or GSTIN..."
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
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Supplier</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tax Identity</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
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
                                                <p className="text-[10px] text-slate-500 font-mono">{supplier._id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-slate-400 uppercase w-10 text-right">GST:</span>
                                                <span className="text-xs font-bold text-slate-700 font-mono tracking-tight">{supplier.gstin || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-slate-400 uppercase w-10 text-right">PAN:</span>
                                                <span className="text-xs font-bold text-slate-700 font-mono tracking-tight">{supplier.pan || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1 text-xs font-medium text-slate-600">
                                            <p className="flex items-center gap-2"><Mail size={12} className="text-slate-400" /> {supplier.contact?.email || 'N/A'}</p>
                                            <p className="flex items-center gap-2"><Phone size={12} className="text-slate-400" /> {supplier.contact?.phone || 'N/A'}</p>
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
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative w-full max-w-4xl bg-white rounded-[40px] shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
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

                        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {/* Basic Info */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                                        <div className="p-2 bg-primary/10 text-primary rounded-xl"><Building2 size={20} /></div>
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Identity & Tax</h4>
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center ml-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Company Name</label>
                                            {errors.name && <span className="text-[9px] font-bold text-red-500 uppercase animate-pulse">{errors.name}</span>}
                                        </div>
                                        <input
                                            type="text" required
                                            className={`w-full px-5 py-3.5 bg-slate-50 border-2 rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all font-bold text-sm ${errors.name ? 'border-red-200' : 'border-slate-100'}`}
                                            placeholder="e.g. Global Logistics Pvt Ltd"
                                            value={formData.name}
                                            onChange={(e) => {
                                                setFormData({ ...formData, name: e.target.value });
                                                if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                                            }}
                                            onBlur={(e) => validateField('name', e.target.value)}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center ml-1">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">GSTIN</label>
                                                {errors.gstin && <span className="text-[9px] font-bold text-red-500 uppercase animate-pulse">{errors.gstin}</span>}
                                            </div>
                                            <input
                                                type="text" maxLength={15}
                                                className={`w-full px-5 py-3.5 bg-slate-50 border-2 rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all font-bold text-sm uppercase ${errors.gstin ? 'border-red-200' : 'border-slate-100'}`}
                                                placeholder="22AAAAA0000A1Z5"
                                                value={formData.gstin}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, gstin: e.target.value.toUpperCase() });
                                                    if (errors.gstin) setErrors(prev => ({ ...prev, gstin: '' }));
                                                }}
                                                onBlur={(e) => validateField('gstin', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center ml-1">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PAN Number</label>
                                                {errors.pan && <span className="text-[9px] font-bold text-red-500 uppercase animate-pulse">{errors.pan}</span>}
                                            </div>
                                            <input
                                                type="text" maxLength={10}
                                                className={`w-full px-5 py-3.5 bg-slate-50 border-2 rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all font-bold text-sm uppercase ${errors.pan ? 'border-red-200' : 'border-slate-100'}`}
                                                placeholder="ABCDE1234F"
                                                value={formData.pan}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, pan: e.target.value.toUpperCase() });
                                                    if (errors.pan) setErrors(prev => ({ ...prev, pan: '' }));
                                                }}
                                                onBlur={(e) => validateField('pan', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-6 pt-6">
                                        <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Hash size={20} /></div>
                                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Connect Points</h4>
                                        </div>
                                        <div className="space-y-4">
                                            <input
                                                type="text" placeholder="Contact Person"
                                                className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 text-sm font-bold"
                                                value={formData.contact.person}
                                                onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, person: e.target.value } })}
                                            />
                                            <input
                                                type="email" placeholder="Email Address"
                                                className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 text-sm font-bold"
                                                value={formData.contact.email}
                                                onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, email: e.target.value } })}
                                            />
                                            <input
                                                type="text" placeholder="Phone Number"
                                                className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 text-sm font-bold"
                                                value={formData.contact.phone}
                                                onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, phone: e.target.value } })}
                                            />
                                            <textarea
                                                placeholder="Business Address" rows={3}
                                                className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 text-sm font-bold"
                                                value={formData.contact.address}
                                                onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, address: e.target.value } })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Bank Info */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><CreditCard size={20} /></div>
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Financial / Payouts</h4>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bank Name</label>
                                            <input
                                                type="text"
                                                className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 text-sm font-bold"
                                                placeholder="e.g. HDFC Bank"
                                                value={formData.bank_details.bankName}
                                                onChange={(e) => setFormData({ ...formData, bank_details: { ...formData.bank_details, bankName: e.target.value } })}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Number</label>
                                            <input
                                                type="text"
                                                className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 text-sm font-bold font-mono tracking-widest"
                                                placeholder="0000 0000 0000"
                                                value={formData.bank_details.accountNumber}
                                                onChange={(e) => setFormData({ ...formData, bank_details: { ...formData.bank_details, accountNumber: e.target.value } })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">IFSC Code</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 text-sm font-bold uppercase font-mono"
                                                    placeholder="HDFC0001234"
                                                    value={formData.bank_details.ifscCode}
                                                    onChange={(e) => setFormData({ ...formData, bank_details: { ...formData.bank_details, ifscCode: e.target.value.toUpperCase() } })}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Branch</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 text-sm font-bold"
                                                    placeholder="Downtown Branch"
                                                    value={formData.bank_details.branch}
                                                    onChange={(e) => setFormData({ ...formData, bank_details: { ...formData.bank_details, branch: e.target.value } })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-10 p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px]">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Data Integrity Notice</p>
                                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed text-center">
                                            Verification of GSTIN and PAN is mandatory for tax compliance. Ensure all bank details match the official vendor passbook to avoid payment processing delays.
                                        </p>
                                    </div>
                                </div>
                            </div>
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
