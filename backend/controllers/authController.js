const { checkAndLoadUser } = require("../services/userServices");

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required"
      });
    }

    const [success, result] = await checkAndLoadUser({ username, password });

    if (!success) {
      if (result === "nofind") {
        return res.status(404).json({ message: "User not found" });
      }
      if (result === "nopass") {
        return res.status(401).json({ message: "Incorrect password" });
      }
      return res.status(500).json({ message: result });
    }

    return res.status(200).json({
      userId: result.userID,   // service 기준 매핑
      username,
      isAdmin: result.isAdmin
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.logout = (req, res) => {
  res.status(200).json({ message: "Logged out" });
};
