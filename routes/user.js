
import express ,{ Router} from "express";
import { userGetLogin, userGetSignup, userPostLogin, userPostSignup } from "../controllers/userController.js";

var router=express.Router()

router.get('/',userGetLogin)
router.post('/',userPostLogin)
router.get('/signup',userGetSignup)
router.post('/signup',userPostSignup)


export default router
