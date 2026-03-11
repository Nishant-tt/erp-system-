import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPaymentsAPI } from "../../api/vendorPayment";
import { Loader2, Search, Wallet } from "lucide-react";

export default function PaymentManagement() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("role");
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const allowedRoles = ["Admin", "Finance Head", "Director", "GM"];
    if (!allowedRoles.includes(userRole)) {
      navigate("/dashboard");
      return;
    }
    (async () => {
      try {
        const data = await getPaymentsAPI();
        setPayments(data || []);
      } catch (e) {
        console.error("Failed to load payments:", e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [navigate, userRole]);

  const filtered = payments.filter((p) => {
    const s = searchTerm.trim().toLowerCase();
    if (!s) return true;
    return (
      p.paymentNumber?.toLowerCase().includes(s) ||
      p.supplier?.name?.toLowerCase().includes(s) ||
      p.invoiceReference?.invoiceNumber?.toLowerCase().includes(s) ||
      p.invoiceReference?.vendorInvoiceNumber?.toLowerCase().includes(s)
    );
  });


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-purple-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 px-0 sm:px-2 min-w-0 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Wallet className="text-purple-600" size={22} />
            Vendor Payments
          </h1>
          <p className="text-slate-500 text-sm font-medium">Payment register for approved purchase invoices.</p>
        </div>
        <button
          onClick={() => navigate("/payments/process")}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/20 active:scale-95"
        >
          Process Payment
        </button>
      </div>

      <div className="relative group w-full md:max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors" size={18} />
        <input
          type="text"
          placeholder="Search payment / supplier / invoice..."
          className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-purple-500/20 transition-all font-bold text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="table-responsive custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                {["Payment #", "Date", "Supplier", "Invoice", "Amount", "Method", "Status"].map((h) => (
                  <th key={h} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50/50 transition-all">
                  <td className="px-6 py-4 font-black text-slate-900">{p.paymentNumber}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600">{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString("en-IN") : ""}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-700">{p.supplier?.name}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600">
                    {p.invoiceReference?.invoiceNumber || p.invoiceReference?.vendorInvoiceNumber || "-"}
                  </td>
                  <td className="px-6 py-4 text-xs font-black text-slate-900">INR {Number(p.amount || 0).toLocaleString("en-IN")}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600">{p.paymentMethod}</td>
                  <td className="px-6 py-4 text-xs font-black text-slate-700">{p.status}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-8 py-16 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">
                    No payments recorded
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
