import Express,{Router}  from "express";
import { getAdminPage } from "../controllers/admincontroller.js";



var router=Express.Router()

router.get("/",getAdminPage)






export default router