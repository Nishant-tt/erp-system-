import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPRsAPI } from "../../api/pr";
import { getSuppliersAPI } from "../../api/supplier";
import { createProcurementQuotationFromPRAPI } from "../../api/procurementQuotation";
import { Loader2, ArrowLeft, FileText, CheckCircle2, AlertCircle } from "lucide-react";

export default function CreateProcurementQuotation() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("role");
  const [prs, setPrs] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedPrId, setSelectedPrId] = useState("");
  const [selectedSupplierIds, setSelectedSupplierIds] = useState([]);
  const [rfqDate, setRfqDate] = useState(new Date().toISOString().split("T")[0]);
  const [requestedDeliveryDate, setRequestedDeliveryDate] = useState("");
  const [quotationDueDate, setQuotationDueDate] = useState("");
  const [termsConditions, setTermsConditions] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [remarks, setRemarks] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const allowedRoles = ["Admin", "Purchase Manager"];
    if (!allowedRoles.includes(userRole)) {
      navigate("/dashboard");
      return;
    }
    const load = async () => {
      try {
        const [prsData, suppliersData] = await Promise.all([getPRsAPI(), getSuppliersAPI()]);
        setPrs(prsData.filter((p) => p.status === "APPROVED"));
        setSuppliers((suppliersData || []).filter((s) => s.isActive));
      } catch (e) {
        setMessage({ type: "error", text: "Failed to load PRs/suppliers." });
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [navigate, userRole]);

  const selectedPR = useMemo(() => prs.find((p) => p._id === selectedPrId), [prs, selectedPrId]);

  useEffect(() => {
    // Auto-fill requested delivery date from PR requiredDate
    if (selectedPR?.requiredDate) {
      const d = new Date(selectedPR.requiredDate);
      if (!Number.isNaN(d.getTime())) setRequestedDeliveryDate(d.toISOString().split("T")[0]);
    }
  }, [selectedPR]);

  // Suggested suppliers = union of preferredSupplier per item (if present).
  const suggestedSupplierIds = useMemo(() => {
    const set = new Set();
    for (const it of selectedPR?.items || []) {
      const preferred = it?.item?.preferredSupplier;
      if (preferred) set.add(preferred);
    }
    return [...set];
  }, [selectedPR]);

  useEffect(() => {
    // Auto-select suggested suppliers when PR changes
    setSelectedSupplierIds(suggestedSupplierIds);
  }, [suggestedSupplierIds]);

  const toggleSupplier = (id) => {
    setSelectedSupplierIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const subtotal = useMemo(() => {
    return (selectedPR?.items || []).reduce((sum, it) => sum + (it.totalCost || 0), 0);
  }, [selectedPR]);

  const handleCreate = async (status = "DRAFT") => {
    if (!selectedPrId) {
      setMessage({ type: "error", text: "Please select an APPROVED PR." });
      return;
    }
    setIsSubmitting(true);
    setMessage({ type: "", text: "" });
    try {
      const q = await createProcurementQuotationFromPRAPI(selectedPrId, {
        suppliers: selectedSupplierIds,
        status,
        rfqDate,
        requestedDeliveryDate,
        quotationDueDate,
        termsConditions,
        currency,
        remarks,
      });
      setMessage({ type: "success", text: "Quotation created successfully." });
      setTimeout(() => navigate(`/procurement-quotations/${q._id}`), 800);
    } catch (e) {
      setMessage({ type: "error", text: e.message || "Failed to create quotation." });
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="animate-spin text-primary" size={32} />
        <span className="ml-3 text-sm font-bold text-slate-400 uppercase tracking-widest">Loading...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 px-2 sm:px-0 min-w-0 animate-in slide-in-from-bottom-8 duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <button
            onClick={() => navigate("/procurement-quotations")}
            className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors font-bold text-xs uppercase tracking-widest mb-2"
          >
            <ArrowLeft size={14} />
            Back to Quotations
          </button>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <FileText className="text-primary" size={28} />
            Create Procurement Quotation
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            Quotation includes GST and the eligible suppliers for the PR items.
          </p>
        </div>
      </div>

      {message.text && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
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
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-200/60 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                Approved PR
              </label>
              <select
                className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 transition-all font-bold text-sm appearance-none"
                value={selectedPrId}
                onChange={(e) => setSelectedPrId(e.target.value)}
              >
                <option value="">Select PR...</option>
                {prs.map((pr) => (
                  <option key={pr._id} value={pr._id}>
                    {pr.prNumber} - {pr.department?.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedPR && (
              <div className="space-y-3">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">PR Items</p>
                <div className="space-y-2">
                  {(selectedPR.items || []).map((it, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <p className="font-black text-slate-900 truncate">
                          {it.item?.itemCode} · {it.item?.itemName}
                        </p>
                        <p className="text-xs text-slate-500 font-bold">
                          Qty: {it.quantity} {it.unit} · Est: ₹{Number(it.estimatedUnitCost || 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-black text-slate-900">₹{Number(it.totalCost || 0).toLocaleString()}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          GST: {Number(it.item?.gstRate || 0)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-200/60 space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-4">
              RFQ Details
            </h3>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">RFQ Date</label>
                <input
                  type="date"
                  className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 font-bold text-sm"
                  value={rfqDate}
                  onChange={(e) => setRfqDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Requested Delivery Date</label>
                <input
                  type="date"
                  className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 font-bold text-sm"
                  value={requestedDeliveryDate}
                  onChange={(e) => setRequestedDeliveryDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quotation Due Date</label>
                <input
                  type="date"
                  className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 font-bold text-sm"
                  value={quotationDueDate}
                  onChange={(e) => setQuotationDueDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Currency</label>
                <select
                  className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 font-bold text-sm"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Terms & Conditions</label>
                <textarea
                  className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-3xl outline-none focus:border-primary/20 font-bold text-sm min-h-[90px] resize-none"
                  value={termsConditions}
                  onChange={(e) => setTermsConditions(e.target.value)}
                  placeholder="Payment, delivery, warranty, etc."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Remarks</label>
                <textarea
                  className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-3xl outline-none focus:border-primary/20 font-bold text-sm min-h-[70px] resize-none"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Any additional notes for vendors..."
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-200/60 space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-4">
              Supplier Selection
            </h3>
            <p className="text-xs text-slate-500 font-bold">
              Suggested suppliers are auto-selected based on each item&apos;s preferred supplier (if set).
            </p>

            <div className="space-y-2 max-h-[360px] overflow-y-auto custom-scrollbar pr-2">
              {suppliers.map((s) => {
                const checked = selectedSupplierIds.includes(s._id);
                const isSuggested = suggestedSupplierIds.includes(s._id);
                return (
                  <button
                    key={s._id}
                    type="button"
                    onClick={() => toggleSupplier(s._id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      checked ? "border-primary/30 bg-primary/5" : "border-slate-100 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-black text-slate-900 truncate">{s.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
                          GSTIN: {s.taxInfo?.gstin || "N/A"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {isSuggested && (
                          <span className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[9px] font-black uppercase tracking-widest">
                            Suggested
                          </span>
                        )}
                        <span
                          className={`w-5 h-5 rounded-full border-2 ${
                            checked ? "border-primary bg-primary" : "border-slate-200"
                          }`}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl shadow-slate-900/20 space-y-4">
            <p className="text-[10px] font-black opacity-60 uppercase tracking-widest">PR Subtotal (No GST)</p>
            <p className="text-4xl font-black tracking-tighter">₹{Number(subtotal).toLocaleString()}</p>

            <button
              onClick={() => handleCreate("DRAFT")}
              disabled={isSubmitting}
              className="w-full py-4 bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin inline mr-2" size={16} /> : null}
              Save Draft Quotation
            </button>
            <button
              onClick={() => handleCreate("PENDING_APPROVAL")}
              disabled={isSubmitting}
              className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin inline mr-2" size={16} /> : null}
              Send for Manager Approval
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
