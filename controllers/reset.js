const sgMail = require("@sendgrid/mail");
const jwt = require("jsonwebtoken");
const { resetVal } = require("../util/validation");
const bcrypt = require("bcrypt");
exports.reset_post = async function (req, res) {
  console.log("reset route hit");

  const user = await User.findOne({ email: req.body.email });

  if (user) {
    console.log("user FOUND!");
    const jwtSecret = process.env.JWT_RESET;

    const token = jwt.sign({ id: user._id }, jwtSecret, {
      expiresIn: 60 * 20,
    });
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: req.body.email,
      from: "totallylegitapp@outlook.com",
      subject: `Totally Legit Password Reset`,
      text: `Click below to confirm your account! ${req.body.email}`,
      html: `<p> Please click <a href=${process.env.SITE}/resetform/${token}>here</a> to reset your totally legit account password</p>`,
    };
    sgMail
      .send(msg)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error(error);
      });
  }
  res.status(200).json({
    msg:
      "If there is an account registered to that email we sent a reset message",
  });
};

exports.reset_get = async function (req, res) {
  let token = req.params.token;

  if (!token) {
    return res.json(false);
  }

  let legit;
  try {
    legit = jwt.verify(token, process.env.JWT_RESET);
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        msg: "Invalid or expired token, please try resetting again",
      });
    }
    return res.status(400).send("Something else");
  }

  if (legit) {
    return res.status(200).json({ msg: token });
  }
};

exports.reset_post_password = async function (req, res) {
  let token = req.params.token;
  if (!token) {
    return res.json(false);
  }
  const { error } = resetVal(req.body);

  // If Joi returns an error, send error message to client and break loop
  if (error) {
    //console.log("4444", error.details[0].message);
    return res.json({ msg: error.details[0].message });
  }

  let legit;
  try {
    legit = jwt.verify(token, process.env.JWT_RESET);
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        msg: "Invalid or expired token, please try resetting again",
      });
    }
    return res.status(400).send("Something else");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  try {
    const user = await User.findOneAndUpdate(
      { _id: legit.id },
      { $set: { password: hashedPassword } },

      { new: true }
    );
    return res.status(200).json({ msg: "Password reset successfully!" });
  } catch (err) {
    //console.log("here", err.message);
    res.status(500).json({ error: err.message });
  }
};
