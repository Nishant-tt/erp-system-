// middlewares/role.middleware.js
module.exports = (roles = []) => {
  return (req, res, next) => {
    if (req.user.role === 'Super Admin') {
      return next();
    }

    if (!roles.includes(req.user.role))
      return res.status(403).json({ message: "Access denied" });
    next();
  };
};
