import Express,{Router}  from "express";
import { getAdminPage, postAdminPage } from "../controllers/admincontroller.js";



var router=Express.Router()

router.get("/",getAdminPage)
router.post("/",postAdminPage)





export default router