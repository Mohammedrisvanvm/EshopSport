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
} from "../controllers/admincontroller.js";
import { multiupload, multiuploadcaro } from "../middleware/multer.js";

var router = Express.Router();

router.get("/", getAdminPage);
router.post("/", postAdminPage);
router.get("/dashboard", getdashboard);
router.get("/userManagement", getuserManagement);
router.get("/categoriesManagement", getgategoriesManagemenet);
router.get("/productManagement", getProductManagement);
router.get("/addProduct", getaddProduct);
router.post("/addProduct", multiupload, postaddProduct);
router.get("/addcategories", getaddcategories);
router.post("/addcategories", postaddcategories);
router.get("/editcategory/:id", editcategory);
router.post("/editcategory/:id", posteditcategory);
router.get("/deletecategory/:id", deletecategory);
router.get("/editproduct/:id", multiupload, getEditProduct);
router.post("/editproduct/:id", multiupload, postEditProduct);
router.get("/couponManagement", couponManagement);
router.post("/couponManagement", postCouponManagement);
router.get("/banner", banner);
router.post("/banner",multiuploadcaro,postBanner);
router.get('/ordermanagement',ordermanagement)

//axios
router.get("/deleteproduct/:id", deleteProduct);
router.get("/categoryunlist/:id", unlistcategory);
router.get("/productunlist/:id", unlistproduct);

router.get("/logout", adminlogout);

export default router;
