import Express, { Router } from "express";
import {
  adminlogout,
  banner,
  couponManagement,
  deletecategory,
  deleteProduct,
  editcategory,
  getaddcategories,
  getaddProduct,
  getAdminPage,
  getdashboard,
  getEditProduct,
  getgategoriesManagemenet,
  getProductManagement,
  getuserManagement,
  ordermanagement,
  postaddcategories,
  postaddProduct,
  postAdminPage,
  postBanner,
  postCouponManagement,
  posteditcategory,
  postEditProduct,
  unlistcategory,
  unlistproduct,
  userban,
} from "../controllers/admincontroller.js";
import { ifadmin } from "../middleware/middleware.js";
import { multiupload, multiuploadcaro } from "../middleware/multer.js";

var router = Express.Router();

router.get("/",getAdminPage);
router.post("/", postAdminPage);
router.get("/dashboard",ifadmin, getdashboard);
router.get("/userManagement",ifadmin, getuserManagement);
router.get("/categoriesManagement",ifadmin, getgategoriesManagemenet);
router.get("/productManagement",ifadmin,getProductManagement);
router.get("/addProduct",ifadmin, getaddProduct);
router.post("/addProduct", multiupload, postaddProduct);
router.get("/addcategories",ifadmin, getaddcategories);
router.post("/addcategories", postaddcategories);
router.get("/editcategory/:id",ifadmin, editcategory);
router.post("/editcategory/:id", posteditcategory);
router.get("/deletecategory/:id",ifadmin, deletecategory);
router.get("/editproduct/:id",ifadmin, multiupload, getEditProduct);
router.post("/editproduct/:id", multiupload, postEditProduct);
router.get("/couponManagement",ifadmin, couponManagement);
router.post("/couponManagement", postCouponManagement);
router.get("/banner",ifadmin, banner);
router.post("/banner",multiuploadcaro,postBanner);
router.get('/ordermanagement',ifadmin,ordermanagement)
router.get("/logout",ifadmin, adminlogout);
//axios
router.get("/deleteproduct/:id",ifadmin, deleteProduct);
router.get("/categoryunlist/:id",ifadmin, unlistcategory);
router.get("/productunlist/:id",ifadmin, unlistproduct);
router.get("/userban/:id",ifadmin, userban);



export default router;
