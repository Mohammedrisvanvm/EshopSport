import createDocument from "../helpers/insertToDb.js";
import { users } from "../models/userSchema.js";
import sentOTP from "../helpers/emailSend.js";
import otpGenerator from "otp-generator";
import bcrypt from "bcrypt";
import { products } from "../models/productSchema.js";

let passworderr = null;
let emailerr = null;
let isloggedin = false;
let loginvalue = null;
let otperr = null;

let otp = otpGenerator.generate(6, {
  upperCaseAlphabets: false,
  specialChars: false,
});

export async function guestpage(req, res) {
  if (req.session.user) {
    isloggedin = true;
    const productinfo = await products.find({ list: true });
    res.render("guest", { productinfo, isloggedin });
  } else {
    isloggedin = false;
    const productinfo = await products.find({ list: true });
    res.render("guest", { productinfo, isloggedin });
  }
}
export function userGetLogin(req, res) {
  if (!req.session.user) {
    res.render("login", { emailerr });
    emailerr = null;
  } else {
    res.redirect("/");
  }
}

export async function userPostLogin(req, res) {
  try {
    console.log(req.body);
    const { email, password } = req.body;

    const userinfo = await users.findOne({ email });

    if (!userinfo) {
      emailerr = "not found email";
      res.redirect("/login");
    } else {
      bcrypt.compare(password, userinfo.password).then((result) => {
        if (email == userinfo.email && result == true) {
          req.session.user = userinfo;
          req.session.userid = userinfo.id;

          res.redirect("/");
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
  res.render("signup", { passworderr, emailerr, warning: false });
  passworderr = null;
  emailerr = null;
}
export async function userPostSignup(req, res) {
  console.log(otp);
  try {
    const { password, conpassword, email } = req.body;
    if (password == conpassword) {
      const userinfo = await users.findOne({ email });

      if (!userinfo) {
        req.session.value = req.body;
        req.session.email = email;
        sentOTP(email, otp);
        req.session.otp = otp;

        res.redirect("/signUpOtp");
      } else {
        emailerr = "email is already exist";
        res.redirect("/signup");
      }
    } else {
      passworderr = "password is not matching";

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
  if (req.body.otp == req.session.otp) {
    createDocument(req.session.value);
    res.redirect("/login");
    req.session.value = null;
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

  sentOTP(req.session.email, otp);
  req.session.otp = otp;

  res.redirect("/signupotp");
}
//signup closed

export function forgottenPassword(req, res) {
  res.render("otp", { emailerr });
  emailerr = null;
}
export async function postForgottenPassword(req, res) {
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
  if (req.session.otp == req.body.otp) {
    res.redirect("/forget3");
  } else {
    otperr = "otp invalid";
    res.redirect("/otpValidate");
  }
}
export function getforget3(req, res) {
  res.render("newPassword", { passworderr });
  passworderr = null;
}
export async function postforget3(req, res) {
  try {
    let email = req.session.email;
    const userinfo = await users.findOne({ email });

    if (req.body.password == req.body.repassword) {
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
    console.log(error);
  }
}

//product page

export async function productPage(req, res) {
  try {
    const productinfo = await products.findById(req.params.id).lean();

    res.render("productPage", { productinfo });
  } catch (error) {
    console.log(error);
  }
}

export async function wishlist(req, res) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    const userid = req.session.userid;

    try {
      const wishlistdetails = await users.findOne(
        { _id: userid },
        { wishlist: 1 }
      );

      const productId = wishlistdetails.wishlist.map((item) => item.product_id);
      const productsdetails = await products
        .find({ _id: { $in: productId } })
        .lean();
      isloggedin = true;
      res.render("wishlist", { productsdetails, isloggedin });
    } catch (error) {
      console.log(error);
    }
  }
}
export async function cart(req, res) {
  try {
    if (!req.session.user) {
      res.redirect("/login");
    } else {
      try {
        const userinfo = await users.findOne(
          { _id: req.session.user._id },
          { cart: 1 }
        );
        const productIDs = userinfo.cart.map((item) => item.product_id);
        const productsdetails = await products
          .find({ _id: { $in: productIDs } })
          .lean();

        console.log(productsdetails, "111111111");

        res.render("cart", { productsdetails });
      } catch (error) {
        console.log(error);
      }
    }
  } catch (error) {
    console.log(error);
  }
}

export async function userprofile(req, res) {
  try {
    const userinfo = await users.findOne({ _id: req.session.userid });

    res.render("profile", { userinfo });
  } catch (error) {
    console.log(error);
  }
}
export function userlogout(req, res) {
  console.log("userlogout");
  delete req.session.user;
  res.redirect("/");
}

//axios function start

export async function addtowishlist(req, res) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    return new Promise((resolve, reject) => {
      try {
        users
          .updateOne(
            { _id: req.session.user._id },
            { $push: { wishlist: { product_id: req.params.data } } }
          )
          .then((result) => {
            console.log(result);
          });
      } catch (error) {
        console.log(error);
      }
    });
  }
}
export async function deletefromwishlist(req, res) {
  try {
    console.log(req.params);
    console.log(req.session.user);
    users
      .updateOne(
        { _id: req.session.user._id },
        { $pull: { wishlist: { product_id: req.params.data } } }
      )
      .then((result) => {
        console.log(result);
      });
  } catch (error) {}
}
export async function addtocart(req, res) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    return new Promise((resolve, reject) => {
      try {
        users
          .updateOne(
            { _id: req.session.user._id },
            { $push: { cart: { product_id: req.params.data } } }
          )
          .then((result) => {
            console.log(result);
          });
      } catch (error) {
        console.log(error);
      }
    });
  }
}
export async function deletefromcart(req, res) {
  try {
    users
      .updateOne(
        { _id: req.session.user._id },
        { $pull: { cart: { product_id: req.params.data } } }
      )
      .then((result) => console.log(result));
  } catch (error) {
    console.log(error);
  }
}

//axios function end
