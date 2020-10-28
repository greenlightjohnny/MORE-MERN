const jwt = require("jsonwebtoken");

exports.confirm = async function (req, res) {
  console.log("verr", req.params);
  let token = req.params.token;
  if (!token) {
    return res.json(false);
  }

  let legit;
  try {
    legit = jwt.verify(token, process.env.JWT_REG);
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        msg: "Invalid or expired token, please try registering again",
      });
    }
    return res.status(400).send("Something else");
  }

  try {
    const user = await User.findOneAndUpdate(
      { _id: legit.id },
      { $set: { verified: true } },

      { new: true }
    );
    const testU = await User.findOneAndUpdate(
      { _id: legit.id },
      { $unset: { expireAt: "" } },
      { new: true }
    );

    res
      .status(200)
      .send("Email confirmed! You wil be redirected to the login page");
  } catch (err) {
    console.log("here", err.message);
    res.status(500).json({ error: err.message });
  }
};
