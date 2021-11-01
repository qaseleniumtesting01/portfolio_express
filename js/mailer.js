const nodemailer = require("nodemailer");

async function mail(recipient, subject, msg, auth) {
  // create reusable transporter object using the default SMTP transport
  let smtpTransport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // use SSL
    auth: {
      user: auth.email,
      pass: auth.password,
    },
  });

  // send mail with defined transport object
  let info = await smtpTransport.sendMail({
    from: '"Gabriel Ladzaretti" <form.ladzaretti@gmail.com>',
    to: recipient,
    subject: subject,
    text: msg,
  });

  console.log("Message sent: %s", info.messageId);
}

module.exports = mail;
