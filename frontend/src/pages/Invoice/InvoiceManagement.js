import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getInvoicesAPI, approveInvoiceAPI, rejectInvoiceAPI } from "../../api/purchaseInvoice";
import Pagination from "../../components/common/Pagination";
import { Loader2, Plus, Search, ShieldCheck, XCircle } from "lucide-react";

const InvoiceManagement = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [actioningId, setActioningId] = useState(null);

  const userRole = localStorage.getItem("role");
  const allowedApproverRoles = ["Admin", "Accounts Payable", "Finance Head", "Director", "GM"];
  const canApprove = allowedApproverRoles.includes(userRole);

  const fetchInvoices = async () => {
    const data = await getInvoicesAPI();
    setInvoices(data || []);
  };

  useEffect(() => {
    (async () => {
      try {
        await fetchInvoices();
      } catch (e) {
        console.error("Error fetching invoices:", e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const rows = useMemo(() => {
    const out = [];
    for (const inv of invoices || []) {
      const items = Array.isArray(inv.items) && inv.items.length > 0 ? inv.items : [null];
      for (const it of items) {
        const item = it?.item || {};
        out.push({
          invId: inv._id,
          invoiceNumber: inv.invoiceNumber || "",
          invoiceDate: inv.invoiceDate || inv.createdAt,
          vendorName: inv.supplier?.name || "",
          vendorCode: inv.supplier?.code || "",
          poNumber: inv.poReference?.poNumber || "",
          grnNumber: inv.grnReference?.grnNumber || "",
          itemDescription: it?.description || item.description || item.itemName || "",
          qty: it?.quantity ?? "",
          unitPrice: it?.unitCost ?? "",
          taxAmount: it?.taxAmount ?? 0,
          invoiceTotal: inv.grandTotal ?? "",
          paymentTerms: inv.paymentTerms || "",
          dueDate: inv.dueDate || "",
          matchStatus: inv.matchStatus || "",
          approvedBy: inv.approvedBy?.name || "",
          paymentStatus: inv.status || "",
          approvalStatus: inv.approvalStatus || "",
        });
      }
    }
    return out;
  }, [invoices]);

  const filtered = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    return rows.filter((r) => {
      if (!s) return true;
      return (
        r.invoiceNumber.toLowerCase().includes(s) ||
        r.vendorName.toLowerCase().includes(s) ||
        r.vendorCode.toLowerCase().includes(s) ||
        r.poNumber.toLowerCase().includes(s) ||
        r.grnNumber.toLowerCase().includes(s) ||
        r.itemDescription.toLowerCase().includes(s)
      );
    });
  }, [rows, searchTerm]);

  const total = filtered.length;
  const startIndex = (page - 1) * pageSize;
  const paginated = filtered.slice(startIndex, startIndex + pageSize);


  const approve = async (id) => {
    setActioningId(id);
    try {
      await approveInvoiceAPI(id);
      await fetchInvoices();
    } catch (e) {
      alert(e.response?.data?.message || "Failed to approve invoice");
    } finally {
      setActioningId(null);
    }
  };

  const reject = async (id) => {
    setActioningId(id);
    try {
      await rejectInvoiceAPI(id, "Rejected");
      await fetchInvoices();
    } catch (e) {
      alert(e.response?.data?.message || "Failed to reject invoice");
    } finally {
      setActioningId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-amber-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 px-0 sm:px-2 min-w-0 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Invoice Processing (Accounts Payable)</h1>
          <p className="text-slate-500 text-sm font-medium">Line-item AP view with 3-way match and approval tracking.</p>
        </div>
        <button
          onClick={() => navigate("/invoices/create")}
          className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-2xl font-bold hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 active:scale-95"
        >
          <Plus size={18} />
          Book New Invoice
        </button>
      </div>

      <div className="relative group w-full md:max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={18} />
        <input
          type="text"
          placeholder="Search invoice / vendor / PO / GRN / item..."
          className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-amber-500/20 transition-all font-bold text-sm"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* Mobile Cards */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {paginated.map((r, idx) => (
          <div
            key={`${r.invId}-${r.itemDescription}-${idx}`}
            className="bg-white rounded-[24px] border border-slate-200/60 p-4 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-black text-slate-900 truncate">{r.invoiceNumber}</div>
                <div className="text-[11px] font-bold text-slate-500 truncate">{r.vendorName}</div>
              </div>
              <div className="text-right text-[11px] font-black text-slate-900 shrink-0">
                INR {Number(r.invoiceTotal || 0).toLocaleString("en-IN")}
              </div>
            </div>
            <div className="mt-3 text-[11px] font-bold text-slate-700 line-clamp-2">{r.itemDescription}</div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-600">
              <div>Match: <span className="font-black text-slate-900">{r.matchStatus || "-"}</span></div>
              <div className="text-right">Pay: <span className="font-black text-slate-900">{r.paymentStatus}</span></div>
            </div>
            {canApprove && r.approvalStatus !== "APPROVED" && (
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  disabled={actioningId === r.invId || r.matchStatus !== "MATCHED"}
                  onClick={() => approve(r.invId)}
                  className="flex-1 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  type="button"
                  disabled={actioningId === r.invId}
                  onClick={() => reject(r.invId)}
                  className="flex-1 px-3 py-2 bg-red-50 text-red-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
        {paginated.length === 0 && (
          <div className="px-8 py-16 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">
            No invoice rows found
          </div>
        )}
      </div>

      {/* Desktop Table */}
      <div className="bg-white rounded-[32px] shadow-sm border border-slate-200/60 overflow-hidden hidden md:block">
        <div className="table-responsive custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1900px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                {[
                  "Invoice Number",
                  "Invoice Date",
                  "Vendor Name",
                  "Vendor Code",
                  "PO Number",
                  "GRN Number",
                  "Item Description",
                  "Quantity",
                  "Unit Price",
                  "Tax Amount",
                  "Invoice Total",
                  "Payment Terms",
                  "Due Date",
                  "3-Way Match Status",
                  "Approved By",
                  "Payment Status",
                  "Action",
                ].map((h) => (
                  <th key={h} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.map((r, idx) => {
                const canShowApprove = canApprove && r.approvalStatus !== "APPROVED";
                const canApproveThis = r.matchStatus === "MATCHED";
                const canPay = r.approvalStatus === "APPROVED" && r.paymentStatus !== "PAID";

                return (
                  <tr
                    key={`${r.invId}-${r.itemDescription}-${idx}`}
                    className="group hover:bg-slate-50/50 transition-all cursor-pointer"
                    onClick={() => navigate("/payments/process", { state: { invoice: invoices.find((x) => x._id === r.invId) } })}
                  >
                    <td className="px-6 py-4 font-black text-slate-900">{r.invoiceNumber}</td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-600">{r.invoiceDate ? new Date(r.invoiceDate).toLocaleDateString("en-IN") : ""}</td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-700">{r.vendorName}</td>
                    <td className="px-6 py-4 text-xs font-black text-indigo-600 font-mono">{r.vendorCode || "-"}</td>
                    <td className="px-6 py-4 text-xs font-black text-slate-800">{r.poNumber || "-"}</td>
                    <td className="px-6 py-4 text-xs font-black text-slate-800">{r.grnNumber || "-"}</td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-700 max-w-[280px] truncate">{r.itemDescription}</td>
                    <td className="px-6 py-4 text-xs font-black text-slate-900">{r.qty}</td>
                    <td className="px-6 py-4 text-xs font-black text-slate-900">INR {Number(r.unitPrice || 0).toLocaleString("en-IN")}</td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-600">INR {Number(r.taxAmount || 0).toLocaleString("en-IN")}</td>
                    <td className="px-6 py-4 text-xs font-black text-slate-900">INR {Number(r.invoiceTotal || 0).toLocaleString("en-IN")}</td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-600 max-w-[220px] truncate">{r.paymentTerms || "-"}</td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-600">{r.dueDate ? new Date(r.dueDate).toLocaleDateString("en-IN") : ""}</td>
                    <td className="px-6 py-4 text-xs font-black text-slate-700">{r.matchStatus || "-"}</td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-600">{r.approvedBy || "-"}</td>
                    <td className="px-6 py-4 text-xs font-black text-slate-700">{r.paymentStatus}</td>
                    <td className="px-6 py-4">
                      {canShowApprove ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={actioningId === r.invId || !canApproveThis}
                            onClick={(e) => {
                              e.stopPropagation();
                              approve(r.invId);
                            }}
                            title={canApproveThis ? "Approve invoice" : "Invoice is not 3-way matched"}
                            className="px-3 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-2 disabled:opacity-50"
                          >
                            <ShieldCheck size={14} />
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={actioningId === r.invId}
                            onClick={(e) => {
                              e.stopPropagation();
                              reject(r.invId);
                            }}
                            className="px-3 py-2 bg-red-50 text-red-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center gap-2 disabled:opacity-50"
                          >
                            <XCircle size={14} />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {canPay ? "Pay" : "OK"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={17} className="px-8 py-16 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">
                    No invoice rows found
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

export default InvoiceManagement;
