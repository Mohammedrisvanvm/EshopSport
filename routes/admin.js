import Express,{Router}  from "express";
import { getAdminPage, getdashboard, getgategories, postAdminPage, userManagement } from "../controllers/admincontroller.js";



var router=Express.Router()

router.get("/",getAdminPage)
router.post("/",postAdminPage)
router.get("/dashboard",getdashboard)
router.get('/userManagement',userManagement)
router.get('/categories',getgategories)






export default router