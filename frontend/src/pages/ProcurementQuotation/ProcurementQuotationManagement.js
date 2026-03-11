import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProcurementQuotationsAPI } from "../../api/procurementQuotation";
import Pagination from "../../components/common/Pagination";
import { FileText, Plus, Search, ChevronRight, Loader2, BadgeCheck, Download } from "lucide-react";

const statusBadge = (status) => {
  switch (status) {
    case "DRAFT":
      return "bg-slate-50 text-slate-600 border-slate-100";
    case "PENDING_APPROVAL":
      return "bg-amber-50 text-amber-700 border-amber-100";
    case "APPROVED":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case "SENT":
      return "bg-indigo-50 text-indigo-700 border-indigo-100";
    case "REJECTED":
      return "bg-red-50 text-red-700 border-red-100";
    default:
      return "bg-slate-50 text-slate-600 border-slate-100";
  }
};

export default function ProcurementQuotationManagement() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getProcurementQuotationsAPI();
        setData(res);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filtered = data.filter((q) => {
    const s = searchTerm.toLowerCase();
    return (
      q.quotationNumber?.toLowerCase().includes(s) ||
      q.prReference?.prNumber?.toLowerCase().includes(s) ||
      (q.suppliers || []).some((sp) => sp?.name?.toLowerCase().includes(s))
    );
  });

  const total = filtered.length;
  const startIndex = (page - 1) * pageSize;
  const paginated = filtered.slice(startIndex, startIndex + pageSize);

  const downloadCsv = () => {
    const rows = filtered.map((q) => ({
      quotationNumber: q.quotationNumber,
      prNumber: q.prReference?.prNumber || "",
      status: q.status,
      suppliers: (q.suppliers || []).map((s) => s.name).join("; "),
      subtotal: q.subtotal,
      gstTotal: q.gstTotal,
      grandTotal: q.grandTotal,
      createdAt: q.createdAt,
    }));
    const headers = Object.keys(
      rows[0] || {
        quotationNumber: "",
        prNumber: "",
        status: "",
        suppliers: "",
        subtotal: "",
        gstTotal: "",
        grandTotal: "",
        createdAt: "",
      }
    );
    const csv = [
      headers.join(","),
      ...rows.map((r) => headers.map((h) => `"${String(r[h] ?? "").replaceAll('"', '""')}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ProcurementQuotations_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 px-0 sm:px-2 min-w-0 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Procurement Quotations</h1>
          <p className="text-slate-500 text-sm font-medium">
            Create quotations (GST applicable) and send to eligible suppliers.
          </p>
        </div>
        <button
          onClick={() => navigate("/procurement-quotations/create")}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 active:scale-95"
        >
          <Plus size={18} />
          Create Quotation
        </button>
        <button
          onClick={downloadCsv}
          className="flex items-center gap-2 px-6 py-3 bg-white text-slate-700 rounded-2xl font-bold border-2 border-slate-100 hover:border-slate-200 transition-all shadow-sm active:scale-95"
        >
          <Download size={18} />
          Download
        </button>
      </div>

      <div className="relative group w-full md:max-w-md">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
          size={18}
        />
        <input
          type="text"
          placeholder="Search quotation / PR / supplier..."
          className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 transition-all font-bold text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-2xl sm:rounded-[32px] shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="table-responsive overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-4 sm:px-8 py-4 sm:py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Quotation
                </th>
                <th className="px-4 sm:px-8 py-4 sm:py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  PR Reference
                </th>
                <th className="px-4 sm:px-8 py-4 sm:py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Suppliers
                </th>
                <th className="px-4 sm:px-8 py-4 sm:py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Total
                </th>
                <th className="px-4 sm:px-8 py-4 sm:py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-4 sm:px-8 py-4 sm:py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.map((q) => (
                <tr
                  key={q._id}
                  className="group hover:bg-slate-50/50 transition-all cursor-pointer"
                  onClick={() => navigate(`/procurement-quotations/${q._id}`)}
                >
                  <td className="px-4 sm:px-8 py-4 sm:py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 group-hover:text-primary transition-colors">
                          {q.quotationNumber}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 text-slate-400">
                          <BadgeCheck size={12} />
                          <span className="text-xs font-bold">{new Date(q.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-8 py-4 sm:py-6">
                    <span className="font-bold text-slate-700">{q.prReference?.prNumber || "-"}</span>
                  </td>
                  <td className="px-4 sm:px-8 py-4 sm:py-6">
                    <div className="flex flex-wrap gap-2">
                      {(q.suppliers || []).slice(0, 2).map((s) => (
                        <span
                          key={s._id}
                          className="px-2 py-1 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-600"
                        >
                          {s.name}
                        </span>
                      ))}
                      {(q.suppliers || []).length > 2 && (
                        <span className="px-2 py-1 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400">
                          +{(q.suppliers || []).length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 sm:px-8 py-4 sm:py-6">
                    <p className="font-black text-slate-900">₹{Number(q.grandTotal || 0).toLocaleString()}</p>
                  </td>
                  <td className="px-4 sm:px-8 py-4 sm:py-6">
                    <span
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusBadge(
                        q.status
                      )}`}
                    >
                      {q.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end group-hover:translate-x-1 transition-transform">
                      <ChevronRight className="text-slate-300 group-hover:text-primary" size={20} />
                    </div>
                  </td>
                </tr>
              ))}

              {total === 0 && (
                <tr>
                  <td colSpan="6" className="px-4 sm:px-8 py-12 sm:py-20 text-center">
                    <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No quotations found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setPage(1);
        }}
      />
    </div>
  );
}

