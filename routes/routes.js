const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const { registerVal, loginVal } = require("../util/validation");
const jwt = require("jsonwebtoken");

// ROUTES //
///////////
// Each route takes in the req, res from the client, and uses a callback function to do something with that info

// @public
// @desc Registration route /api/v1/users/register
//
router.post("/register", async (req, res) => {
  // Use Joi to validate client data
  const { error } = registerVal(req.body);
  // If Joi returns an error, send error message to client and break loop
  if (error) {
    return res.status(400).json({ msg: error.details[0].message });
  }

  // If there is no data val error, search DB fot see if the email is already registered. If so, return an error
  const alreadyReg = await User.findOne({ email: req.body.email });
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
    res.status(200).send({ user: user._id });
  } catch (err) {
    res.status(400).json({ msg: err });
  }
});

// @Public
// @Desc POST login route

router.post("/login", async (req, res) => {
  //validate
  //search for user
  //if user hash and compare passwords

  const { error } = loginVal(req.body);
  if (error) {
    return res.status(400).json({ msg: "Email or Password incorrect" });
  }
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(400).json({ msg: "Email or password is incorrect" });
  }

  const comparePasswords = bcrypt.compare(req.body.password, user.password);

  if (!comparePasswords) {
    return res.status(400).json({ msg: "Email or password is incorrect" });
  }

  if (comparePasswords) {
    const jwtSecret = process.env.JWT_SECRET;
    const token = jwt.sign({ _id: user._ID }, jwtSecret);
  }
});

module.exports = router;
