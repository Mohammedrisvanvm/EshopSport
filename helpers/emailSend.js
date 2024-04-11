import nodemailer from "nodemailer";
console.log(process.env.SITE_PASSWORD,process.env.SITE_EMAIL);
const sentOTP = (email, otp) => {
  return new Promise((resolve, reject) => {
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "risvanrishu0000@gmail.com",
        pass: "eyckjbqbfsyidhaa",
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
                <h3>expire in 1 min</h3>
                
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
