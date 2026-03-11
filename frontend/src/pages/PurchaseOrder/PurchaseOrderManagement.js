import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPOsAPI } from "../../api/po";
import Pagination from "../../components/common/Pagination";
import { Loader2, Plus, Search } from "lucide-react";

const PurchaseOrderManagement = () => {
  const navigate = useNavigate();
  const [pos, setPOs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    (async () => {
      try {
        const data = await getPOsAPI();
        setPOs(data || []);
      } catch (e) {
        console.error("Error fetching POs:", e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const rows = useMemo(() => {
    const out = [];
    for (const po of pos || []) {
      const items = Array.isArray(po.items) && po.items.length > 0 ? po.items : [null];
      for (const it of items) {
        const item = it?.item || {};
        out.push({
          poId: po._id,
          poNumber: po.poNumber || "",
          poDate: po.orderDate || po.createdAt,
          vendorName: po.supplier?.name || "",
          vendorCode: po.supplier?.code || "",
          itemCode: item.itemCode || "",
          itemDescription: it?.description || item.description || item.itemName || "",
          qty: it?.quantity ?? "",
          uom: it?.unit || item.uom || "",
          unitPrice: it?.unitCost ?? "",
          totalPrice: it?.taxableValue ?? it?.totalCost ?? "",
          discount: it?.discount ?? 0,
          taxGst: it?.gstAmount ?? 0,
          gstRate: it?.gstRate ?? 0,
          deliveryDate: po.expectedDeliveryDate || "",
          deliveryLocation: po.deliveryLocation || "",
          paymentTerms: po.paymentTerms || po.terms || "",
          shippingMethod: po.shippingMethod || "",
          costCenter: po.costCenter || "",
          createdBy: po.createdBy?.name || "",
          approvedBy: po.approvedBy?.name || "",
          poStatus: po.approvalStatus && po.approvalStatus !== "APPROVED" ? po.approvalStatus : po.status,
        });
      }
    }
    return out;
  }, [pos]);

  const filtered = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesStatus = statusFilter === "ALL" || r.poStatus === statusFilter;
      const matchesSearch = (
        !s ||
        r.poNumber.toLowerCase().includes(s) ||
        r.vendorName.toLowerCase().includes(s) ||
        r.vendorCode.toLowerCase().includes(s) ||
        r.itemCode.toLowerCase().includes(s) ||
        r.itemDescription.toLowerCase().includes(s)
      );
      return matchesStatus && matchesSearch;
    });
  }, [rows, searchTerm, statusFilter]);

  const statusOptions = useMemo(() => {
    const set = new Set((rows || []).map((r) => r.poStatus).filter(Boolean));
    return ["ALL", ...Array.from(set).sort()];
  }, [rows]);

  const totalFiltered = filtered.length;
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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Purchase Orders (PO)</h1>
          <p className="text-slate-500 text-sm font-medium">Line-item PO view for accurate pricing and tax tracking.</p>
        </div>
        <button
          onClick={() => navigate("/purchase-orders/create")}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 active:scale-95"
        >
          <Plus size={18} />
          Create New PO
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
        <div className="relative group w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search PO / vendor / item..."
            className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 transition-all font-bold text-sm"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PO Status</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-11 px-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 transition-all text-xs font-black text-slate-700 uppercase tracking-widest"
          >
            {statusOptions.map((opt) => (
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
            key={`${r.poId}-${r.itemCode}-${idx}`}
            onClick={() => navigate(`/purchase-orders/${r.poId}`)}
            className="text-left bg-white rounded-[24px] border border-slate-200/60 p-4 shadow-sm active:scale-[0.99] transition"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-black text-slate-900 truncate">{r.poNumber}</div>
                <div className="text-[11px] font-bold text-slate-500 truncate">{r.vendorName}</div>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-slate-50 text-slate-600 border-slate-100 shrink-0">
                {r.poStatus}
              </span>
            </div>
            <div className="mt-3 text-[11px] font-bold text-slate-700">
              <span className="font-black text-indigo-600 font-mono">{r.itemCode || "-"}</span> {r.itemDescription ? `· ${r.itemDescription}` : ""}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-600">
              <div>Qty: <span className="font-black text-slate-900">{r.qty || "-"}</span> {r.uom}</div>
              <div className="text-right">INR {Number(r.totalPrice || 0).toLocaleString("en-IN")}</div>
            </div>
          </button>
        ))}
        {paginated.length === 0 && (
          <div className="px-8 py-16 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">
            No PO rows found
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
                  "PO Number",
                  "PO Date",
                  "Vendor Name",
                  "Vendor Code",
                  "Item Code",
                  "Item Description",
                  "Quantity Ordered",
                  "UOM",
                  "Unit Price",
                  "Total Price",
                  "Discount",
                  "Tax / GST",
                  "Delivery Date",
                  "Delivery Location",
                  "Payment Terms",
                  "Shipping Method",
                  "Cost Center",
                  "Created By",
                  "Approved By",
                  "PO Status",
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
                  key={`${r.poId}-${r.itemCode}-${idx}`}
                  className="group hover:bg-slate-50/50 transition-all cursor-pointer"
                  onClick={() => navigate(`/purchase-orders/${r.poId}`)}
                >
                  <td className="px-6 py-4 font-black text-slate-900">{r.poNumber}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600">{r.poDate ? new Date(r.poDate).toLocaleDateString("en-IN") : ""}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-700">{r.vendorName}</td>
                  <td className="px-6 py-4 text-xs font-black text-indigo-600 font-mono">{r.vendorCode || "-"}</td>
                  <td className="px-6 py-4 text-xs font-black text-indigo-600 font-mono">{r.itemCode}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-700">{r.itemDescription}</td>
                  <td className="px-6 py-4 text-xs font-black text-slate-900">{r.qty}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600">{r.uom}</td>
                  <td className="px-6 py-4 text-xs font-black text-slate-900">INR {Number(r.unitPrice || 0).toLocaleString("en-IN")}</td>
                  <td className="px-6 py-4 text-xs font-black text-slate-900">INR {Number(r.totalPrice || 0).toLocaleString("en-IN")}</td>
                  <td className="px-6 py-4 text-xs font-black text-slate-700">INR {Number(r.discount || 0).toLocaleString("en-IN")}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600">
                    INR {Number(r.taxGst || 0).toLocaleString("en-IN")} ({Number(r.gstRate || 0)}%)
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600">{r.deliveryDate ? new Date(r.deliveryDate).toLocaleDateString("en-IN") : ""}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600">{r.deliveryLocation || "-"}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600 max-w-[220px] truncate">{r.paymentTerms || "-"}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600">{r.shippingMethod || "-"}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600">{r.costCenter || "-"}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600">{r.createdBy || "-"}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600">{r.approvedBy || "-"}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-slate-50 text-slate-600 border-slate-100">
                      {r.poStatus}
                    </span>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={20} className="px-8 py-16 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">
                    No PO rows found
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
        total={totalFiltered}
        onPageChange={setPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setPage(1);
        }}
      />
    </div>
  );
};

export default PurchaseOrderManagement;
