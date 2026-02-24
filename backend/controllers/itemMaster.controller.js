const ItemMaster = require("../models/ItemMaster");

exports.getItems = async (req, res) => {
    try {
        const items = await ItemMaster.find().sort({ createdAt: -1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: "Error fetching items", error: error.message });
    }
};

exports.getItemById = async (req, res) => {
    try {
        const item = await ItemMaster.findById(req.params.id);
        if (!item) return res.status(404).json({ message: "Item not found" });
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: "Error fetching item", error: error.message });
    }
};

exports.createItem = async (req, res) => {
    try {
        const item = await ItemMaster.create(req.body);
        res.status(201).json(item);
    } catch (error) {
        let message = "Error creating item";
        if (error.code === 11000) message = "Item Code already exists";
        res.status(400).json({ message, error: error.message });
    }
};

exports.updateItem = async (req, res) => {
    try {
        const item = await ItemMaster.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!item) return res.status(404).json({ message: "Item not found" });
        res.json(item);
    } catch (error) {
        res.status(400).json({ message: "Error updating item", error: error.message });
    }
};

exports.deleteItem = async (req, res) => {
    try {
        const item = await ItemMaster.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ message: "Item not found" });
        res.json({ message: "Item deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting item", error: error.message });
    }
};
