import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getModulesAPI } from "../../api/modules";
import { ArrowRight, LayoutDashboard, Loader2 } from "lucide-react";

const MENU_DESCRIPTIONS = {
  "/prs": "Create and track purchase requisitions.",
  "/prs/create": "Raise a new requisition from your department.",
  "/prs/approvals": "Review and approve pending requisitions.",

  "/procurement-quotations": "Manage RFQs and compare vendor quotes.",
  "/procurement-quotations/create": "Create an RFQ from an approved PR.",
  "/procurement-quotations/approvals": "Approve RFQs before sending to vendors.",

  "/purchase-orders": "Create and track purchase orders.",
  "/purchase-orders/create": "Create a new PO or from an RFQ.",
  "/purchase-orders/approvals": "Approve POs based on value limits.",

  "/grns": "Record goods received against approved POs.",
  "/grns/create": "Create a GRN for incoming materials.",
  "/grns/approvals": "Verify and accept/reject received items.",

  "/invoices": "3-way match invoices against PO and GRN.",
  "/invoices/create": "Record a supplier invoice for matching.",
  "/payments": "Track vendor payment processing.",
  "/payments/process": "Approve and process payments.",

  "/leads": "Track leads pipeline and sources.",
  "/opportunities": "Manage opportunities and stages.",
  "/quotations": "Create and manage sales quotations.",
  "/sales-orders": "Manage sales orders.",
  "/delivery-notes": "Create delivery notes for dispatch.",
  "/sales-invoices": "Generate sales invoices.",
  "/customer-payments": "Record and track customer payments.",

  "/performance": "Operational performance dashboard.",
  "/sales-analytics": "Sales analytics and KPIs.",
  "/trial-balance": "Trial balance summary.",
  "/journal-entries": "Post and review journal entries.",
  "/chart-of-accounts": "Manage chart of accounts.",
};

export default function ModuleLanding() {
  const location = useLocation();
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getModulesAPI();
        setModules(data || []);
      } catch (e) {
        // ignore; sidebar/header already logs if needed
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const activeModule = useMemo(() => {
    // Most reliable: module.path matches current pathname
    const direct = (modules || []).find((m) => m.path === location.pathname);
    if (direct) return direct;

    // Fallback: map known module routes -> module by name
    const path = location.pathname;
    const guessName =
      path === "/procurement"
        ? "Procurement"
        : path === "/sales"
          ? "Sales"
          : path === "/crm"
            ? "CRM"
            : path === "/reports" || path === "/reports-analytics"
              ? "Reports & Analytics"
              : path === "/finance" || path === "/financial"
                ? "Finance"
                : null;

    if (!guessName) return null;
    return (modules || []).find((m) => String(m.name || "").toLowerCase() === String(guessName).toLowerCase()) || null;
  }, [modules, location.pathname]);

  const cards = useMemo(() => {
    const menus = activeModule?.menus || [];
    if (activeModule) {
      return menus
        .filter((m) => m?.isActive !== false)
        .map((m) => ({
          name: m.name,
          path: m.path,
          description: MENU_DESCRIPTIONS[m.path] || "Open and manage records in this area.",
        }));
    }

    // Fallback: show accessible modules as cards if module landing path isn't configured in DB yet.
    return (modules || [])
      .filter((m) => m?.isActive !== false)
      .map((m) => ({
        name: m.name,
        path: m.path,
        description: "Open this module.",
      }));
  }, [activeModule, modules]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 px-0 sm:px-2 min-w-0 animate-in fade-in duration-500 pb-10">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <LayoutDashboard className="text-blue-600" size={18} />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight truncate">
                {activeModule?.name || "Module"}
              </h1>
              <p className="text-slate-500 text-sm font-medium">
                Your available screens are shown based on your role.
              </p>
            </div>
          </div>
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="bg-white rounded-[32px] border border-slate-200/60 shadow-sm p-8 text-center">
          <p className="text-sm font-bold text-slate-600">No menus available for your role in this module.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {cards.map((c) => (
            <button
              key={c.path}
              onClick={() => navigate(c.path)}
              className="bg-white p-6 rounded-[32px] border border-slate-200/60 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all text-left group relative overflow-hidden active:scale-[0.99]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-slate-900 font-black text-base truncate">{c.name}</h3>
                  <p className="text-slate-500 text-sm font-medium mt-1">{c.description}</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all">
                  <ArrowRight className="text-slate-400 group-hover:text-primary transition-colors" size={18} />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
