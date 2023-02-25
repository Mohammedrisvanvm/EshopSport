import Express,{Router}  from "express";
import { getAdminPage, getdashboard, postAdminPage, userManagement } from "../controllers/admincontroller.js";



var router=Express.Router()

router.get("/",getAdminPage)
router.post("/",postAdminPage)
router.get("/dashboard",getdashboard)
router.get('/userManagement',userManagement)






export default router