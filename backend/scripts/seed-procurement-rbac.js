/* eslint-disable no-console */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const mongoose = require("mongoose");

const Role = require("../models/Role");
const Module = require("../models/Module");
const Menu = require("../models/Menu");

const ROLES = [
  "Admin",
  "Manager",
  "Department Head",
  "Budget Owner",
  "Purchase Manager",
  "Finance Head",
  "Director",
  "GM",
  "Store Manager",
  "Quality Inspector",
  "Inventory Controller",
  "Accounts Payable",
];

// Menu-level role visibility (sidebar)
const MENU_ROLE_MAP = [
  // PR
  { path: "/prs", roles: ["Admin", "Manager", "Department Head", "Budget Owner", "Purchase Manager"] },
  { path: "/prs/create", roles: ["Admin", "Manager", "Department Head", "Budget Owner", "Purchase Manager"] },
  { path: "/prs/approvals", roles: ["Admin", "Manager", "Department Head", "Budget Owner"] },

  // RFQ
  { path: "/procurement-quotations", roles: ["Admin", "Purchase Manager", "Finance Head", "Director", "GM"] },
  { path: "/procurement-quotations/create", roles: ["Admin", "Purchase Manager"] },
  { path: "/procurement-quotations/approvals", roles: ["Admin", "Purchase Manager", "Finance Head", "Director", "GM"] },

  // PO
  { path: "/purchase-orders", roles: ["Admin", "Purchase Manager", "Finance Head", "Director", "GM", "Manager"] },
  { path: "/purchase-orders/create", roles: ["Admin", "Purchase Manager", "Manager"] },
  { path: "/purchase-orders/approvals", roles: ["Admin", "Purchase Manager", "Finance Head", "Director", "GM", "Manager"] },

  // GRN
  { path: "/grns", roles: ["Admin", "Store Manager", "Quality Inspector", "Inventory Controller"] },
  { path: "/grns/create", roles: ["Admin", "Store Manager", "Quality Inspector", "Inventory Controller"] },
  { path: "/grns/approvals", roles: ["Admin", "Store Manager", "Quality Inspector", "Inventory Controller"] },

  // AP
  { path: "/invoices", roles: ["Admin", "Accounts Payable", "Finance Head", "Director", "GM"] },
  { path: "/invoices/create", roles: ["Admin", "Accounts Payable"] },
  { path: "/payments", roles: ["Admin", "Finance Head", "Director", "GM"] },
  { path: "/payments/process", roles: ["Admin", "Finance Head", "Director", "GM"] },
];

async function upsertRoles() {
  for (const name of ROLES) {
    await Role.updateOne({ name }, { $setOnInsert: { name, permissions: [] } }, { upsert: true });
  }
}

async function applyMenuRbac() {
  const menus = await Menu.find({});
  const byPath = new Map(MENU_ROLE_MAP.map((m) => [m.path, m.roles]));

  let updated = 0;
  for (const m of menus) {
    const roles = byPath.get(m.path);
    if (!roles) continue;
    m.allowedRoles = roles;
    await m.save();
    updated += 1;
  }

  return { menusTotal: menus.length, menusUpdated: updated };
}

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI is missing in environment");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected");

  await upsertRoles();
  console.log(`Upserted roles: ${ROLES.length}`);

  const res = await applyMenuRbac();
  console.log(`Menu RBAC applied. Menus: ${res.menusTotal}, updated: ${res.menusUpdated}`);

  const modules = await Module.find({});
  console.log(`Modules found: ${modules.length}`);

  await mongoose.disconnect();
  console.log("Done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
