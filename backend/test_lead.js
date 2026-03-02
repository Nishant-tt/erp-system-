const mongoose = require("mongoose");
const Lead = require("./models/Lead");

const test = async () => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/erp");
        console.log("Connected");
        const lead = await Lead.create({ firstName: "Test" });
        // console.log("Created:", lead.leadNumber);
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
};

test();
