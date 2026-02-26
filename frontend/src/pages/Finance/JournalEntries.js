import React, { useState, useEffect } from 'react';
import { getJournalEntriesAPI } from '../../api/finance';
import { Plus, Search, Calendar, FileText, CheckCircle, Clock, XCircle, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';

const JournalEntries = () => {
    const [entries, setEntries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchEntries();
    }, []);

    const fetchEntries = async () => {
        try {
            const companyId = localStorage.getItem('companyId');
            const data = await getJournalEntriesAPI({ company: companyId });
            setEntries(data);
        } catch (error) {
            console.error("Failed to fetch journal entries:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const statusConfig = {
        Posted: { color: 'text-emerald-600 bg-emerald-50', icon: CheckCircle },
        Draft: { color: 'text-amber-600 bg-amber-50', icon: Clock },
        Cancelled: { color: 'text-rose-600 bg-rose-50', icon: XCircle }
    };

    const filteredEntries = entries.filter(entry =>
        entry.entryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entry.reference && entry.reference.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (entry.description && entry.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Journal Entries</h1>
                    <p className="text-slate-500 text-sm">View and manage double-entry accounting records.</p>
                </div>
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20">
                    <Plus size={18} />
                    <span>New Journal Voucher</span>
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search entries, reference, or description..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
                            <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                            <p className="text-sm font-medium">Loading entries...</p>
                        </div>
                    ) : filteredEntries.length > 0 ? (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Entry #</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reference</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Debit / Credit</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredEntries.map((entry) => {
                                    const totalAmount = entry.items.reduce((sum, item) => sum + item.debit, 0);
                                    const StatusIcon = statusConfig[entry.status]?.icon || Clock;

                                    return (
                                        <tr key={entry._id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                                    <Calendar size={14} className="text-slate-400" />
                                                    {format(new Date(entry.date), 'dd MMM, yyyy')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                                                    {entry.entryNumber}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-slate-700 font-semibold">
                                                    <FileText size={14} className="text-slate-400" />
                                                    {entry.reference || '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-slate-500 line-clamp-1 max-w-xs">{entry.description}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-sm font-bold text-slate-900">₹{totalAmount.toLocaleString()}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Balanced Entry</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${statusConfig[entry.status]?.color || 'bg-slate-100 text-slate-600'}`}>
                                                        <StatusIcon size={12} />
                                                        {entry.status}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-4">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center grayscale opacity-50">
                                <ArrowUpDown size={32} />
                            </div>
                            <div className="text-center">
                                <p className="text-slate-900 font-bold">No entries found</p>
                                <p className="text-sm">Make sure you have posted transactions or create one manually.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JournalEntries;
