const sgMail = require("@sendgrid/mail");
const jwt = require("jsonwebtoken");

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
      html: `<p> Please click <a href=${process.env.SITE}/reset/${token}>here</a> to reset your totally legit account password</p>`,
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
    legit = jwt.verify(token, process.env.JWT_REG);
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        msg: "Invalid or expired token, please try registering again",
      });
    }
    return res.status(400).send("Something else");
  }
};
