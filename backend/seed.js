const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Module = require("./models/Module");
const Menu = require("./models/Menu");

dotenv.config();

const modules = [
    { name: "Dashboard", icon: "LayoutDashboard", path: "/dashboard", order: 1 },
    { name: "Customers", icon: "Users", path: "/customers", order: 2 },
    { name: "Products", icon: "Package", path: "/products", order: 3 },
    { name: "Orders", icon: "ShoppingCart", path: "/orders", order: 4 },
    { name: "Reports", icon: "BarChart3", path: "/reports", order: 5 },
    { name: "Settings", icon: "Settings", path: "/settings", order: 6 },
];

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/erp");
        console.log("Connected to MongoDB for seeding...");

        // Clear existing data
        await Module.deleteMany({});
        await Menu.deleteMany({});

        for (const modData of modules) {
            const mod = await Module.create(modData);
            console.log(`Created Module: ${mod.name}`);

            // Add dummy sub-menus for some modules
            if (mod.name === "Customers") {
                await Menu.create({ name: "All Customers", path: "/customers/all", module: mod._id, order: 1 });
                await Menu.create({ name: "Add Customer", path: "/customers/add", module: mod._id, order: 2 });
            } else if (mod.name === "Products") {
                await Menu.create({ name: "Inventory", path: "/products/inventory", module: mod._id, order: 1 });
                await Menu.create({ name: "Categories", path: "/products/categories", module: mod._id, order: 2 });
            }
        }

        console.log("Seeding completed successfully!");
        process.exit();
    } catch (error) {
        console.error("Error seeding data:", error);
        process.exit(1);
    }
};

seedData();
