const mongoose = require("mongoose");

const opportunitySchema = new mongoose.Schema(
    {
        opportunityNumber: { type: String, unique: true },
        title: { type: String, required: true },
        leadReference: { type: mongoose.Schema.Types.ObjectId, ref: "Lead" },
        customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
        expectedValue: { type: Number, required: true },
        closeDate: { type: Date },
        probability: { type: Number, default: 50 }, // percentage
        stage: {
            type: String,
            enum: ["DISCOVERY", "PROPOSAL", "NEGOTIATION", "WON", "LOST"],
            default: "DISCOVERY"
        },
        description: { type: String },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
    },
    { timestamps: true }
);

opportunitySchema.pre("save", async function () {
    if (!this.opportunityNumber) {
        const date = new Date();
        const year = date.getFullYear();
        const count = await this.constructor.countDocuments();
        this.opportunityNumber = `OP-${year}-${(count + 1).toString().padStart(3, '0')}`;
    }
});

module.exports = mongoose.model("Opportunity", opportunitySchema);
