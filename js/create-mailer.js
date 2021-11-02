const nodemailer = require("nodemailer");

function createMailer(senderObj, auth) {
  return async function mail(recipient, subject, msg) {
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
    // '"Gabriel Ladzaretti" <form.ladzaretti@gmail.com>'
    // send mail with defined transport object
    let info = await smtpTransport.sendMail({
      from: senderObj,
      to: recipient,
      subject: subject,
      text: msg,
    });

    console.log("Message sent: %s", info.messageId);
  };
}

module.exports = createMailer;
