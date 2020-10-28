const { registerVal } = require("../util/validation");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sgMail = require("@sendgrid/mail");

exports.registration = async function (req, res) {
  // Use Joi to validate client data
  const { error } = registerVal(req.body);
  console.log("333", req.body);
  // If Joi returns an error, send error message to client and break loop
  if (error) {
    console.log("4444", error.details[0].message);
    return res.json({ msg: error.details[0].message });
  }

  // If there is no data val error, search DB fot see if the email is already registered. If so, return an error
  const alreadyReg = await User.findOne({ email: req.body.email });
  console.log("555", alreadyReg);
  if (alreadyReg) {
    return res.status(400).json({ msg: "Password or email incorrect" });
  }

  // If no val and email not already registered, salt and hash password. New User object, with hashed password.
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
  });

  // Attempt to save to MongoDB
  try {
    const saved = await user.save();
    const jwtSecret = process.env.JWT_REG;
    const testSite = process.env.SITE;
    const token = jwt.sign({ id: saved._id }, jwtSecret, {
      expiresIn: 60 * 20,
    });
    console.log("%%%%%%%%%%%%", req.body.email);
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: req.body.email,
      from: "totallylegitapp@outlook.com",
      subject: `Hi ${req.body.name}`,
      text: `Click below to confirm your account! ${req.body.email}`,
      html: `<p> Please click <a href=${process.env.SITE}/confirm/${token}>here</a> to confirm your totally legit account</p>`,
    };
    sgMail
      .send(msg)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error(error);
      });

    res.status(200).send({ user: user._id });
  } catch (err) {
    res.status(500).json({ msg: err });
  }
};
