const User = require("../models/User");
const sendEmail = require("./emailSend");
const msgs = require("./emailMsgs");
const templates = require("./emailTemplates");

exports.collectEmail = (req, res) => {
  const { email } = req.body;

  User.create({ email }).then((newUser) => sendEmail(newUser));
};
