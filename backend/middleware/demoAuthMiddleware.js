module.exports = (req, res, next) => {
  const rawHeader = req.headers["x-user-is-admin"];

  if (rawHeader === undefined) {
    return res.status(401).json({
      message: "Authentication required"
    });
  }

  req.isAdmin = rawHeader === "true";
  next();
};
