const AppError = require("../utils/AppError");

module.exports = (req, res, next) => {
  if (!req.user || req.user.role !== "ADMIN") {
    return next(new AppError("Admin access only", 403));
  }
  next();
};
