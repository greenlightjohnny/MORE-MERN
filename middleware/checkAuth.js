const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    const token = req.header("daisy");
    if (!token) {
      return res.status(401).send("No token");
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);

    if (!verified) {
      return res.status(401).send("Not a valid token");
    }

    req.user = verified.id;
    next();
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

module.exports = auth;
