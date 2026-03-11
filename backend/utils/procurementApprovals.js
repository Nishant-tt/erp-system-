// backend/utils/procurementApprovals.js
//
// Central place for procurement approval routing.
// Defaults are based on a common INR approval matrix and can be adjusted later
// (or extended to be company-configurable).

const DEFAULT_PO_APPROVAL_MATRIX = [
  // Up to 50,000 -> Purchase Manager
  { maxInclusive: 50000, roles: ["Purchase Manager"] },
  // 50,001 to 5,00,000 -> Finance Head
  { maxInclusive: 500000, roles: ["Finance Head"] },
  // Above 5,00,000 -> Director / GM
  { maxInclusive: Number.POSITIVE_INFINITY, roles: ["Director", "GM"] },
];

function normalizeRole(role) {
  return String(role || "").trim();
}

function uniq(arr) {
  return Array.from(new Set((arr || []).filter(Boolean)));
}

function getRequiredRolesForPOAmount(amount, opts = {}) {
  const matrix = Array.isArray(opts.matrix) && opts.matrix.length > 0 ? opts.matrix : DEFAULT_PO_APPROVAL_MATRIX;
  const amt = Number(amount) || 0;
  const row = matrix.find((r) => amt <= Number(r.maxInclusive));
  const roles = uniq([...(row?.roles || [])].map(normalizeRole));

  // Backward-compatible fallback: many environments only have Admin/Manager.
  // Admin always bypasses checks; Manager can approve low value POs by default.
  if (amt <= 50000) roles.push("Manager");

  return uniq(roles);
}

function userCanApprove(requiredRoles, userRole) {
  const role = normalizeRole(userRole);
  if (role === "Admin") return true;
  const required = (requiredRoles || []).map(normalizeRole);
  return required.includes(role);
}

module.exports = {
  DEFAULT_PO_APPROVAL_MATRIX,
  getRequiredRolesForPOAmount,
  userCanApprove,
};
