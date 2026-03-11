import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getGRNsAPI } from "../../api/grn";
import Pagination from "../../components/common/Pagination";
import { Loader2, Plus, Search } from "lucide-react";

const GRNManagement = () => {
  const navigate = useNavigate();
  const [grns, setGRNs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    (async () => {
      try {
        const data = await getGRNsAPI();
        setGRNs(data || []);
      } catch (e) {
        console.error("Error fetching GRNs:", e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const rows = useMemo(() => {
    const out = [];
    for (const grn of grns || []) {
      const items = Array.isArray(grn.items) && grn.items.length > 0 ? grn.items : [null];
      for (const it of items) {
        const item = it?.item || {};
        const received = Number(it?.receivedQuantity) || 0;
        const rejected = Number(it?.rejectedQuantity) || 0;
        const accepted = Number.isFinite(it?.acceptedQuantity) ? Number(it.acceptedQuantity) : Math.max(0, received - rejected);
        out.push({
          grnId: grn._id,
          grnNumber: grn.grnNumber || "",
          grnDate: grn.receivedDate || grn.createdAt,
          poNumber: grn.poReference?.poNumber || "",
          vendorName: grn.supplier?.name || "",
          vendorCode: grn.supplier?.code || "",
          verificationStatus: grn.verificationStatus || "",
          itemCode: item.itemCode || "",
          itemDescription: item.description || item.itemName || "",
          orderedQty: it?.orderedQuantity ?? "",
          receivedQty: it?.receivedQuantity ?? "",
          acceptedQty: accepted,
          rejectedQty: it?.rejectedQuantity ?? 0,
          uom: it?.unit || item.uom || "",
          warehouseLocation: grn.warehouseLocation || "",
          inspectionStatus: grn.inspectionStatus || "",
          receivedBy: grn.receivedBy?.name || "",
          remarks: grn.remarks || "",
        });
      }
    }
    return out;
  }, [grns]);

  const filtered = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesStatus = verificationFilter === "ALL" || r.verificationStatus === verificationFilter;
      const matchesSearch = (
        !s ||
        r.grnNumber.toLowerCase().includes(s) ||
        r.poNumber.toLowerCase().includes(s) ||
        r.vendorName.toLowerCase().includes(s) ||
        r.vendorCode.toLowerCase().includes(s) ||
        r.itemCode.toLowerCase().includes(s) ||
        r.itemDescription.toLowerCase().includes(s)
      );
      return matchesStatus && matchesSearch;
    });
  }, [rows, searchTerm, verificationFilter]);

  const verificationOptions = useMemo(() => {
    const set = new Set((rows || []).map((r) => r.verificationStatus).filter(Boolean));
    return ["ALL", ...Array.from(set).sort()];
  }, [rows]);

  const total = filtered.length;
  const startIndex = (page - 1) * pageSize;
  const paginated = filtered.slice(startIndex, startIndex + pageSize);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 px-0 sm:px-2 min-w-0 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Goods Receipt Note (GRN)</h1>
          <p className="text-slate-500 text-sm font-medium">Line-item GRN view for accurate receipt and inspection tracking.</p>
        </div>
        <button
          onClick={() => navigate("/grns/create")}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
        >
          <Plus size={18} />
          New GRN
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
        <div className="relative group w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search GRN / PO / vendor / item..."
            className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald-500/20 transition-all font-bold text-sm"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">GRN Status</span>
          <select
            value={verificationFilter}
            onChange={(e) => {
              setVerificationFilter(e.target.value);
              setPage(1);
            }}
            className="h-11 px-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald-500/20 transition-all text-xs font-black text-slate-700 uppercase tracking-widest"
          >
            {verificationOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {paginated.map((r, idx) => (
          <button
            key={`${r.grnId}-${r.itemCode}-${idx}`}
            onClick={() => navigate(`/grns/${r.grnId}`)}
            className="text-left bg-white rounded-[24px] border border-slate-200/60 p-4 shadow-sm active:scale-[0.99] transition"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-black text-slate-900 truncate">{r.grnNumber}</div>
                <div className="text-[11px] font-bold text-slate-500 truncate">
                  PO: {r.poNumber || "-"} · {r.vendorName}
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-slate-50 text-slate-600 border-slate-100 shrink-0">
                {r.inspectionStatus || "-"}
              </span>
            </div>
            <div className="mt-3 text-[11px] font-bold text-slate-700">
              <span className="font-black text-indigo-600 font-mono">{r.itemCode || "-"}</span> {r.itemDescription ? `· ${r.itemDescription}` : ""}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-600">
              <div>Rec: <span className="font-black text-slate-900">{r.receivedQty}</span> {r.uom}</div>
              <div className="text-right">Acc: <span className="font-black text-emerald-700">{r.acceptedQty}</span></div>
            </div>
          </button>
        ))}
        {paginated.length === 0 && (
          <div className="px-8 py-16 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">
            No GRN rows found
          </div>
        )}
      </div>

      {/* Desktop Table */}
      <div className="bg-white rounded-[32px] shadow-sm border border-slate-200/60 overflow-hidden hidden md:block">
        <div className="table-responsive custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1800px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                {[
                  "GRN Number",
                  "GRN Date",
                  "PO Number",
                  "Vendor Name",
                  "Vendor Code",
                  "Item Code",
                  "Item Description",
                  "Ordered Quantity",
                  "Received Quantity",
                  "Accepted Quantity",
                  "Rejected Quantity",
                  "UOM",
                  "Warehouse Location",
                  "Inspection Status",
                  "Received By",
                  "Remarks",
                ].map((h) => (
                  <th key={h} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.map((r, idx) => (
                <tr
                  key={`${r.grnId}-${r.itemCode}-${idx}`}
                  className="group hover:bg-slate-50/50 transition-all cursor-pointer"
                  onClick={() => navigate(`/grns/${r.grnId}`)}
                >
                  <td className="px-6 py-4 font-black text-slate-900">{r.grnNumber}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600">{r.grnDate ? new Date(r.grnDate).toLocaleDateString("en-IN") : ""}</td>
                  <td className="px-6 py-4 text-xs font-black text-slate-800">{r.poNumber || "-"}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-700">{r.vendorName}</td>
                  <td className="px-6 py-4 text-xs font-black text-indigo-600 font-mono">{r.vendorCode || "-"}</td>
                  <td className="px-6 py-4 text-xs font-black text-indigo-600 font-mono">{r.itemCode}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-700">{r.itemDescription}</td>
                  <td className="px-6 py-4 text-xs font-black text-slate-900">{r.orderedQty}</td>
                  <td className="px-6 py-4 text-xs font-black text-slate-900">{r.receivedQty}</td>
                  <td className="px-6 py-4 text-xs font-black text-emerald-700">{r.acceptedQty}</td>
                  <td className="px-6 py-4 text-xs font-black text-red-600">{r.rejectedQty}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600">{r.uom}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600">{r.warehouseLocation || "-"}</td>
                  <td className="px-6 py-4 text-xs font-black text-slate-700">{r.inspectionStatus || "-"}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600">{r.receivedBy || "-"}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600 max-w-[260px] truncate">{r.remarks || "-"}</td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={16} className="px-8 py-16 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">
                    No GRN rows found
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
};

export default GRNManagement;
