const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const { registerVal } = require("../util/validation");

// ROUTES //
///////////
// Each route takes in the req, res from the client, and uses a callback function to do something with that info

// @public
// @desc Registration route /api/v1/users/register
//
router.post("/register", async (req, res) => {
  const { name, password, confirmPassword, email } = req.body;
  const { error } = registerVal(req.body);

  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  // validate
  // check to see if user exists
  // if not, hash password and save.
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
  });
  res.send(user);
});

module.exports = router;
