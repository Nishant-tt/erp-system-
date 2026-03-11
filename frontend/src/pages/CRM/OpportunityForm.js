import React, { useState, useEffect } from 'react';
import {
    Save,
    ArrowLeft,
    TrendingUp,
    Briefcase,
    Calendar,
    MessageSquare,
    Trophy
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { createOpportunityAPI, getOpportunityByIdAPI, updateOpportunityAPI } from '../../api/opportunity';
import { getLeadsAPI, getLeadByIdAPI } from '../../api/lead';

const OpportunityForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(window.location.search);
    const leadId = queryParams.get('leadId');

    const [loading, setLoading] = useState(false);
    const [leads, setLeads] = useState([]);

    const [formData, setFormData] = useState({
        title: '',
        leadReference: leadId || '',
        customer: '',
        expectedValue: '',
        probability: 50,
        stage: 'DISCOVERY',
        closeDate: ''
    });

    useEffect(() => {
        fetchResources();
        if (id) {
            fetchOpportunity();
        } else if (leadId) {
            // If leadId is present, we might want to fetch lead details to pre-fill Title
            fetchLeadForForm(leadId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, leadId]);

    const fetchResources = async () => {
        await fetchLeads();
        // await fetchCustomers(); // Assuming a fetchCustomers function might be added later
    };

    const fetchLeadForForm = async (lId) => {
        try {
            const l = await getLeadByIdAPI(lId);
            setFormData(prev => ({
                ...prev,
                title: `Deal with ${l.companyName || l.firstName + ' ' + l.lastName}`
            }));
        } catch (error) {
            console.error('Error pre-filling lead:', error);
        }
    };

    const fetchLeads = async () => {
        try {
            const data = await getLeadsAPI();
            setLeads(data.filter(l => l.status === 'QUALIFIED'));
        } catch (error) {
            console.error('Error leads:', error);
        }
    };

    const fetchOpportunity = async () => {
        try {
            const data = await getOpportunityByIdAPI(id);
            setFormData({
                ...data,
                closeDate: data.closeDate ? new Date(data.closeDate).toISOString().split('T')[0] : ''
            });
        } catch (error) {
            console.error('Error opportunity:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            if (id) {
                await updateOpportunityAPI(id, formData);
            } else {
                await createOpportunityAPI(formData);
            }
            navigate('/opportunities');
        } catch (error) {
            console.error('Error saving:', error);
        } finally {
            setLoading(false);
        }
    };

    const stages = ['PROSPECTING', 'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'];

    return (
        <div className="p-4 sm:p-6 md:p-8 pb-24 sm:pb-32 max-w-5xl mx-auto min-w-0 text-slate-900">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate('/opportunities')} className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-all">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">{id ? 'Refine Opportunity' : 'Launch New Deal'}</h1>
                    <p className="text-slate-500 font-medium text-sm">Pipeline management and revenue forecasting</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Deal Context */}
                <div className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm overflow-hidden relative">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
                            <Briefcase size={18} />
                        </div>
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Deal Context</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Associated Lead</label>
                            <select
                                className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-900 focus:ring-2 focus:ring-amber-500/20"
                                value={formData.leadReference}
                                onChange={(e) => setFormData({ ...formData, leadReference: e.target.value })}
                                required
                            >
                                <option value="">Select Qualified Lead</option>
                                {leads.map(l => <option key={l._id} value={l._id}>{l.firstName} {l.lastName} - {l.companyName}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Deal Title</label>
                            <input
                                type="text"
                                className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-900 focus:ring-2 focus:ring-amber-500/20"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. Enterprise Software License"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Financials & Timeline */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-slate-900 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-10 relative z-10">
                            <TrendingUp className="text-emerald-400" size={20} />
                            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white/30">Financial Forecast</h2>
                        </div>

                        <div className="space-y-8 relative z-10">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Expected Deal Value</label>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-emerald-400">₹</span>
                                    <input
                                        type="number"
                                        className="w-full bg-transparent border-none p-0 text-4xl font-black text-white focus:ring-0 placeholder:text-white/10"
                                        value={formData.expectedValue}
                                        onChange={(e) => setFormData({ ...formData, expectedValue: Number(e.target.value) })}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/40">
                                    <span>Win Probability</span>
                                    <span className="text-amber-400">{formData.probability}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-amber-500"
                                    value={formData.probability}
                                    onChange={(e) => setFormData({ ...formData, probability: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                        {/* Abstract glow */}
                        <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-emerald-500/10 blur-3xl rounded-full"></div>
                    </div>

                    <div className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm px-10">
                        <div className="flex items-center gap-3 mb-10">
                            <Calendar className="text-indigo-400" size={20} />
                            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Timeline & Stage</h2>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Current Pipeline Stage</label>
                                <select
                                    className="w-full bg-slate-50 border-none rounded-2xl p-4 font-black text-xs text-slate-900 appearance-none cursor-pointer"
                                    value={formData.stage}
                                    onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                                >
                                    {stages.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Expected Close Date</label>
                                <input
                                    type="date"
                                    className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-900"
                                    value={formData.closeDate}
                                    onChange={(e) => setFormData({ ...formData, closeDate: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm">
                    <div className="flex items-center gap-3 mb-10">
                        <MessageSquare className="text-indigo-400" size={20} />
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Deal Strategy & Description</h2>
                    </div>
                    <textarea
                        className="w-full bg-slate-50 border-none rounded-[32px] p-8 font-medium text-slate-900 h-40 resize-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
                        placeholder="Detail the strategy, potential blockers, and current situation..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/opportunities')}
                        className="px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all"
                    >
                        Discard
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-slate-900 text-white px-12 py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:shadow-2xl hover:shadow-amber-500/20 transition-all active:scale-95 flex items-center gap-3"
                    >
                        {formData.stage === 'CLOSED_WON' ? <Trophy size={18} className="text-amber-400" /> : <Save size={18} />}
                        {loading ? 'Processing...' : (id ? 'Update Deal' : 'Launch Opportunity')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default OpportunityForm;
