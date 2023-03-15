import express, { Router } from "express";
import {
  addresspage,
  addtocart,
  addtowishlist,
  cart,
  contactus,
  deletefromaddress,
  deletefromcart,
  deletefromwishlist,
  editaddress,
  forgottenPassword,
  getcheckout,
  getforget3,
  getOtpValidate,
  getsignUpOtp,
  guestpage,
  incdec,
  newp,
  payment,
  postaddresspage,
  postaddressprofile,
  postcheckout,
  postforget3,
  postForgottenPassword,
  postOtpValidate,
  postsignUpOtp,
  productPage,
  promoCode,
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
import { ifuser } from "../middleware/middleware.js";

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
router.get('/wishlist',ifuser,wishlist)
router.get('/cart',ifuser,cart)
router.get('/profile',ifuser,userprofile)
router.get('/contactus',contactus)
router.get('/checkout',ifuser,getcheckout)
router.post('/checkout',ifuser,postcheckout)
router.get('/address',ifuser,addresspage)
router.post('/address',postaddresspage)
router.post('/addressprofile',postaddressprofile)

router.get('/editprofile/:data',editaddress)
router.get("/trash",payment)



//axios
router.get('/addtowishlist/:data',ifuser,addtowishlist)
router.get('/deletefromwishlist/:data',deletefromwishlist)
router.get('/addtocart/:data',ifuser,addtocart)
router.get('/deletefromcart/:data',deletefromcart)
router.get('/incdec',incdec)
router.get("/deletefromaddress/:data",deletefromaddress)
router.get('/promoCode/:data',promoCode)


router.get('/new',newp)

export default router;
