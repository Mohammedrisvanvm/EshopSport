import Express, { Router } from "express";
import {
  adminlogout,
  deleteProduct,
  getaddcategories,
  getaddProduct,
  getAdminPage,
  getdashboard,
  getEditProduct,
  
  getgategoriesManagemenet,
  getProductManagement,
  getuserManagement,
  postaddcategories,
  postaddProduct,
  postAdminPage,
  postEditProduct,
  
} from "../controllers/admincontroller.js";
import { multiupload } from "../helpers/multer.js";

var router = Express.Router();

router.get("/", getAdminPage);
router.post("/", postAdminPage);
router.get("/dashboard", getdashboard);
router.get("/userManagement", getuserManagement);
router.get("/categoriesManagement", getgategoriesManagemenet);
router.get("/productManagement", getProductManagement);
router.get("/addProduct",getaddProduct)
router.post("/addProduct",multiupload,postaddProduct)
router.get("/addcategories", getaddcategories);
router.post("/addcategories", postaddcategories);
router.get("/editproduct/:id",multiupload,getEditProduct)
router.post("/editproduct",postEditProduct)
router.get("/deleteproduct/:id",deleteProduct)





router.get("/logout", adminlogout  );

export default router;
