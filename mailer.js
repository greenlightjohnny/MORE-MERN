const nodemailer = require("nodemailer");

function sendEmail(message) {
  return new Promise((res, rej) => {
    const transporter = nodemailer.createTransport({
      service: "Outlook",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    transporter.sendMail(message, function (err, info) {
      if (err) {
        rej(err);
      } else {
        res(info);
      }
    });
  });
}

exports.sendConfirmationEmail = ({ toUser, hash }) => {
  const message = {
    from: process.env.MAIL_USER,
    to: process.env.MAIL_USER,
    subject: "Activate",
    html: `
            <h3> Hello ${toUser.username} </h3>
            <p>Thank you for registering into our Application. Much Appreciated! Just one last step is laying ahead of you...</p>
            <p>To activate your account please follow this link: <a target="_" href="${process.env.DOMAIN}/api/activate/user/${hash}">${process.env.DOMAIN}/activate </a></p>
            <p>Cheers</p>
            <p>Your Application Team</p>
            `,
  };
  return sendEmail(message);
};

exports.sendResetPasswordEmail = ({ toUser, hash }) => {
  const message = {
    from: process.env.MAIL_USER,
    to: process.env.MAIL_USER,
    subject: "Reset",
    html: `
        <h3>Hello ${toUser.username} </h3>
        <p>To reset your password please follow this link: <a target="_" href="${process.env.DOMAIN}/reset-password/${hash}">Reset Password Link</a></p>
        <p>Cheers,</p>
        <p>Your Application Team</p>
      `,
  };

  return sendEmail(message);
};
