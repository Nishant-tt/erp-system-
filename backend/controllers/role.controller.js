// controllers/role.controller.js
const Role = require("../models/Role");

exports.getRoles = async (req, res) => {
  const roles = await Role.find();
  res.json(roles);
};

exports.createRole = async (req, res) => {
  const { name, permissions } = req.body;
  const exists = await Role.findOne({ name });
  if (exists) return res.status(400).json({ message: "Role already exists" });

  const role = await Role.create({ name, permissions });
  res.status(201).json(role);
};

exports.updateRole = async (req, res) => {
  try {
    const role = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
