import React, { useState, useEffect } from 'react';
import { getCompanyAPI, updateCompanyAPI } from '../../api/company';
import {
    Building2,
    Globe,
    Mail,
    Phone,
    MapPin,
    Hash,
    CreditCard,
    Landmark,
    Save,
    Loader2,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';

const CompanySettings = () => {
    const [company, setCompany] = useState({
        name: '',
        tagline: '',
        address: { street: '', city: '', state: '', zipCode: '', country: 'India' },
        contact: { email: '', phone: '', website: '' },
        taxInfo: { gstin: '', pan: '', cin: '' },
        bankDetails: { bankName: '', accountNumber: '', ifscCode: '', branch: '' }
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [activeTab, setActiveTab] = useState('general');

    useEffect(() => {
        fetchCompany();
    }, []);

    const fetchCompany = async () => {
        try {
            const data = await getCompanyAPI();
            if (data) setCompany(data);
        } catch (error) {
            console.error('Error fetching company:', error);
            setMessage({ type: 'error', text: 'Failed to load company details.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e, section = null) => {
        const { name, value } = e.target;
        if (section) {
            setCompany(prev => ({
                ...prev,
                [section]: { ...prev[section], [name]: value }
            }));
        } else {
            setCompany(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ type: '', text: '' });

        try {
            await updateCompanyAPI(company);
            setMessage({ type: 'success', text: 'Company settings updated successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update company settings.' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    const tabs = [
        { id: 'general', label: 'General Info', icon: Building2 },
        { id: 'address', label: 'Address', icon: MapPin },
        { id: 'tax', label: 'Tax & IDs', icon: Hash },
        { id: 'bank', label: 'Bank Details', icon: Landmark }
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Company Profile</h1>
                    <p className="text-slate-500 text-sm font-medium">Manage your organization's core information and identity.</p>
                </div>
            </div>

            {message.text && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top duration-300 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <p className="text-sm font-bold">{message.text}</p>
                </div>
            )}

            <div className="bg-white rounded-[32px] shadow-sm border border-slate-200/60 overflow-hidden flex flex-col md:flex-row">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 bg-slate-50 border-r border-slate-100 p-6 space-y-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === tab.id
                                ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200'
                                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                                }`}
                        >
                            <tab.icon size={18} className={activeTab === tab.id ? 'text-primary' : 'text-slate-400'} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <form onSubmit={handleSubmit} className="flex-1 p-8 md:p-10">
                    {activeTab === 'general' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all font-bold text-sm"
                                        placeholder="Enter company name"
                                        value={company.name}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tagline</label>
                                    <input
                                        type="text"
                                        name="tagline"
                                        className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all font-bold text-sm"
                                        placeholder="Company's slogan"
                                        value={company.tagline}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
                                        <input
                                            type="email"
                                            name="email"
                                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all font-bold text-sm"
                                            placeholder="contact@company.com"
                                            value={company.contact.email}
                                            onChange={(e) => handleChange(e, 'contact')}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
                                        <input
                                            type="text"
                                            name="phone"
                                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all font-bold text-sm"
                                            placeholder="+91 0000 000000"
                                            value={company.contact.phone}
                                            onChange={(e) => handleChange(e, 'contact')}
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Website URL</label>
                                    <div className="relative group">
                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
                                        <input
                                            type="text"
                                            name="website"
                                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all font-bold text-sm"
                                            placeholder="https://www.company.com"
                                            value={company.contact.website}
                                            onChange={(e) => handleChange(e, 'contact')}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'address' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Street Address</label>
                                <input
                                    type="text"
                                    name="street"
                                    className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all font-bold text-sm"
                                    placeholder="House/Office No., Street name"
                                    value={company.address.street}
                                    onChange={(e) => handleChange(e, 'address')}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all font-bold text-sm"
                                        placeholder="Mumbai"
                                        value={company.address.city}
                                        onChange={(e) => handleChange(e, 'address')}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">State / Province</label>
                                    <input
                                        type="text"
                                        name="state"
                                        className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all font-bold text-sm"
                                        placeholder="Maharashtra"
                                        value={company.address.state}
                                        onChange={(e) => handleChange(e, 'address')}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Zip / Postal Code</label>
                                    <input
                                        type="text"
                                        name="zipCode"
                                        className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all font-bold text-sm"
                                        placeholder="400001"
                                        value={company.address.zipCode}
                                        onChange={(e) => handleChange(e, 'address')}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Country</label>
                                    <input
                                        type="text"
                                        name="country"
                                        className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all font-bold text-sm"
                                        placeholder="India"
                                        value={company.address.country}
                                        onChange={(e) => handleChange(e, 'address')}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'tax' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">GSTIN</label>
                                    <input
                                        type="text"
                                        name="gstin"
                                        className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all font-bold text-sm font-mono"
                                        placeholder="27AAACN1234A1Z1"
                                        value={company.taxInfo.gstin}
                                        onChange={(e) => handleChange(e, 'taxInfo')}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">PAN Number</label>
                                    <input
                                        type="text"
                                        name="pan"
                                        className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all font-bold text-sm font-mono"
                                        placeholder="AAACN1234A"
                                        value={company.taxInfo.pan}
                                        onChange={(e) => handleChange(e, 'taxInfo')}
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CIN (Company Identification Number)</label>
                                    <input
                                        type="text"
                                        name="cin"
                                        className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all font-bold text-sm font-mono"
                                        placeholder="L12345MH2023PLC123456"
                                        value={company.taxInfo.cin}
                                        onChange={(e) => handleChange(e, 'taxInfo')}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'bank' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bank Name</label>
                                    <input
                                        type="text"
                                        name="bankName"
                                        className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all font-bold text-sm"
                                        placeholder="HDFC Bank"
                                        value={company.bankDetails.bankName}
                                        onChange={(e) => handleChange(e, 'bankDetails')}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Number</label>
                                    <div className="relative group">
                                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
                                        <input
                                            type="text"
                                            name="accountNumber"
                                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all font-bold text-sm font-mono"
                                            placeholder="50100123456789"
                                            value={company.bankDetails.accountNumber}
                                            onChange={(e) => handleChange(e, 'bankDetails')}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">IFSC Code</label>
                                    <input
                                        type="text"
                                        name="ifscCode"
                                        className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all font-bold text-sm font-mono"
                                        placeholder="HDFC0000001"
                                        value={company.bankDetails.ifscCode}
                                        onChange={(e) => handleChange(e, 'bankDetails')}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Branch Name</label>
                                    <input
                                        type="text"
                                        name="branch"
                                        className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all font-bold text-sm"
                                        placeholder="Main Branch, Mumbai"
                                        value={company.bankDetails.branch}
                                        onChange={(e) => handleChange(e, 'bankDetails')}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="mt-10 pt-8 border-t border-slate-100">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="w-full md:w-auto flex items-center justify-center gap-2 px-10 py-4 bg-primary text-white rounded-[20px] font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary-hover hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CompanySettings;
