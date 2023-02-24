import nodemailer from "nodemailer";

const sentOTP = (email, otp) => {
  return new Promise((resolve, reject) => {
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", // SMTP server address (usually mail.your-domain.com)
      port: 465, // Port for SMTP (usually 465)
      secure: true, // Usually true if connecting to port 465
      auth: {
        user: process.env.SITE_EMAIL,
        pass: process.env.SITE_PASSWORD,
      },
    });
    var mailOptions = {
      from: process.env.SITE_EMAIL,
      to: email,
      subject: " Email verification",
      html: `
              <h1>Verify Your Email For Ecart Sport</h1>
                <h3>use this code to verify your email</h3>
                <h2>${otp}</h2>
              `,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        reject(error);
      } else {
        resolve(info);
      }
    });
  });
};

export default sentOTP;
