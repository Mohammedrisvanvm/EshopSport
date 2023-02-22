
import express ,{ Router} from "express";
import { forget3, forgottenPassword, postForgottenPassword, userGetLogin, userGetSignup, userPostLogin, userPostSignup } from "../controllers/userController.js";

var router=express.Router()

router.get('/',userGetLogin)
router.post('/',userPostLogin)
router.get('/signup',userGetSignup)
router.post('/signup',userPostSignup)
router.get('/forgottenpassword',forgottenPassword)
router.post('/forgottenpassword',postForgottenPassword)
router.post('/otpValidation')
router.post('/forget3',forget3)


export default router
