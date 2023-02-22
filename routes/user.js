
import express ,{ Router} from "express";
import { forget3, forgottenPassword, getOtpValidate, getsignUpOtp, guestpage, postForgottenPassword, postOtpValidate, postsignUpOtp, userGetLogin, userGetSignup, userPostLogin, userPostSignup } from "../controllers/userController.js";

var router=express.Router()

router.get('/',guestpage)
router.get('/login',userGetLogin)
router.post('/login',userPostLogin)
router.get('/signup',userGetSignup)
router.post('/signup',userPostSignup)
router.get('/forgottenpassword',forgottenPassword)
router.post('/forgottenpassword',postForgottenPassword)
router.get('/otpValidate',getOtpValidate)
router.post('/otpValidate',postOtpValidate)
router.get('/signUpOtp',getsignUpOtp)
router.post('/signUpOtp',postsignUpOtp)

router.post('/forget3',forget3)


export default router
