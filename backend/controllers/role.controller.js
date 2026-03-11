// controllers/role.controller.js
const Role = require("../models/Role");

const normalizePermissions = (permissions) => {
  if (!Array.isArray(permissions)) return [];
  const cleaned = permissions
    .filter((p) => typeof p === "string")
    .map((p) => p.trim())
    .filter(Boolean);
  return [...new Set(cleaned)];
};

exports.getRoles = async (req, res) => {
  const roles = await Role.find();
  res.json(roles);
};

exports.createRole = async (req, res) => {
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const permissions = normalizePermissions(req.body?.permissions);

  if (!name) return res.status(400).json({ message: "Role name is required" });

  const exists = await Role.findOne({ name });
  if (exists) return res.status(400).json({ message: "Role already exists" });

  const role = await Role.create({ name, permissions });
  res.status(201).json(role);
};

exports.updateRole = async (req, res) => {
  try {
    const update = { ...req.body };
    if (typeof update.name === "string") update.name = update.name.trim();
    if ("permissions" in update) update.permissions = normalizePermissions(update.permissions);

    const role = await Role.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!role) return res.status(404).json({ message: "Role not found" });
    res.json(role);
  } catch (error) {
    res.status(400).json({ message: "Error updating role", error: error.message });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.id);
    if (!role) return res.status(404).json({ message: "Role not found" });
    res.json({ message: "Role deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting role", error: error.message });
  }
};
