const SalesOrder = require("../models/SalesOrder");

exports.createSalesOrder = async (req, res) => {
    try {
        const soData = {
            ...req.body,
            createdBy: req.user.id
        };
        const salesOrder = await SalesOrder.create(soData);
        res.status(201).json(salesOrder);
    } catch (error) {
        res.status(400).json({ message: "Error creating sales order", error: error.message });
    }
};

exports.getSalesOrders = async (req, res) => {
    try {
        const salesOrders = await SalesOrder.find()
            .populate("customer", "name")
            .populate("quotationReference")
            .populate("createdBy", "name")
            .sort({ createdAt: -1 });
        res.json(salesOrders);
    } catch (error) {
        res.status(500).json({ message: "Error fetching sales orders", error: error.message });
    }
};

exports.getSalesOrderById = async (req, res) => {
    try {
        const salesOrder = await SalesOrder.findById(req.params.id)
            .populate("customer")
            .populate("quotationReference")
            .populate("items.item")
            .populate("createdBy", "name");
        if (!salesOrder) return res.status(404).json({ message: "Sales Order not found" });
        res.json(salesOrder);
    } catch (error) {
        res.status(500).json({ message: "Error fetching sales order details", error: error.message });
    }
};

exports.updateSalesOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const salesOrder = await SalesOrder.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!salesOrder) return res.status(404).json({ message: "Sales Order not found" });
        res.json(salesOrder);
    } catch (error) {
        res.status(400).json({ message: "Error updating sales order status", error: error.message });
    }
};
