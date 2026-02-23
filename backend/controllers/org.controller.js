const Department = require("../models/Department");
const Team = require("../models/Team");

exports.getDepartments = async (req, res) => {
    try {
        const departments = await Department.find({ isActive: true });
        res.json(departments);
    } catch (error) {
        res.status(500).json({ message: "Error fetching departments", error: error.message });
    }
};

exports.getTeams = async (req, res) => {
    try {
        const teams = await Team.find({ isActive: true }).populate("department").populate("lead", "name email");
        res.json(teams);
    } catch (error) {
        res.status(500).json({ message: "Error fetching teams", error: error.message });
    }
};

exports.createDepartment = async (req, res) => {
    try {
        const department = await Department.create(req.body);
        res.status(201).json(department);
    } catch (error) {
        res.status(400).json({ message: "Error creating department", error: error.message });
    }
};

exports.updateDepartment = async (req, res) => {
    try {
        const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!department) return res.status(404).json({ message: "Department not found" });
        res.json(department);
    } catch (error) {
        res.status(400).json({ message: "Error updating department", error: error.message });
    }
};

exports.deleteDepartment = async (req, res) => {
    try {
        const department = await Department.findByIdAndDelete(req.params.id);
        if (!department) return res.status(404).json({ message: "Department not found" });
        res.json({ message: "Department deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting department", error: error.message });
    }
};

exports.createTeam = async (req, res) => {
    try {
        const team = await Team.create(req.body);
        res.status(201).json(team);
    } catch (error) {
        res.status(400).json({ message: "Error creating team", error: error.message });
    }
};
