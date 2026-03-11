import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPOByIdAPI, approvePOAPI, rejectPOAPI, updatePOStatusAPI, exportPOAPI } from "../../api/po";
import { downloadAxiosBlobResponse } from "../../utils/downloadFile";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  FileText,
  IndianRupee,
  CheckCircle2,
  ShieldCheck,
  XCircle,
  FileDown,
} from "lucide-react";

export default function PurchaseOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [po, setPo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActioning, setIsActioning] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const userRole = localStorage.getItem("role");

  const load = async () => {
    try {
      const data = await getPOByIdAPI(id);
      setPo(data);
    } catch {
      setMessage({ type: "error", text: "Failed to load PO details." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const allowedApproverRoles = ["Admin", "Manager", "Purchase Manager", "Finance Head", "Director", "GM"];
  const canAttemptApprove = allowedApproverRoles.includes(userRole) && po?.approvalStatus === "PENDING_APPROVAL";

  const approve = async () => {
    setIsActioning(true);
    try {
      await approvePOAPI(id);
      setMessage({ type: "success", text: "PO approved and issued (OPEN)." });
      await load();
    } catch (e) {
      setMessage({ type: "error", text: e.response?.data?.message || "Failed to approve PO." });
    } finally {
      setIsActioning(false);
    }
  };

  const reject = async () => {
    setIsActioning(true);
    try {
      await rejectPOAPI(id, "Rejected");
      setMessage({ type: "success", text: "PO rejected." });
      await load();
    } catch (e) {
      setMessage({ type: "error", text: e.response?.data?.message || "Failed to reject PO." });
    } finally {
      setIsActioning(false);
    }
  };

  const canAdminOverrideStatus = userRole === "Admin";
  const setOperationalStatus = async (status) => {
    setIsActioning(true);
    try {
      await updatePOStatusAPI(id, status);
      setMessage({ type: "success", text: `PO status updated to ${status}` });
      await load();
    } catch (e) {
      setMessage({ type: "error", text: e.response?.data?.message || "Failed to update PO status." });
    } finally {
      setIsActioning(false);
    }
  };

  const handleExport = async (format) => {
    setIsActioning(true);
    try {
      const res = await exportPOAPI(id, format);
      const ext = format === "docx" ? "docx" : "pdf";
      downloadAxiosBlobResponse(res, `${po?.poNumber || "PO"}.${ext}`);
    } catch (e) {
      setMessage({ type: "error", text: e.response?.data?.message || "Failed to export PO." });
    } finally {
      setIsActioning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!po) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="mx-auto text-slate-300 mb-4" size={48} />
        <h2 className="text-xl font-black text-slate-900 uppercase">PO Not Found</h2>
        <button onClick={() => navigate("/purchase-orders")} className="mt-4 text-primary font-bold uppercase text-xs">
          Return to List
        </button>
      </div>
    );
  }

  const total = Number(po.grandTotal || po.totalAmount || 0);
  const approvalStatus = po.approvalStatus || "(legacy)";

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 px-2 sm:px-0 min-w-0 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="min-w-0">
          <button
            onClick={() => navigate("/purchase-orders")}
            className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors font-bold text-xs uppercase tracking-widest mb-2"
          >
            <ArrowLeft size={14} />
            Back to Orders
          </button>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{po.poNumber}</h1>
            <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border bg-slate-50 text-slate-600 border-slate-100">
              {po.status}
            </span>
            <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border bg-amber-50 text-amber-700 border-amber-100">
              {approvalStatus}
            </span>
          </div>
          <p className="text-slate-500 font-medium mt-1">
            Supplier: <span className="font-black text-slate-700">{po.supplier?.name}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={() => handleExport("pdf")}
            disabled={isActioning}
            className="flex-1 md:flex-none px-4 py-3 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50"
          >
            <FileDown size={14} />
            Generate PDF
          </button>
          <button
            onClick={() => handleExport("docx")}
            disabled={isActioning}
            className="flex-1 md:flex-none px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:border-primary/20 hover:text-slate-900 transition-all disabled:opacity-50"
          >
            <FileText size={14} />
            Generate Word
          </button>
        </div>
      </div>

      {message.text && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
              : "bg-red-50 text-red-700 border border-red-100"
          }`}
        >
          {message.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <p className="text-sm font-bold">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[40px] border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Line Items</h2>
              <FileText className="text-slate-200" size={22} />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Qty</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Taxable</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">GST</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(po.items || []).map((it, idx) => (
                    <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{it.item?.itemCode}</span>
                        <p className="text-sm font-bold text-slate-900">{it.item?.itemName || it.description}</p>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className="text-xs font-black text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                          {it.quantity} {it.unit}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right text-xs font-bold text-slate-500">
                        INR {Number(it.taxableValue || it.totalCost || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="px-8 py-6 text-right text-xs font-bold text-slate-500">
                        INR {Number(it.gstAmount || 0).toLocaleString("en-IN")} ({Number(it.gstRate || 0)}%)
                      </td>
                      <td className="px-8 py-6 text-right">
                        <p className="text-sm font-black text-slate-900">INR {Number(it.lineTotal || 0).toLocaleString("en-IN")}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-900 text-white">
                    <td colSpan="4" className="px-8 py-6 text-sm font-black uppercase tracking-widest text-slate-400 text-right">
                      Grand Total
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-1 text-2xl font-black tracking-tighter">
                        <IndianRupee size={20} className="text-primary" />
                        {total.toLocaleString("en-IN")}
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-[40px] border border-slate-200/60 shadow-sm p-8 space-y-4">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck size={14} className="text-amber-600" /> Approval
            </h2>
            <div className="text-xs font-bold text-slate-600">
              Required role(s): <span className="font-black">{(po.requiredApprovalRoles || []).join(", ") || "Not set"}</span>
            </div>

            {canAttemptApprove ? (
              <>
                <button
                  onClick={approve}
                  disabled={isActioning}
                  className="w-full py-3.5 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={16} /> Approve & Issue
                </button>
                <button
                  onClick={reject}
                  disabled={isActioning}
                  className="w-full py-3.5 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <XCircle size={16} /> Reject
                </button>
              </>
            ) : (
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {po.approvalStatus === "APPROVED" ? "Approved" : "Not pending approval or you do not have access."}
              </p>
            )}
          </div>

          {canAdminOverrideStatus && (
            <div className="bg-white rounded-[40px] border border-slate-200/60 shadow-sm p-8 space-y-3">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin Status Override</h2>
              <button
                onClick={() => setOperationalStatus("CANCELLED")}
                disabled={isActioning}
                className="w-full py-3.5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50"
              >
                Cancel PO
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

