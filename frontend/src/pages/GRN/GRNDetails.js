import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getGRNByIdAPI, verifyGRNAPI, rejectGRNAPI, exportGRNAPI } from "../../api/grn";
import { downloadAxiosBlobResponse } from "../../utils/downloadFile";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  FileDown,
  FileText,
} from "lucide-react";

export default function GRNDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [grn, setGrn] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActioning, setIsActioning] = useState(false);
  const [comments, setComments] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  const userRole = localStorage.getItem("role");

  const load = async () => {
    try {
      const data = await getGRNByIdAPI(id);
      setGrn(data);
    } catch {
      setMessage({ type: "error", text: "Failed to load GRN details." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const verifierRoles = ["Admin", "Store Manager", "Quality Inspector", "Inventory Controller"];
  const canVerify = verifierRoles.includes(userRole) && grn?.verificationStatus === "PENDING";

  const handleExport = async (format) => {
    setIsActioning(true);
    try {
      const res = await exportGRNAPI(id, format);
      const ext = format === "docx" ? "docx" : "pdf";
      downloadAxiosBlobResponse(res, `${grn?.grnNumber || "GRN"}.${ext}`);
    } catch {
      setMessage({ type: "error", text: "Failed to export GRN." });
    } finally {
      setIsActioning(false);
    }
  };

  const handleVerify = async () => {
    setIsActioning(true);
    try {
      await verifyGRNAPI(id, comments);
      setMessage({ type: "success", text: "GRN verified." });
      await load();
    } catch {
      setMessage({ type: "error", text: "Failed to verify GRN." });
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
      await rejectGRNAPI(id, comments);
      setMessage({ type: "success", text: "GRN rejected." });
      await load();
    } catch {
      setMessage({ type: "error", text: "Failed to reject GRN." });
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

  if (!grn) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="mx-auto text-slate-300 mb-4" size={48} />
        <h2 className="text-xl font-black text-slate-900 uppercase">GRN Not Found</h2>
        <button onClick={() => navigate("/grns")} className="mt-4 text-primary font-bold uppercase text-xs">
          Return to List
        </button>
      </div>
    );
  }

  const verificationPill =
    grn.verificationStatus === "VERIFIED"
      ? "bg-emerald-50 text-emerald-600 border-emerald-100"
      : grn.verificationStatus === "REJECTED"
        ? "bg-red-50 text-red-600 border-red-100"
        : "bg-amber-50 text-amber-600 border-amber-100";

  const VerificationIcon =
    grn.verificationStatus === "VERIFIED" ? CheckCircle2 : grn.verificationStatus === "REJECTED" ? XCircle : Clock;

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 px-2 sm:px-0 min-w-0 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="min-w-0">
          <button
            onClick={() => navigate("/grns")}
            className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 transition-colors font-bold text-xs uppercase tracking-widest mb-2"
          >
            <ArrowLeft size={14} />
            Back to GRNs
          </button>
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{grn.grnNumber}</h1>
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 ${verificationPill}`}>
              <VerificationIcon size={14} />
              {grn.verificationStatus}
            </span>
          </div>
          <p className="text-slate-500 font-medium mt-1">
            PO: <span className="font-black text-slate-700">{grn.poReference?.poNumber}</span> - Supplier:{" "}
            <span className="font-black text-slate-700">{grn.supplier?.name}</span>
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
            className="flex-1 md:flex-none px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:border-emerald-500/20 hover:text-slate-900 transition-all disabled:opacity-50"
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
            <div className="p-8 border-b border-slate-100 bg-slate-50/30">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Received Items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Ordered</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Received</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Rejected</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Accepted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(grn.items || []).map((it, idx) => {
                    const received = Number(it.receivedQuantity || 0);
                    const rejected = Number(it.rejectedQuantity || 0);
                    const accepted = Math.max(0, received - rejected);
                    return (
                      <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-6">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{it.item?.itemCode}</span>
                          <p className="text-sm font-bold text-slate-900">{it.item?.itemName}</p>
                        </td>
                        <td className="px-8 py-6 text-center text-xs font-black text-slate-700">{it.orderedQuantity}</td>
                        <td className="px-8 py-6 text-center text-xs font-black text-slate-700">{received}</td>
                        <td className="px-8 py-6 text-center text-xs font-black text-red-600">{rejected}</td>
                        <td className="px-8 py-6 text-center text-xs font-black text-emerald-700">{accepted}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {canVerify && (
            <div className="bg-white rounded-[40px] border border-slate-200/60 shadow-sm p-8 space-y-4">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verification</h2>
              <textarea
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium outline-none focus:border-emerald-500/20 transition-all resize-none"
                placeholder="Comments / reason..."
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleVerify}
                  disabled={isActioning}
                  className="py-3.5 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all disabled:opacity-50"
                >
                  {isActioning ? <Loader2 size={14} className="animate-spin" /> : <ThumbsUp size={14} />}
                  Verify
                </button>
                <button
                  onClick={handleReject}
                  disabled={isActioning}
                  className="py-3.5 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-700 transition-all disabled:opacity-50"
                >
                  {isActioning ? <Loader2 size={14} className="animate-spin" /> : <ThumbsDown size={14} />}
                  Reject
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
