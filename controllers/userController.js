import createDocument from "../helpers/insertToDb.js";
import { users } from "../models/userSchema.js";

let passworderr = null;
let emailerr = null;
export function userGetLogin(req, res) {
  res.render("login");
}
export function userPostLogin(req, res) {
  console.log(req.body);

  res.redirect("/signup");
  passworderr = null;
}
export function userGetSignup(req, res) {
  console.log(passworderr);
  res.render("signup", { passworderr, emailerr });
  passworderr = null;
  emailerr = null;
}
export async function userPostSignup(req, res) {
  console.log(req.body);
  const { password, conpassword, email } = req.body;
  if (password == conpassword) {
    console.log(password, conpassword);

    const userinfo = await users.findOne({ email });
    console.log(userinfo);
    if (!userinfo) {
      createDocument(req.body);
      res.redirect("/");
    } else {
      console.log("l");
      emailerr = "email is already exist";
      res.redirect("/signup");
    }
  } else {
    passworderr = "password is not matching";
    console.log("p");
    res.redirect("/signup");
  }
}
export function forgottenPassword(req, res) {
  res.render("otp");
}
export function postForgottenPassword(req, res) {
  console.log(req.body);

  res.render("otpValidation");
}
export function forget3(req, res) {
  console.log(req.body);

  res.render("newPassword");
}
