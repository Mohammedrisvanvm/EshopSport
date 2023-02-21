
import express ,{ Router} from "express";

var router=express.Router()

router.get('/',(req,res)=>{

    res.render("home")
})

export default router
