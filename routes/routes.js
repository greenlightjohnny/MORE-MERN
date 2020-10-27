const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const { registerVal, loginVal } = require("../util/validation");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/checkAuth");

const sgMail = require("@sendgrid/mail");

const checkToken = require("../middleware/checkToken");

// ROUTES //
///////////
// Each route takes in the req, res from the client, and uses a callback function to do something with that info

// @public
// @desc Registration route /api/v1/users/register
//
router.post("/register", async (req, res) => {
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
});

// @Public
// @Desc POST login route

router.post("/login", async (req, res) => {
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
});

// Delete account, private route, middleware protection.

router.delete("/delete", auth, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.user);
    console.log(deletedUser);
    res.status(200).json(deletedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// router.post("/isvalid", async (req, res) => {
//   try {
//     const token = req.header("daisy");

//     if (!token) {
//       return res.json(false);
//     }
//     const verified = jwt.verify(token, process.env.JWT_SECRET);
//     if (!verified) {
//       return res.json("false");
//     }
//     const user = await User.findById(verified.id);
//     if (!user) {
//       return res.json(false);
//     }
//     return res.json({isAuthenticated: true});
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// router.get("/", auth, async (req, res) => {
//   console.log("route hit");
//   const user = await User.findById(req.user);
//   console.log("route hit");
//   res.json({
//     isAuthenticated: true,
//     user: user.name,
//     displayName: user.name,
//     id: user._id,
//   });
// });

router.get("/auth", checkToken, (req, res) => {
  console.log("hello", req.cookies);
  res.status(200).json(true);
});

/// Email conformation route;

router.get("/confirm/:token", async (req, res) => {
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
      { $unset: { expireAt: 1 } },
      { new: true }
    );
    console.log("######", user);
    res
      .status(200)
      .send("Email confirmed! You wil be redirected to the login page");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//// Logout route
router.post("/logout", (req, res) => {
  res.clearCookie("daisy");
  return res.status(200).send("Logged out");
});

module.exports = router;
