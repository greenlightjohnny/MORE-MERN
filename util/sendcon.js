var crypto = require("crypto");
var nodemailer = require("nodemailer");
const Tok = require("../models/Tok");

/**
 * POST /signup
 */
const sendCon = (data) => {
  console.log("tok", data);
  let token = new Tok({
    id: data._id,
    token: crypto.randomBytes(16).toString("hex"),
  });

  // Save the verification token
  token.save(function (err) {
    if (err) {
      return console.log("tkk", err);
    }

    // Send the email
    const transporter = nodemailer.createTransport("SMTP", {
      service: "Outlook",
      host: "smtp-mail.outlook.com",
      secureConnection: false,
      port: 587,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      tls: {
        ciphers: "SSLv3",
      },
    });
    var mailOptions = {
      from: process.env.MAIL_USER,
      to: process.env.MAIL_USER,
      subject: "Account Verification Token",
      text:
        "Hello,\n\n" +
        "Please verify your account by clicking the link: \nhttp://" +
        "test" +
        "/confirmation/" +
        token.token +
        ".\n",
    };
    transporter.sendMail(mailOptions, function (err) {
      if (err) {
        return console.log("tkk", err);
      }
    });
  });
};

module.exports = sendCon;
