// controllers/role.controller.js
const Role = require("../models/Role");

exports.getRoles = async (req, res) => {
  const roles = await Role.find();
  res.json(roles);
};

exports.createRole = async (req, res) => {
  const { name, permissions } = req.body;

  // prevent duplicate roles
  const exists = await Role.findOne({ name });
  if (exists) {
    return res.status(400).json({ message: "Role already exists" });
  }

  const role = await Role.create({ name, permissions });
  res.status(201).json(role);
};
