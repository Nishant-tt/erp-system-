import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProcurementQuotationsAPI } from "../../api/procurementQuotation";
import { CheckCircle, Clock, ArrowRight, Search, ShieldCheck, Loader2 } from "lucide-react";

export default function ProcurementQuotationApprovalQueue() {
  const navigate = useNavigate();
  const [qs, setQs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const userRole = localStorage.getItem("role");

  useEffect(() => {
    if (userRole !== "Admin" && userRole !== "Manager") {
      navigate("/dashboard");
      return;
    }
    const load = async () => {
      try {
        const data = await getProcurementQuotationsAPI();
        setQs((data || []).filter((q) => q.status === "PENDING_APPROVAL"));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [userRole, navigate]);

  const filtered = qs.filter((q) => {
    const s = searchTerm.toLowerCase();
    return (
      q.quotationNumber?.toLowerCase().includes(s) ||
      q.prReference?.prNumber?.toLowerCase().includes(s) ||
      (q.suppliers || []).some((sp) => sp?.name?.toLowerCase().includes(s))
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-8 px-0 sm:px-2 min-w-0 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <CheckCircle className="text-amber-500" size={32} />
            Quotation Approval Queue
          </h1>
          <p className="text-slate-500 font-medium mt-1">Review and authorize pending procurement quotations.</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-100">
          <ShieldCheck size={18} className="text-amber-600" />
          <span className="text-xs font-black text-amber-700 uppercase tracking-widest">{qs.length} Pending</span>
        </div>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
        <input
          type="text"
          placeholder="Search by quotation #, PR #, or supplier..."
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[32px] outline-none focus:border-primary/20 shadow-sm font-medium transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((q) => (
            <div
              key={q._id}
              className="bg-white rounded-[40px] border border-slate-200/60 shadow-sm hover:shadow-xl transition-all group overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-black text-primary px-3 py-1 bg-primary/5 rounded-lg border border-primary/10">
                    {q.quotationNumber}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                    <Clock size={12} />
                    Pending
                  </div>
                </div>
                <p className="text-sm font-black text-slate-900">PR: {q.prReference?.prNumber}</p>
              </div>
              <div className="p-8 flex-1 flex items-end justify-between">
                <div className="text-xs font-bold text-slate-500">
                  Suppliers: {(q.suppliers || []).length}
                </div>
                <button
                  onClick={() => navigate(`/procurement-quotations/${q._id}`)}
                  className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center group-hover:bg-primary transition-colors shadow-lg shadow-slate-900/10"
                >
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[40px] border border-slate-200 border-dashed p-20 text-center space-y-4">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Queue Clear</h3>
          <p className="text-slate-500 font-medium max-w-sm mx-auto">
            No pending procurement quotations right now.
          </p>
        </div>
      )}
    </div>
  );
}

