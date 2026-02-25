import React, { useState, useEffect } from 'react';
import {
    Target,
    Plus,
    Search,
    Trophy,
    TrendingUp,
    Clock,
    DollarSign,
    MoreHorizontal,
    ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getOpportunitiesAPI } from '../../api/opportunity';

const OpportunityManagement = () => {
    const navigate = useNavigate();
    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOpportunities();
    }, []);

    const fetchOpportunities = async () => {
        try {
            setLoading(true);
            const data = await getOpportunitiesAPI();
            setOpportunities(data);
        } catch (error) {
            console.error('Error fetching opportunities:', error);
        } finally {
            setLoading(false);
        }
    };

    const stages = ["PROSPECTING", "QUALIFICATION", "PROPOSAL", "NEGOTIATION", "CLOSED_WON", "CLOSED_LOST"];

    return (
        <div className="p-8 pb-24 text-slate-900">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                            <Target size={24} />
                        </div>
                        Sales Pipeline
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Manage and close high-value opportunities</p>
                </div>
                <button
                    onClick={() => navigate('/opportunities/create')}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:shadow-lg hover:shadow-indigo-600/30 transition-all active:scale-95"
                >
                    <Plus size={20} />
                    New Opportunity
                </button>
            </div>

            {/* Pipeline Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 mb-8 overflow-x-auto pb-4">
                {stages.map((stage) => {
                    const stageOpps = opportunities.filter(o => o.stage === stage);
                    const totalValue = stageOpps.reduce((sum, o) => sum + (o.expectedValue || 0), 0);

                    return (
                        <div key={stage} className="min-w-[280px]">
                            <div className="flex items-center justify-between mb-4 px-2">
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${stage === 'CLOSED_WON' ? 'bg-emerald-500' : stage === 'CLOSED_LOST' ? 'bg-rose-500' : 'bg-slate-400'}`}></span>
                                    <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                        {stage.replace('_', ' ')}
                                    </h3>
                                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-black">
                                        {stageOpps.length}
                                    </span>
                                </div>
                                <span className="text-[10px] font-black text-slate-900 tracking-tighter">₹{totalValue.toLocaleString()}</span>
                            </div>

                            <div className="space-y-4">
                                {stageOpps.map((opp) => (
                                    <div
                                        key={opp._id}
                                        onClick={() => navigate(`/opportunities/edit/${opp._id}`)}
                                        className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all group cursor-pointer"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter">{opp.opportunityNumber}</p>
                                            <div className="flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></div>
                                                <span className="text-[9px] font-black text-slate-400">{opp.probability}%</span>
                                            </div>
                                        </div>
                                        <h4 className="font-bold text-slate-900 mb-1 line-clamp-1">{opp.title}</h4>
                                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium mb-4">
                                            <TrendingUp size={12} className="text-slate-400" />
                                            {opp.leadReference?.firstName} {opp.leadReference?.lastName}
                                        </div>

                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                                            <div className="flex items-center gap-1 text-emerald-600 font-black text-sm">
                                                ₹{opp.expectedValue?.toLocaleString()}
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                <Clock size={12} />
                                                {opp.closeDate ? new Date(opp.closeDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'TBD'}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {stageOpps.length === 0 && (
                                    <div className="border-2 border-dashed border-slate-100 rounded-[24px] py-12 flex flex-col items-center justify-center text-slate-200">
                                        <Plus size={24} className="mb-2" />
                                        <p className="text-[10px] font-black uppercase tracking-widest tracking-[0.2em]">Drop Zone</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Performance Snapshot */}
            <div className="bg-slate-900 rounded-[40px] p-8 text-white">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-3xl font-black mb-2 flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white">
                                    <Trophy size={28} />
                                </div>
                                Pipeline Performance
                            </h2>
                            <p className="text-white/60 font-medium max-w-md">Your sales team is tracking towards 120% of the quarterly target based on current lead velocity.</p>
                        </div>
                        <div className="flex gap-4">
                            <button className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center gap-2">
                                View Full Report <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OpportunityManagement;
