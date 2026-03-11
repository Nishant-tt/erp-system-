import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPOByIdAPI, exportPOAPI } from "../../api/po";
import { getCompanyAPI } from "../../api/company";
import { downloadAxiosBlobResponse } from "../../utils/downloadFile";
import { ArrowLeft, FileDown, FileText, Loader2, Printer } from "lucide-react";

export default function PurchaseOrderPrint() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [po, setPo] = useState(null);
  const [company, setCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActioning, setIsActioning] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setMessage("");
      try {
        const [poData, companyData] = await Promise.all([getPOByIdAPI(id), getCompanyAPI().catch(() => null)]);
        setPo(poData);
        setCompany(companyData);
      } catch {
        setMessage("Failed to load PO.");
      } finally {
        setIsLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const totals = useMemo(() => {
    const items = po?.items || [];
    const subtotal = items.reduce((s, it) => s + Number(it.taxableValue ?? it.totalCost ?? 0), 0);
    const gst = items.reduce((s, it) => s + Number(it.gstAmount ?? 0), 0);
    const grand = Number(po?.grandTotal ?? po?.totalAmount ?? subtotal + gst);
    return { subtotal, gst, grand };
  }, [po]);

  const handleExport = async (format) => {
    setIsActioning(true);
    setMessage("");
    try {
      const res = await exportPOAPI(id, format);
      const ext = format === "docx" ? "docx" : "pdf";
      downloadAxiosBlobResponse(res, `${po?.poNumber || "PO"}.${ext}`);
    } catch {
      setMessage("Failed to export PO.");
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
      <div className="max-w-4xl mx-auto px-4 py-12">
        <p className="text-sm font-bold text-red-700">{message || "PO not found."}</p>
        <button onClick={() => navigate("/purchase-orders")} className="mt-4 text-primary font-bold uppercase text-xs">
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 space-y-4">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-card { box-shadow: none !important; border: none !important; border-radius: 0 !important; }
          body { background: #fff !important; }
        }
      `}</style>

      <div className="no-print flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <button
          onClick={() => navigate(`/purchase-orders/${id}`)}
          className="px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:border-primary/20 hover:text-slate-900 transition-all"
        >
          <ArrowLeft size={14} />
          Back to Details
        </button>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => window.print()}
            disabled={isActioning}
            className="px-4 py-3 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50"
          >
            <Printer size={14} />
            Print
          </button>
          <button
            onClick={() => handleExport("pdf")}
            disabled={isActioning}
            className="px-4 py-3 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50"
          >
            <FileDown size={14} />
            Generate PDF
          </button>
          <button
            onClick={() => handleExport("docx")}
            disabled={isActioning}
            className="px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:border-primary/20 hover:text-slate-900 transition-all disabled:opacity-50"
          >
            <FileText size={14} />
            Generate Word
          </button>
        </div>
      </div>

      {message && (
        <div className="no-print p-4 rounded-2xl bg-red-50 text-red-700 border border-red-100 text-sm font-bold">
          {message}
        </div>
      )}

      <div className="print-card bg-white border border-slate-200/60 shadow-sm rounded-[28px] overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="min-w-0">
              <div className="text-sm font-black text-slate-900 uppercase tracking-widest">Purchase Order</div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{po.poNumber}</div>
              <div className="text-xs font-bold text-slate-500 mt-1">
                PO Date: {po.orderDate ? new Date(po.orderDate).toLocaleDateString("en-IN") : "-"}
              </div>
            </div>

            <div className="text-xs font-bold text-slate-600">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Company</div>
              <div className="text-sm font-black text-slate-900">{company?.name || "Company"}</div>
              {(company?.address?.line1 || company?.address?.city) && (
                <div className="mt-1 text-slate-500 font-medium">
                  {[company?.address?.line1, company?.address?.line2, company?.address?.city, company?.address?.state, company?.address?.pincode]
                    .filter(Boolean)
                    .join(", ")}
                </div>
              )}
              {company?.taxInfo?.gstin && <div className="mt-1 text-slate-500">GSTIN: {company.taxInfo.gstin}</div>}
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-slate-100">
          <div className="min-w-0">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Supplier</div>
            <div className="text-sm font-black text-slate-900">{po.supplier?.name || "-"}</div>
            <div className="text-xs font-bold text-slate-500 mt-1">Code: {po.supplier?.code || "-"}</div>
            {po.supplier?.contact && <div className="text-xs font-medium text-slate-500 mt-1">Contact: {po.supplier.contact}</div>}
          </div>

          <div className="min-w-0">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Delivery</div>
            <div className="text-xs font-bold text-slate-600 mt-1">
              Date: {po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate).toLocaleDateString("en-IN") : "-"}
            </div>
            <div className="text-xs font-bold text-slate-600 mt-1">Location: {po.deliveryLocation || "-"}</div>
            <div className="text-xs font-bold text-slate-600 mt-1">Payment Terms: {po.paymentTerms || po.terms || "-"}</div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100">
                  <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item</th>
                  <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Qty</th>
                  <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Unit Price</th>
                  <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">GST</th>
                  <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(po.items || []).map((it, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-3">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{it.item?.itemCode || ""}</div>
                      <div className="text-sm font-bold text-slate-900">{it.item?.itemName || it.description || "-"}</div>
                    </td>
                    <td className="px-4 py-3 text-center text-xs font-black text-slate-700">
                      {it.quantity} {it.unit || it.item?.uom || ""}
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-bold text-slate-600">
                      INR {Number(it.unitCost || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-bold text-slate-600">
                      INR {Number(it.gstAmount || 0).toLocaleString("en-IN")} ({Number(it.gstRate || 0)}%)
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-black text-slate-900">
                      INR {Number(it.lineTotal || 0).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="text-xs font-bold text-slate-500">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notes</div>
              <div className="mt-1">{po.notes || po.remarks || "-"}</div>
            </div>
            <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-4 text-xs font-bold text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span>INR {totals.subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-slate-500">GST</span>
                <span>INR {totals.gst.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between mt-3 pt-3 border-t border-slate-200">
                <span className="text-slate-500">Grand Total</span>
                <span className="text-sm font-black text-slate-900">INR {totals.grand.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs font-bold text-slate-600">
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prepared By</div>
              <div className="mt-2 text-slate-900">{po.createdBy?.name || "-"}</div>
              <div className="mt-6 border-t border-slate-200 pt-2">Signature</div>
            </div>
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Approved By</div>
              <div className="mt-2 text-slate-900">{po.approvedBy?.name || "-"}</div>
              <div className="mt-6 border-t border-slate-200 pt-2">Signature</div>
            </div>
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Received By</div>
              <div className="mt-2 text-slate-900">________________</div>
              <div className="mt-6 border-t border-slate-200 pt-2">Signature</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

