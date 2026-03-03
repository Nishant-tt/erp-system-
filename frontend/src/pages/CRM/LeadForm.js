import React, { useState, useEffect } from 'react';
import {
    Save,
    ArrowLeft,
    Mail,
    Phone,
    Building2,
    MessageSquare,
    Star
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { createLeadAPI, getLeadByIdAPI, updateLeadAPI } from '../../api/lead';

const LeadForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        companyName: '',
        email: '',
        phone: '',
        source: 'DIRECT',
        status: 'NEW',
        requirements: '',
        notes: ''
    });

    const fetchLead = async () => {
        try {
            const data = await getLeadByIdAPI(id);
            setFormData(data);
        } catch (error) {
            console.error('Error fetching lead:', error);
        }
    };

    useEffect(() => {
        if (id) fetchLead();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            if (id) {
                await updateLeadAPI(id, formData);
            } else {
                await createLeadAPI(formData);
            }
            navigate('/leads');
        } catch (error) {
            console.error('Error saving lead:', error);
        } finally {
            setLoading(false);
        }
    };

    const sources = ['DIRECT', 'WEBSITE', 'REFERRAL', 'COLD_CALL', 'EXHIBITION', 'OTHER'];
    const statuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'LOST', 'CONVERTED'];

    return (
        <div className="p-8 pb-32 max-w-5xl mx-auto text-slate-900">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate('/leads')} className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-all">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">{id ? 'Edit Prospect' : 'New Prospect'}</h1>
                    <p className="text-slate-500 font-medium text-sm">Capture details for potential business</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info */}
                <div className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                            <Star size={18} />
                        </div>
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Identification</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">First Name</label>
                            <input
                                type="text"
                                className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Last Name</label>
                            <input
                                type="text"
                                className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 text-indigo-600">Organization / Company</label>
                            <div className="relative">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 font-black text-slate-900 focus:ring-2 focus:ring-indigo-500/20"
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    {/* Visual accent */}
                    <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
                </div>

                {/* Contact & Meta */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm">
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-10">Channels</h2>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="email"
                                        className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 font-bold text-slate-900"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Contact Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 font-bold text-slate-900"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm">
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-10">Qualification</h2>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Lead Source</label>
                                <select
                                    className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-900"
                                    value={formData.source}
                                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                >
                                    {sources.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Lead Status</label>
                                <select
                                    className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-900"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Requirements */}
                <div className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm">
                    <div className="flex items-center gap-3 mb-10">
                        <MessageSquare className="text-indigo-400" size={20} />
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Prospect Requirements</h2>
                    </div>
                    <textarea
                        className="w-full bg-slate-50 border-none rounded-[32px] p-8 font-medium text-slate-900 h-40 resize-none focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300"
                        placeholder="What is the prospect looking for? Detail their pain points and interests..."
                        value={formData.requirements}
                        onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    />
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/leads')}
                        className="px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all"
                    >
                        Discard
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-slate-900 text-white px-12 py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:shadow-2xl hover:shadow-indigo-500/20 transition-all active:scale-95 flex items-center gap-3"
                    >
                        <Save size={18} />
                        {loading ? 'Processing...' : (id ? 'Save Changes' : 'Create Prospect')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default LeadForm;
