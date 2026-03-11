// middlewares/role.middleware.js
module.exports = (roles = []) => {
  return (req, res, next) => {
    // Admin is the single global elevated role
    if (req.user.role === "Admin") {
      return next();
    }

    if (!roles.includes(req.user.role))
      return res.status(403).json({ message: "Access denied" });
    next();
  };
};
