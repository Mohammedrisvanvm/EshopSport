import express, { Router } from "express";
import {
  addresspage,
  addtocart,
  addtowishlist,
  cart,
  deletefromaddress,
  deletefromcart,
  deletefromwishlist,
  editAddress,
  editProfile,
  forgottenPassword,
  getcheckout,
  getforget3,
  getOtpValidate,
  getsignUpOtp,
  getUserPayment,
  guestpage,
  incdec,
  jersey,
  onlineorderconfirm,
  orderconfirmationpage,
  orderDetails,

  postaddresspage,
  postaddressprofile,
  postcheckout,
  postforget3,
  postForgottenPassword,
  postOtpValidate,
  postsignUpOtp,
  productCancel,
  productPage,
  productReturn,
  promoCode,
  resendOTP,
  search,
  shop,
  shorts,
  signupresendOTP,
  socks,
  uniqueorder,
  userGetLogin,
  userGetSignup,
  userlogout,
  userPostLogin,
  userPostSignup,
  userprofile,
  wallet,
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
router.get("/productpage/:id", productPage);
router.get("/wishlist", ifuser, wishlist);
router.get("/cart", ifuser, cart);
router.get("/profile", ifuser, userprofile);
router.post("/editProfile",ifuser,editProfile)
router.get("/shop", shop);
router.get("/jersey", jersey);
router.get("/shorts", shorts);
router.get("/socks", socks);

router.get("/checkout", ifuser, getcheckout);
router.post("/checkout", ifuser, postcheckout);
router.get("/address", ifuser, addresspage);
router.post("/address", postaddresspage);
router.post("/addressprofile", postaddressprofile);
router.get("/orderconfirmationpage",ifuser, orderconfirmationpage);
router.post("/editAddress", ifuser, editAddress);

router.get("/orders",ifuser, orderDetails);
router.get("/order/orderdetails", ifuser, uniqueorder);

router.post("/onlineorderconfirm", onlineorderconfirm);




//axios
router.get("/addtowishlist/:data",ifuser, addtowishlist);
router.get("/deletefromwishlist/:data", ifuser, deletefromwishlist);
router.get("/addtocart/:data", ifuser, addtocart);
router.get("/deletefromcart", ifuser, deletefromcart);
router.get("/incdec", ifuser, incdec);
router.get("/deletefromaddress", ifuser, deletefromaddress);
router.get("/promoCode", ifuser, promoCode);
router.get("/wallet", ifuser, wallet);
router.get("/productReturn", productReturn);
router.get("/cancelProduct", productCancel);
router.post("/search", search);

router.post('/verifyPayment',getUserPayment)

export default router;
