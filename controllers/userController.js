import createDocument from "../helpers/insertToDb.js";
import { users } from "../models/userSchema.js";
import sentOTP from "../helpers/emailSend.js";
import otpGenerator from "otp-generator";
import bcrypt from "bcrypt";
import { products } from "../models/productSchema.js";

let passworderr = null;
let emailerr = null;

let loginvalue = null;
let otperr = null;

let otp = otpGenerator.generate(6, {
  upperCaseAlphabets: false,
  specialChars: false,
});

export async function guestpage(req, res) {
  if(req.session.user){
    res.redirect("/home")
  }else{
    const productinfo=await products.find() 
    res.render("guest",{productinfo});
  }

}
export function userGetLogin(req, res) {
  console.log("login");
  console.log(req.session.user);
  if(!req.session.user){
    res.render("login", { emailerr });
    emailerr = null;
  }
  else{
    res.redirect("/home")
 
}
}

export function gethome(req,res){
  if(req.session.user){
    res.render("home")
  }else{
    res.redirect("/login")
  }
  
  


}
export async function userPostLogin(req, res) {
  try {
    
 
  console.log(req.body);
  const { email, password } = req.body;

  const userinfo = await users.findOne({ email });
  console.log(userinfo);
  if (!userinfo) {
    emailerr = "not found email";
    res.redirect("/login");
  } else {
    bcrypt.compare(password, userinfo.password).then((result) => {
      console.log(result);
      console.log(result);
      if (email == userinfo.email && result == true) {
        req.session.user=userinfo.email
        console.log(req.session.user)
        res.redirect("/home");
        console.log("postlogin");
      } else {
        emailerr = "password error";
        res.redirect("/login");
      }
    });
  }
} catch (error) {
    console.log(error);
}
}
export function userGetSignup(req, res) {
  console.log("getsignup");
  console.log(passworderr);
  res.render("signup", { passworderr, emailerr });
  passworderr = null;
  emailerr = null;
}
export async function userPostSignup(req, res) {
  console.log("postsignup");
  console.log(req.body);
  console.log(otp);
  try {
    
 

  const { password, conpassword, email } = req.body;
  if (password == conpassword) {
    console.log(password, conpassword);
    console.log(email);

    const userinfo = await users.findOne({ email });
    console.log(userinfo);
    if (!userinfo) {
    req.session.value= req.body;
      req.session.email = email;
      sentOTP(email, otp);
      req.session.otp = otp;

      res.redirect("/signUpOtp");
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
} catch (error) {
   console.log(error); 
}
}
export function getsignUpOtp(req, res) {
  res.render("signUpOtp", { otperr });
  otperr = null;
}
export function postsignUpOtp(req, res) {
  console.log("postotp");

  if (req.body.otp == req.session.otp) {
    console.log(200, "success");
    createDocument(req.session.value);
    res.redirect("/login");
    req.session.value= null;
  } else {
    otperr = "wrong otp";
    res.redirect("/signUpOtp");
  }
}
export function signupresendOTP(req, res) {
  let otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
  });
  console.log(req.session.email);
  sentOTP(req.session.email, otp);
  req.session.otp = otp;

  res.redirect("/signupotp");
}
//signup closed

export function forgottenPassword(req, res) {
  console.log("hai");
  res.render("otp", { emailerr });
  emailerr = null;
}
export async function postForgottenPassword(req, res) {
  console.log(req.body.email);
  try {
    

  const email = req.body.email;

  const userinfo = await users.findOne({ email });
  if (!userinfo) {
    emailerr = "not found please signup";
    res.redirect("/otp");
  } else {
    sentOTP(email, otp);
    console.log(otp);
    req.session.email = email;
    req.session.otp = otp;
    loginvalue = req.body;
    res.redirect("/otpValidate");
  }
} catch (error) {
   console.log(error); 
}
}
export function resendOTP(req, res) {
  let otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
  });

  console.log(req.session.email);
  sentOTP(req.session.email, otp);
  req.session.email = req.session.email;
  req.session.otp = otp;

  res.redirect("/otpValidate");
}
export function getOtpValidate(req, res) {
  console.log(req.body);

  res.render("otpValidation", { otperr });
  otperr = null;
}
export function postOtpValidate(req, res) {
  console.log("postvalidate");
  console.log("loginvalue", loginvalue);
  console.log("req", req.body);
  if (req.session.otp == req.body.otp) {
    res.redirect("/forget3");
  } else {
    otperr = "otp invalid";
    res.redirect("/otpValidate");
  }
}
export function getforget3(req, res) {
  console.log(req.body);

  res.render("newPassword", { passworderr });
  passworderr = null;
}
export async function postforget3(req, res) {
  console.log(req.body);
  try {
    
  
  let email = req.session.email;
  const userinfo = await users.findOne({ email });
  console.log(userinfo.id);
  if (req.body.password == req.body.repassword) {
    console.log("success");
    req.body.password = await bcrypt.hash(req.body.password, 10);
    const update = await users.updateOne(
      { _id: userinfo._id },
      { $set: { password: req.body.password } }
    );
    res.redirect("/login");
    loginvalue = null;
  } else {
    passworderr = "not matching";
    res.redirect("/forget3");
    console.log("forget", loginvalue);
  }
} catch (error) {
  console.log(error)
}
}

//product page


export function productPage(req,res){
  res.render("productPage")
}








export function userlogout(req, res) {
  console.log("logout");
  delete req.session.user;
  res.redirect("/");
}
