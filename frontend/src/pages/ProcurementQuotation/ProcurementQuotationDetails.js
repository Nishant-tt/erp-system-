import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getProcurementQuotationByIdAPI,
  approveProcurementQuotationAPI,
  rejectProcurementQuotationAPI,
  sendProcurementQuotationToSuppliersAPI,
  submitProcurementQuotationAPI,
} from "../../api/procurementQuotation";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Send,
  ThumbsUp,
  ThumbsDown,
  IndianRupee,
} from "lucide-react";

export default function ProcurementQuotationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [q, setQ] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActioning, setIsActioning] = useState(false);
  const [comments, setComments] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  const userRole = localStorage.getItem("role");

  const load = async () => {
    try {
      const data = await getProcurementQuotationByIdAPI(id);
      setQ(data);
    } catch (e) {
      setMessage({ type: "error", text: "Failed to load quotation details." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const canApprove = (userRole === "Admin" || userRole === "Manager") && q?.status === "PENDING_APPROVAL";
  const canSubmit = userRole === "Admin" && q?.status === "DRAFT";
  const canSend = userRole === "Admin" && q?.status === "APPROVED";

  const handleSubmit = async () => {
    setIsActioning(true);
    try {
      await submitProcurementQuotationAPI(id);
      setMessage({ type: "success", text: "Quotation submitted for approval!" });
      await load();
    } catch {
      setMessage({ type: "error", text: "Failed to submit quotation." });
    } finally {
      setIsActioning(false);
    }
  };

  const handleApprove = async () => {
    setIsActioning(true);
    try {
      await approveProcurementQuotationAPI(id, { comments });
      setMessage({ type: "success", text: "Quotation approved." });
      await load();
    } catch {
      setMessage({ type: "error", text: "Failed to approve quotation." });
    } finally {
      setIsActioning(false);
    }
  };

  const handleReject = async () => {
    if (!comments.trim()) {
      setMessage({ type: "error", text: "Please provide a reason in comments." });
      return;
    }
    setIsActioning(true);
    try {
      await rejectProcurementQuotationAPI(id, { reason: comments });
      setMessage({ type: "success", text: "Quotation rejected." });
      await load();
    } catch {
      setMessage({ type: "error", text: "Failed to reject quotation." });
    } finally {
      setIsActioning(false);
    }
  };

  const handleSendToSuppliers = async () => {
    setIsActioning(true);
    try {
      await sendProcurementQuotationToSuppliersAPI(id);
      setMessage({ type: "success", text: "Quotation marked as sent to suppliers." });
      await load();
    } catch {
      setMessage({ type: "error", text: "Failed to send quotation." });
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

  if (!q) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="mx-auto text-slate-300 mb-4" size={48} />
        <h2 className="text-xl font-black text-slate-900 uppercase">Quotation Not Found</h2>
        <button onClick={() => navigate("/procurement-quotations")} className="mt-4 text-primary font-bold uppercase text-xs">
          Return to List
        </button>
      </div>
    );
  }

  const statusPill =
    q.status === "APPROVED"
      ? "bg-emerald-50 text-emerald-600 border-emerald-100"
      : q.status === "REJECTED"
        ? "bg-red-50 text-red-600 border-red-100"
        : q.status === "PENDING_APPROVAL"
          ? "bg-amber-50 text-amber-600 border-amber-100"
          : q.status === "SENT"
            ? "bg-indigo-50 text-indigo-600 border-indigo-100"
            : "bg-slate-100 text-slate-600 border-slate-200";

  const StatusIcon =
    q.status === "APPROVED" ? CheckCircle2 : q.status === "REJECTED" ? XCircle : Clock;

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 px-2 sm:px-0 min-w-0 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <button
            onClick={() => navigate("/procurement-quotations")}
            className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors font-bold text-xs uppercase tracking-widest mb-2"
          >
            <ArrowLeft size={14} />
            Back to List
          </button>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{q.quotationNumber}</h1>
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 ${statusPill}`}>
              <StatusIcon size={14} />
              {q.status.replaceAll("_", " ")}
            </span>
          </div>
          <p className="text-slate-500 font-medium mt-1">
            PR: <span className="font-black text-slate-700">{q.prReference?.prNumber}</span>
          </p>
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
            <div className="p-8 border-b border-slate-100 bg-slate-50/30">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Line Items</h2>
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
                  {(q.items || []).map((it, idx) => (
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
                      <td className="px-8 py-6 text-right text-xs font-bold text-slate-500">₹{Number(it.taxableValue || 0).toLocaleString("en-IN")}</td>
                      <td className="px-8 py-6 text-right text-xs font-bold text-slate-500">
                        ₹{Number(it.gstAmount || 0).toLocaleString("en-IN")} ({Number(it.gstRate || 0)}%)
                      </td>
                      <td className="px-8 py-6 text-right">
                        <p className="text-sm font-black text-slate-900">₹{Number(it.lineTotal || 0).toLocaleString("en-IN")}</p>
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
                        {Number(q.grandTotal || 0).toLocaleString("en-IN")}
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-[40px] border border-slate-200/60 shadow-sm p-8 space-y-4">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Suppliers</h2>
            <div className="flex flex-wrap gap-2">
              {(q.suppliers || []).map((s) => (
                <span key={s._id} className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-600">
                  {s.name}
                </span>
              ))}
              {(q.suppliers || []).length === 0 && (
                <span className="text-xs font-bold text-slate-400">No suppliers selected.</span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {(canApprove || canSubmit || canSend) && (
            <div className="bg-white rounded-[40px] border border-slate-200/60 shadow-sm p-8 space-y-4">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Workflow Actions</h2>

              {(canApprove || canSubmit) && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Comments</label>
                  <textarea
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium outline-none focus:border-primary/20 transition-all resize-none"
                    placeholder="Add notes for audit trail..."
                    rows={3}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                  />
                </div>
              )}

              {canApprove && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleApprove}
                    disabled={isActioning}
                    className="py-3.5 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                  >
                    {isActioning ? <Loader2 size={14} className="animate-spin" /> : <ThumbsUp size={14} />}
                    Approve
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={isActioning}
                    className="py-3.5 bg-red-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
                  >
                    {isActioning ? <Loader2 size={14} className="animate-spin" /> : <ThumbsDown size={14} />}
                    Reject
                  </button>
                </div>
              )}

              {canSubmit && (
                <button
                  onClick={handleSubmit}
                  disabled={isActioning}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                >
                  {isActioning ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  Submit for Approval
                </button>
              )}

              {canSend && (
                <button
                  onClick={handleSendToSuppliers}
                  disabled={isActioning}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50"
                >
                  {isActioning ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  Mark Sent to Suppliers
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

