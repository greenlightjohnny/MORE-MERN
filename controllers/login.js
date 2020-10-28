const { loginVal } = require("../util/validation");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.login = async function (req, res) {
  const { error } = loginVal(req.body);
  if (error) {
    return res.status(400).json({ msg: "Email or password is incorrect" });
  }
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(400).json({ msg: "Email or password is incorrect" });
  }
  if (!user.verified) {
    return res
      .status(400)
      .json({ msg: "Please confirm email before logging in" });
  }

  const comparePasswords = await bcrypt.compare(
    req.body.password,
    user.password
  );

  if (!comparePasswords) {
    return res.status(400).json({ msg: "Email or password is incorrect" });
  }

  if (comparePasswords) {
    const jwtSecret = process.env.JWT_SECRET;
    const token = jwt.sign({ id: user._id }, jwtSecret);

    res.cookie("daisy", token, { httpOnly: true, sameSite: true });
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
      },
    });
  }
};
