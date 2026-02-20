const Module = require("../models/Module");
const Menu = require("../models/Menu");

exports.getModules = async (req, res) => {
    try {
        const modules = await Module.find({ isActive: true }).sort({ order: 1 });
        const modulesWithMenus = await Promise.all(
            modules.map(async (mod) => {
                const menus = await Menu.find({ module: mod._id, isActive: true }).sort({ order: 1 });
                return {
                    ...mod.toObject(),
                    menus,
                };
            })
        );
        res.json(modulesWithMenus);
    } catch (error) {
        res.status(500).json({ message: "Error fetching modules", error: error.message });
    }
};

exports.createModule = async (req, res) => {
    try {
        const newModule = await Module.create(req.body);
        res.status(201).json(newModule);
    } catch (error) {
        res.status(400).json({ message: "Error creating module", error: error.message });
    }
};

exports.createMenu = async (req, res) => {
    try {
        const newMenu = await Menu.create(req.body);
        res.status(201).json(newMenu);
    } catch (error) {
        res.status(400).json({ message: "Error creating menu", error: error.message });
    }
};
