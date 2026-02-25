const DeliveryNote = require("../models/DeliveryNote");
const SalesOrder = require("../models/SalesOrder");

exports.createDeliveryNote = async (req, res) => {
    try {
        const dnData = {
            ...req.body,
            processedBy: req.user.id
        };

        const deliveryNote = await DeliveryNote.create(dnData);

        // Update Sales Order shipped quantities
        const salesOrder = await SalesOrder.findById(deliveryNote.soReference);
        if (salesOrder) {
            deliveryNote.items.forEach(dnItem => {
                const soItem = salesOrder.items.find(item => item.item.toString() === dnItem.item.toString());
                if (soItem) {
                    soItem.shippedQuantity += dnItem.shippedQuantity;
                }
            });

            // Check if SO is fully shipped
            const allShipped = salesOrder.items.every(item => item.shippedQuantity >= item.quantity);
            if (allShipped) {
                salesOrder.status = 'SHIPPED';
            } else if (salesOrder.items.some(item => item.shippedQuantity > 0)) {
                salesOrder.status = 'PARTIALLY_SHIPPED';
            }

            await salesOrder.save();
        }

        res.status(201).json(deliveryNote);
    } catch (error) {
        res.status(400).json({ message: "Error creating delivery note", error: error.message });
    }
};

exports.getDeliveryNotes = async (req, res) => {
    try {
        const deliveryNotes = await DeliveryNote.find()
            .populate("customer", "name")
            .populate("soReference", "soNumber")
            .populate("processedBy", "name")
            .sort({ createdAt: -1 });
        res.json(deliveryNotes);
    } catch (error) {
        res.status(500).json({ message: "Error fetching delivery notes", error: error.message });
    }
};

exports.getDeliveryNoteById = async (req, res) => {
    try {
        const deliveryNote = await DeliveryNote.findById(req.params.id)
            .populate("customer")
            .populate("soReference")
            .populate("items.item")
            .populate("processedBy", "name");

        if (!deliveryNote) return res.status(404).json({ message: "Delivery Note not found" });
        res.json(deliveryNote);
    } catch (error) {
        res.status(500).json({ message: "Error fetching delivery note details", error: error.message });
    }
};
