import { admins } from "../models/adminSchema.js";
import {categories} from "../models/categorySchema.js";
import { products } from "../models/productSchema.js";
import { users } from "../models/userSchema.js";



let emailerr = null;
let producterr = null;
let categorieserr=null

export function getAdminPage(req, res) {
  if(req.session.admin)
{
  console.log("getdash");
  res.render("index")
} else{
  console.log("getlogin");
  res.render("adminLogin", { error: emailerr });
  console.log(emailerr);
  emailerr = null;

}
}

export async function postAdminPage(req, res) {
  console.log(req.body);
  const { name, email, password } = req.body;
  const userinfo = await admins.findOne({ email });
  console.log(userinfo);
  if (!userinfo) {
    emailerr = "admin is not found";
    res.redirect("/admin");
  } else {
    if (
      name === userinfo.name &&
      email === userinfo.email &&
      password === userinfo.password
    ) {
      console.log(200, "success");
      req.session.admin={
        id:userinfo._id
      }
      console.log(req.session.admin);
      res.redirect("/admin");
    } else {
      emailerr = "password error";
      res.redirect("/admin");
    }
  }
}
export function getdashboard(req,res){
console.log("admin");
  res.redirect("/admin")
}
export async function getuserManagement(req,res){
  console.log("usermanage");
  const userinfo=await users.find().lean()

  res.render("userManagement",{userinfo})
}
export async function getgategoriesManagemenet(req,res){

  const categoryinfo=await categories.find()
  res.render("categoriesManagement",{categoryinfo})
}
export function getProductManagement(req,res) {
  console.log("admin profile");
  res.render('ProductManagement',{producterr})
   producterr = null;
}
export function getaddProduct(req,res) {
  res.render("addproduct",{producterr})
  producterr=null
  
}
export async function postaddProduct(req,res) {
  console.log("hi");
  console.log(req.body)
  console.log(req.files);
  const productinfo=await products.findOne({productName:req.body.productName})
  console.log(productinfo);
  if(!productinfo){
    try{
     
      
      const productadd=new products({
        productName:req.body.productName,
        category:req.body.category,
        quantity:req.body.quantity,
        MRP:req.body.MRP,
       price:req.body.price,
        mainImage:req.files.mainImage,
        subImages:req.files.subImages,
        description:req.body.description
       

         
          
          
      })
      await productadd.save();
      console.log("no");
      res.redirect("/admin/productManagement")
  }catch(err){
      console.log(err);

  }}
  else{
    producterr="already exist"
    res.redirect("/admin/addproduct")
  }
  
}




export async function getaddcategories(req,res){
console.log("get add categories");

res.render("addcategory",{categorieserr})
categorieserr=null
}
export async function postaddcategories(req,res){
  console.log("post addcategory");
  const categoryinfo=await categories.findOne({name:req.body.name})
  console.log(categoryinfo);
  if(!categoryinfo){
    try{
     
      
      const categoriesadd=new categories({
         
          name:req.body.name,
          
      })
      await categoriesadd.save();
      console.log("no");
      res.redirect("/admin/categoriesManagement")
  }catch(err){
      console.log(err);

  }}
  else{
    categorieserr="already exist"
    res.redirect("/admin/addcategories")
  }
  
}
