import React, { useState, useEffect } from 'react';
import { getAccountsAPI } from '../../api/finance';
import { Plus, Search, Table as TableIcon, List, TreePine } from 'lucide-react';

const ChartOfAccounts = () => {
    const [accounts, setAccounts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewType, setViewType] = useState('table'); // 'table' or 'list'

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            // In a real app, get company ID from context/auth
            const companyId = localStorage.getItem('companyId');
            const data = await getAccountsAPI(companyId);
            setAccounts(data);
        } catch (error) {
            console.error("Failed to fetch accounts:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredAccounts = accounts.filter(acc =>
        acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.code.includes(searchTerm)
    );

    const typeColors = {
        Asset: 'text-emerald-600 bg-emerald-50',
        Liability: 'text-rose-600 bg-rose-50',
        Equity: 'text-blue-600 bg-blue-50',
        Revenue: 'text-amber-600 bg-amber-50',
        Expense: 'text-slate-600 bg-slate-50'
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Chart of Accounts</h1>
                    <p className="text-slate-500 text-sm">Manage your general ledger accounts and structure.</p>
                </div>
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20">
                    <Plus size={18} />
                    <span>New Account</span>
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or code..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200">
                        <button
                            onClick={() => setViewType('table')}
                            className={`p-1.5 rounded-md transition-all ${viewType === 'table' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <TableIcon size={18} />
                        </button>
                        <button
                            onClick={() => setViewType('list')}
                            className={`p-1.5 rounded-md transition-all ${viewType === 'list' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
                            <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                            <p className="text-sm font-medium">Loading accounts...</p>
                        </div>
                    ) : filteredAccounts.length > 0 ? (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Account Code</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Account Name</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredAccounts.map((account) => (
                                    <tr key={account._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                                                {account.code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900">{account.name}</span>
                                                {account.description && <span className="text-xs text-slate-400 truncate max-w-xs">{account.description}</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${typeColors[account.type]}`}>
                                                {account.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-600 font-medium">{account.category || '-'}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold ${account.isActive ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 bg-slate-100'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${account.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                                                {account.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-4">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center grayscale opacity-50">
                                <TreePine size={32} />
                            </div>
                            <div className="text-center">
                                <p className="text-slate-900 font-bold">No accounts found</p>
                                <p className="text-sm">Try adjusting your search or add a new account.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChartOfAccounts;
