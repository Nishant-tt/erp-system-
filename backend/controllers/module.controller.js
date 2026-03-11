const Module = require("../models/Module");
const Menu = require("../models/Menu");

exports.getModules = async (req, res) => {
    try {
        const role = String(req.user?.role || "").trim();
        const modules = await Module.find({ isActive: true }).sort({ order: 1 });
        const modulesWithMenus = await Promise.all(
            modules.map(async (mod) => {
                const menus = await Menu.find({ module: mod._id, isActive: true }).sort({ order: 1 });

                // Apply optional allowedRoles filters (missing/empty => allow)
                const moduleAllowed = Array.isArray(mod.allowedRoles) ? mod.allowedRoles : [];
                if (moduleAllowed.length > 0 && role !== "Admin" && !moduleAllowed.includes(role)) {
                    return null;
                }

                const filteredMenus = (menus || []).filter((m) => {
                    const allowed = Array.isArray(m.allowedRoles) ? m.allowedRoles : [];
                    if (allowed.length === 0) return true;
                    if (role === "Admin") return true;
                    return allowed.includes(role);
                });
                return {
                    ...mod.toObject(),
                    menus: filteredMenus,
                };
            })
        );
        res.json((modulesWithMenus || []).filter(Boolean));
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
