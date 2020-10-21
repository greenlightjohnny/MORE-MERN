const jwt = require("jsonwebtoken");
const parser = require("cookie-parser");
const authCheck = (req, res, next) => {
  console.log("any", req.cookies);
  try {
    const token = req.cookies.daisy;
    console.log("isit", token);
    if (!token) {
      return res.status(401).send("No token");
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);

    if (!verified) {
      return res.status(401).send("Not a valid token");
    }

    next();
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

module.exports = authCheck;
