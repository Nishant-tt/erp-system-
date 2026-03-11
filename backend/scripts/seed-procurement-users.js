/* eslint-disable no-console */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const crypto = require("crypto");
const mongoose = require("mongoose");
const fs = require("fs");

const User = require("../models/User");
const Role = require("../models/Role");

const DEFAULT_PASSWORD_LEN = 14;

function genPassword(len = DEFAULT_PASSWORD_LEN) {
  // URL-safe base64-ish password
  return crypto.randomBytes(32).toString("base64").replaceAll("+", "A").replaceAll("/", "b").replaceAll("=", "").slice(0, len);
}

// Template users (edit emails to your domain if needed)
const TEMPLATE_USERS = [
  { name: "PR Approver", email: "pr.approver@example.com", role: "Department Head" },
  { name: "Budget Owner", email: "budget.owner@example.com", role: "Budget Owner" },
  { name: "Purchase Manager", email: "purchase.manager@example.com", role: "Purchase Manager" },
  { name: "Finance Head", email: "finance.head@example.com", role: "Finance Head" },
  { name: "Director", email: "director@example.com", role: "Director" },
  { name: "GM", email: "gm@example.com", role: "GM" },
  { name: "Store Manager", email: "store.manager@example.com", role: "Store Manager" },
  { name: "Quality Inspector", email: "quality.inspector@example.com", role: "Quality Inspector" },
  { name: "Inventory Controller", email: "inventory.controller@example.com", role: "Inventory Controller" },
  { name: "Accounts Payable", email: "ap@example.com", role: "Accounts Payable" },
];

async function main() {
  if (String(process.env.SEED_USERS || "").toLowerCase() !== "true") {
    console.log("Skipping user seeding. Set SEED_USERS=true to enable.");
    return;
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI is missing in environment");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected");

  const out = [];
  for (const u of TEMPLATE_USERS) {
    const roleDoc = await Role.findOne({ name: u.role });
    if (!roleDoc) {
      console.log(`Role not found, skipping user: ${u.email} (${u.role})`);
      continue;
    }

    const existing = await User.findOne({ email: u.email });
    if (existing) {
      console.log(`User exists, skipping: ${u.email}`);
      continue;
    }

    const password = genPassword();
    const created = await User.create({
      name: u.name,
      email: u.email,
      password,
      role: roleDoc._id,
      status: "ACTIVE",
    });

    out.push({ id: String(created._id), email: u.email, role: u.role, password });
    console.log(`Created: ${u.email} (${u.role})`);
  }

  console.log("Seeded users (store securely):");
  console.log(JSON.stringify(out, null, 2));

  // Also write to a local file for convenience (delete after use).
  const outPath = path.join(__dirname, "..", "seeded-users.json");
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2), "utf8");
  console.log(`Wrote: ${outPath}`);

  await mongoose.disconnect();
  console.log("Done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
