import Express,{Router}  from "express";
import { getAdminPage, postAdminPage } from "../controllers/admincontroller.js";



var router=Express.Router()

router.get("/",getAdminPage)
router.post("/",postAdminPage)
// router.get("/test",(req,res)=>{
//     res.render("index")
// })





export default router