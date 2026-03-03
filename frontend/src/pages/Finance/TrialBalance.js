import React, { useState, useEffect } from 'react';
import { getTrialBalanceAPI } from '../../api/finance';
import { Download, Printer, Calculator, Info } from 'lucide-react';

const TrialBalance = () => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchTrialBalance();
    }, []);

    const fetchTrialBalance = async () => {
        try {
            const companyId = localStorage.getItem('companyId');
            const result = await getTrialBalanceAPI(companyId);
            setData(result);
        } catch (error) {
            console.error("Failed to fetch trial balance:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const totalDebit = data.reduce((sum, row) => sum + row.totalDebit, 0);
    const totalCredit = data.reduce((sum, row) => sum + row.totalCredit, 0);

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Trial Balance</h1>
                    <p className="text-slate-500 text-sm">Summary of all ledger balances across the chart of accounts.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl font-semibold border border-slate-200 transition-all shadow-sm">
                        <Printer size={18} />
                        <span>Print</span>
                    </button>
                    <button className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-slate-900/20">
                        <Download size={18} />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                        <Calculator size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Dr. Balance</p>
                        <p className="text-xl font-bold text-slate-900">₹{totalDebit.toLocaleString()}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                        <Calculator size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Cr. Balance</p>
                        <p className="text-xl font-bold text-slate-900">₹{totalCredit.toLocaleString()}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${Math.abs(totalDebit - totalCredit) < 0.01 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        <Info size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Book Status</p>
                        <p className="text-xl font-bold text-slate-900">
                            {Math.abs(totalDebit - totalCredit) < 0.01 ? 'Balanced' : 'Unbalanced'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
                            <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                            <p className="text-sm font-medium">Calculating balances...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Account Code</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Account Name</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Debit (Dr.)</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Credit (Cr.)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {data.map((row) => (
                                    <tr key={row._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-mono text-slate-500">{row.accountCode}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-900">{row.accountName}</td>
                                        <td className="px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">{row.accountType}</td>
                                        <td className="px-6 py-4 text-sm text-right font-medium text-slate-700">
                                            {row.totalDebit > 0 ? `₹${row.totalDebit.toLocaleString()}` : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-right font-medium text-slate-700">
                                            {row.totalCredit > 0 ? `₹${row.totalCredit.toLocaleString()}` : '-'}
                                        </td>
                                    </tr>
                                ))}
                                <tr className="bg-slate-900 text-white font-bold">
                                    <td colSpan={3} className="px-6 py-4 text-sm uppercase tracking-widest text-right">Total</td>
                                    <td className="px-6 py-4 text-right text-base underline decoration-blue-400 decoration-2 underline-offset-4">
                                        ₹{totalDebit.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right text-base underline decoration-emerald-400 decoration-2 underline-offset-4">
                                        ₹{totalCredit.toLocaleString()}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrialBalance;
