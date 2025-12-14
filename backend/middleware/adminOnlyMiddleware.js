module.exports = (req, res, next) => {
  if (typeof req.isAdmin !== "boolean") {
    return res.status(500).json({
      message: "Auth middleware order incorrect"
    });
  }

  if (!req.isAdmin) {
    return res.status(403).json({
      message: "Admin access required"
    });
  }

  next();
};
