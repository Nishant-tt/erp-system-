const mongoose = require("mongoose");
const User = require("../models/User");
const Role = require("../models/Role");
require("dotenv").config();

const seedSuperAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/erp");
        console.log("Connected to MongoDB for seeding...");

        // 1. Create or Find Super Admin Role
        let superAdminRole = await Role.findOne({ name: "Super Admin" });
        if (!superAdminRole) {
            superAdminRole = await Role.create({
                name: "Super Admin",
                permissions: ["ALL"]
            });
            console.log("Super Admin role created.");
        } else {
            console.log("Super Admin role already exists.");
        }

        // 2. Create or Update Super Admin User
        const superAdminEmail = "super@pomanager.com";
        let superAdminUser = await User.findOne({ email: superAdminEmail });

        if (!superAdminUser) {
            superAdminUser = await User.create({
                name: "Super Admin",
                email: superAdminEmail,
                password: "superpo",
                role: superAdminRole._id,
                status: "ACTIVE"
            });
            console.log("Super Admin user created successfully.");
        } else {
            // Update password and role if already exists
            superAdminUser.password = "superpo";
            superAdminUser.role = superAdminRole._id;
            await superAdminUser.save();
            console.log("Super Admin user updated.");
        }

        console.log("Seeding completed successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
};

seedSuperAdmin();
