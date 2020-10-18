const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const { registerVal, loginVal } = require("../util/validation");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/checkAuth");

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

    res.header("daisy", token);
    res.cookie("daisy", token, { httpOnly: true, sameSite: true });
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
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

router.post("/isvalid", async (req, res) => {
  try {
    const token = req.header("daisy");

    if (!token) {
      return res.json(false);
    }
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) {
      return res.json("false");
    }
    const user = await User.findById(verified.id);
    if (!user) {
      return res.json(false);
    }
    return res.json(true);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", auth, async (req, res) => {
  const user = await User.findById(req.user);

  res.json({ displayName: user.name, id: user._id });
});

module.exports = router;
