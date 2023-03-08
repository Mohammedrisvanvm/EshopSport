import express, { Router } from "express";
import {
  addtocart,
  addtowishlist,
  cart,
  contactus,
  deletefromcart,
  deletefromwishlist,
  forgottenPassword,
  getforget3,
  getOtpValidate,
  getsignUpOtp,
  guestpage,
  postforget3,
  postForgottenPassword,
  postOtpValidate,
  postsignUpOtp,
  productPage,
  resendOTP,
  signupresendOTP,
  userGetLogin,
  userGetSignup,
  userlogout,
  userPostLogin,
  userPostSignup,
  userprofile,
  wishlist,
} from "../controllers/userController.js";

var router = express.Router();

router.get("/", guestpage);
router.get("/login", userGetLogin);
router.post("/login", userPostLogin);
router.get("/signup", userGetSignup);
router.post("/signup", userPostSignup);
router.get("/otp", forgottenPassword);
router.post("/otp", postForgottenPassword);
router.get("/otpValidate", getOtpValidate);
router.post("/otpValidate", postOtpValidate);
router.get("/signUpOtp", getsignUpOtp);
router.post("/signUpOtp", postsignUpOtp);
router.get("/forget3", getforget3);
router.post("/forget3", postforget3);
router.get("/resendotp", resendOTP);
router.get("/signupResendOtp", signupresendOTP);
router.get("/logout", userlogout);
router.get('/productpage/:id',productPage)
router.get('/wishlist',wishlist)
router.get('/cart',cart)
router.get('/profile',userprofile)
router.get('/contactus',contactus)



//axios
router.get('/addtowishlist/:data',addtowishlist)
router.get('/deletefromwishlist/:data',deletefromwishlist)
router.get('/addtocart/:data',addtocart)
router.get('/deletefromcart/:data',deletefromcart)


export default router;
