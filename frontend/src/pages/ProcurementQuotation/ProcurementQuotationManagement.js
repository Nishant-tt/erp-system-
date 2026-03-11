import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProcurementQuotationsAPI } from "../../api/procurementQuotation";
import Pagination from "../../components/common/Pagination";
import { Loader2, Plus, Search } from "lucide-react";

// RFQ table (stored as ProcurementQuotation in backend) is flattened per supplier + line item.
export default function ProcurementQuotationManagement() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    (async () => {
      try {
        const res = await getProcurementQuotationsAPI();
        setData(res || []);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const rows = useMemo(() => {
    const out = [];
    for (const rfq of data || []) {
      const suppliers = Array.isArray(rfq.suppliers) && rfq.suppliers.length > 0 ? rfq.suppliers : [null];
      const items = Array.isArray(rfq.items) && rfq.items.length > 0 ? rfq.items : [null];

      for (const sp of suppliers) {
        for (const it of items) {
          const item = it?.item || {};
          out.push({
            id: rfq._id,
            rfqNumber: rfq.quotationNumber || "",
            rfqDate: rfq.rfqDate || rfq.createdAt,
            vendorName: sp?.name || (suppliers.length > 1 ? "Multiple Vendors" : ""),
            vendorContact: sp?.contact?.phone || sp?.contact?.email || "",
            itemCode: item.itemCode || "",
            itemDescription: it?.description || item.description || item.itemName || "",
            qty: it?.quantity ?? "",
            uom: it?.unit || item.uom || "",
            requestedDeliveryDate: rfq.requestedDeliveryDate || "",
            quotationDueDate: rfq.quotationDueDate || "",
            termsConditions: rfq.termsConditions || "",
            currency: rfq.currency || "INR",
            remarks: rfq.remarks || "",
            status: rfq.status || "",
          });
        }
      }
    }
    return out;
  }, [data]);

  const filteredRows = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
      const matchesSearch =
        !s ||
        r.rfqNumber.toLowerCase().includes(s) ||
        r.vendorName.toLowerCase().includes(s) ||
        r.vendorContact.toLowerCase().includes(s) ||
        r.itemCode.toLowerCase().includes(s) ||
        r.itemDescription.toLowerCase().includes(s);
      return matchesStatus && matchesSearch;
    });
  }, [rows, searchTerm, statusFilter]);

  const total = filteredRows.length;
  const startIndex = (page - 1) * pageSize;
  const paginated = filteredRows.slice(startIndex, startIndex + pageSize);


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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Request for Quotation (RFQ)</h1>
          <p className="text-slate-500 text-sm font-medium">Line-item RFQ view by vendor for accurate tracking.</p>
        </div>
        <button
          onClick={() => navigate("/procurement-quotations/create")}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 active:scale-95"
        >
          <Plus size={18} />
          Create RFQ
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
        <div className="relative group w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search RFQ / vendor / item..."
            className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 transition-all font-bold text-sm"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">RFQ Status</label>
          <select
            className="px-4 py-3 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 font-bold text-sm"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="ALL">All</option>
            <option value="DRAFT">DRAFT</option>
            <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
            <option value="APPROVED">APPROVED</option>
            <option value="SENT">SENT</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {paginated.map((r, idx) => (
          <button
            key={`${r.id}-${r.vendorName}-${r.itemCode}-${idx}`}
            onClick={() => navigate(`/procurement-quotations/${r.id}`)}
            className="text-left bg-white rounded-[24px] border border-slate-200/60 p-4 shadow-sm active:scale-[0.99] transition"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-black text-slate-900 truncate">{r.rfqNumber}</div>
                <div className="text-[11px] font-bold text-slate-500 truncate">{r.vendorName || "-"}</div>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-slate-50 text-slate-600 border-slate-100 shrink-0">
                {r.status}
              </span>
            </div>
            <div className="mt-3 text-[11px] font-bold text-slate-700">
              <span className="font-black text-indigo-600 font-mono">{r.itemCode || "-"}</span> {r.itemDescription ? `· ${r.itemDescription}` : ""}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-600">
              <div>Qty: <span className="font-black text-slate-900">{r.qty || "-"}</span> {r.uom}</div>
              <div className="text-right">{r.currency} {""}</div>
            </div>
          </button>
        ))}
        {paginated.length === 0 && (
          <div className="px-8 py-16 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">
            No RFQ rows found
          </div>
        )}
      </div>

      {/* Desktop Table */}
      <div className="bg-white rounded-[32px] shadow-sm border border-slate-200/60 overflow-hidden hidden md:block">
        <div className="table-responsive custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1500px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                {[
                  "RFQ Number",
                  "RFQ Date",
                  "Vendor Name",
                  "Vendor Contact",
                  "Item Code",
                  "Item Description",
                  "Quantity",
                  "UOM",
                  "Requested Delivery Date",
                  "Quotation Due Date",
                  "Terms & Conditions",
                  "Currency",
                  "Remarks",
                  "RFQ Status",
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
                  key={`${r.id}-${r.vendorName}-${r.itemCode}-${idx}`}
                  className="group hover:bg-slate-50/50 transition-all cursor-pointer"
                  onClick={() => navigate(`/procurement-quotations/${r.id}`)}
                >
                  <td className="px-6 py-4 font-black text-slate-900">{r.rfqNumber}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600">{r.rfqDate ? new Date(r.rfqDate).toLocaleDateString("en-IN") : ""}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-700">{r.vendorName || "-"}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600">{r.vendorContact || "-"}</td>
                  <td className="px-6 py-4 text-xs font-black text-indigo-600 font-mono">{r.itemCode}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-700">{r.itemDescription}</td>
                  <td className="px-6 py-4 text-xs font-black text-slate-900">{r.qty}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600">{r.uom}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600">{r.requestedDeliveryDate ? new Date(r.requestedDeliveryDate).toLocaleDateString("en-IN") : ""}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600">{r.quotationDueDate ? new Date(r.quotationDueDate).toLocaleDateString("en-IN") : ""}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600 max-w-[260px] truncate">{r.termsConditions || "-"}</td>
                  <td className="px-6 py-4 text-xs font-black text-slate-700">{r.currency}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600 max-w-[260px] truncate">{r.remarks || "-"}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-slate-50 text-slate-600 border-slate-100">
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={14} className="px-8 py-16 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">
                    No RFQ rows found
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
