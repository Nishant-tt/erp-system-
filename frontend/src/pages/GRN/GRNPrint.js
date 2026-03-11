import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getGRNByIdAPI, exportGRNAPI } from "../../api/grn";
import { getCompanyAPI } from "../../api/company";
import { downloadAxiosBlobResponse } from "../../utils/downloadFile";
import { ArrowLeft, FileDown, FileText, Loader2, Printer } from "lucide-react";

export default function GRNPrint() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [grn, setGrn] = useState(null);
  const [company, setCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActioning, setIsActioning] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setMessage("");
      try {
        const [grnData, companyData] = await Promise.all([getGRNByIdAPI(id), getCompanyAPI().catch(() => null)]);
        setGrn(grnData);
        setCompany(companyData);
      } catch {
        setMessage("Failed to load GRN.");
      } finally {
        setIsLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleExport = async (format) => {
    setIsActioning(true);
    setMessage("");
    try {
      const res = await exportGRNAPI(id, format);
      const ext = format === "docx" ? "docx" : "pdf";
      downloadAxiosBlobResponse(res, `${grn?.grnNumber || "GRN"}.${ext}`);
    } catch {
      setMessage("Failed to export GRN.");
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
      <div className="max-w-4xl mx-auto px-4 py-12">
        <p className="text-sm font-bold text-red-700">{message || "GRN not found."}</p>
        <button onClick={() => navigate("/grns")} className="mt-4 text-primary font-bold uppercase text-xs">
          Back to GRNs
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
          onClick={() => navigate(`/grns/${id}`)}
          className="px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:border-emerald-500/20 hover:text-slate-900 transition-all"
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
            className="px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:border-emerald-500/20 hover:text-slate-900 transition-all disabled:opacity-50"
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
              <div className="text-sm font-black text-slate-900 uppercase tracking-widest">Goods Receipt Note</div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{grn.grnNumber}</div>
              <div className="text-xs font-bold text-slate-500 mt-1">
                GRN Date: {grn.receivedDate ? new Date(grn.receivedDate).toLocaleDateString("en-IN") : "-"}
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
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PO Reference</div>
            <div className="text-sm font-black text-slate-900">{grn.poReference?.poNumber || "-"}</div>
            <div className="text-xs font-bold text-slate-500 mt-1">Warehouse: {grn.warehouseLocation || "-"}</div>
            <div className="text-xs font-bold text-slate-500 mt-1">Inspection: {grn.inspectionStatus || "-"}</div>
          </div>

          <div className="min-w-0">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Supplier</div>
            <div className="text-sm font-black text-slate-900">{grn.supplier?.name || "-"}</div>
            <div className="text-xs font-bold text-slate-500 mt-1">Code: {grn.supplier?.code || "-"}</div>
            {grn.supplier?.contact && <div className="text-xs font-medium text-slate-500 mt-1">Contact: {grn.supplier.contact}</div>}
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100">
                  <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item</th>
                  <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Ordered</th>
                  <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Received</th>
                  <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Rejected</th>
                  <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Accepted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(grn.items || []).map((it, idx) => {
                  const received = Number(it.receivedQuantity || 0);
                  const rejected = Number(it.rejectedQuantity || 0);
                  const accepted = Number(it.acceptedQuantity ?? Math.max(0, received - rejected));
                  return (
                    <tr key={idx}>
                      <td className="px-4 py-3">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{it.item?.itemCode || ""}</div>
                        <div className="text-sm font-bold text-slate-900">{it.item?.itemName || "-"}</div>
                        <div className="text-xs font-bold text-slate-500 mt-1">{it.unit || it.item?.uom || ""}</div>
                      </td>
                      <td className="px-4 py-3 text-center text-xs font-black text-slate-700">{it.orderedQuantity ?? ""}</td>
                      <td className="px-4 py-3 text-center text-xs font-black text-slate-700">{received}</td>
                      <td className="px-4 py-3 text-center text-xs font-black text-red-600">{rejected}</td>
                      <td className="px-4 py-3 text-center text-xs font-black text-emerald-700">{accepted}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs font-bold text-slate-600">
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Received By</div>
              <div className="mt-2 text-slate-900">{grn.receivedBy?.name || "-"}</div>
              <div className="mt-6 border-t border-slate-200 pt-2">Signature</div>
            </div>
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified By</div>
              <div className="mt-2 text-slate-900">{grn.verifiedBy?.name || "-"}</div>
              <div className="mt-6 border-t border-slate-200 pt-2">Signature</div>
            </div>
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Remarks</div>
              <div className="mt-2 text-slate-900">{grn.remarks || "-"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

