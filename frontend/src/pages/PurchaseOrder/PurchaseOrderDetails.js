import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPOByIdAPI, updatePOStatusAPI } from "../../api/po";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  FileText,
  IndianRupee,
  CheckCircle2,
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

  const canUpdateStatus = userRole === "Admin" || userRole === "Manager";

  const setStatus = async (status) => {
    setIsActioning(true);
    try {
      await updatePOStatusAPI(id, status);
      setMessage({ type: "success", text: `PO status updated to ${status}` });
      await load();
    } catch {
      setMessage({ type: "error", text: "Failed to update PO status." });
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

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 px-2 sm:px-0 min-w-0 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <button
            onClick={() => navigate("/purchase-orders")}
            className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors font-bold text-xs uppercase tracking-widest mb-2"
          >
            <ArrowLeft size={14} />
            Back to Orders
          </button>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{po.poNumber}</h1>
            <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border bg-slate-50 text-slate-600 border-slate-100">
              {po.status}
            </span>
          </div>
          <p className="text-slate-500 font-medium mt-1">
            Supplier: <span className="font-black text-slate-700">{po.supplier?.name}</span>
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
                        ₹{Number(it.taxableValue || it.totalCost || 0).toLocaleString("en-IN")}
                      </td>
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
          {canUpdateStatus && (
            <div className="bg-white rounded-[40px] border border-slate-200/60 shadow-sm p-8 space-y-3">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Approval / Status</h2>
              <button
                onClick={() => setStatus("OPEN")}
                disabled={isActioning}
                className="w-full py-3.5 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all disabled:opacity-50"
              >
                Mark Approved (OPEN)
              </button>
              <button
                onClick={() => setStatus("CANCELLED")}
                disabled={isActioning}
                className="w-full py-3.5 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all disabled:opacity-50"
              >
                Reject / Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

