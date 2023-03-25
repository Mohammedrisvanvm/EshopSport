import sharp from "sharp";
import { admins } from "../models/adminSchema.js";
import { categories} from "../models/categorySchema.js";
import { coupon } from "../models/couponSchema.js";
import { products } from "../models/productSchema.js";
import { users } from "../models/userSchema.js";

import { bannerimage } from "../models/bannerSchema.js";
import { orderModel } from "../models/orderSchema.js";

let emailerr = null;
let producterr = null;
let categorieserr = null;
let imageerr = null;

export async function getAdminPage(req, res) {
  try {
    if (req.session.admin) {
      let monthlyDataArray=await orderModel.aggregate([
        {$match:{paid:true}},
        
         { $group: {
            _id: { $month: "$createdAt" },
            revenue: { $sum: "$amountPayable" },
          }},
      ])

      let monthlyDataObject = {};
      monthlyDataArray.map((item) => {
        monthlyDataObject[item._id] = item.revenue;
      });
      console.log(monthlyDataArray,monthlyDataObject);
      let monthlyData = [];
      for (let i = 1; i <= 12; i++) {
        monthlyData[i - 1] = monthlyDataObject[i] ?? 0;
      }
      console.log(monthlyData);
      res.render("index",{monthlyData});
    } else {
      res.render("adminLogin", { error: emailerr });

      emailerr = null;
    }
  } catch (error) {
    console.log(error);
  }
}

export async function postAdminPage(req, res) {
  try {
    const { name, email, password } = req.body;
    const userinfo = await admins.findOne({ email });
    if (!userinfo) {
      emailerr = "admin is not found";
      res.redirect("/admin");
    } else {
      if (
        name === userinfo.name &&
        email === userinfo.email &&
        password === userinfo.password
      ) {
        req.session.admin = {
          id: userinfo._id,
        };
        res.redirect("/admin");
      } else {
        emailerr = "password error";
        res.redirect("/admin");
      }
    }
  } catch (error) {
    console.log(error);
  }
}

export async function getuserManagement(req, res) {
  try {
    const userinfo = await users.find().lean();

    res.render("userManagement", { userinfo });
  } catch (error) {
    console.log(error);
  }
}

export async function getProductManagement(req, res) {
  try {
    const productinfo = await products.find().lean();
    res.render("ProductManagement", { producterr, productinfo });
    producterr = null;
  } catch (error) {
    console.log(err);
  }
}
export async function getaddProduct(req, res) {
  try {
    const categoryinfo = await categories.find();
    console.log(categoryinfo);
    res.render("addproduct", { producterr, imageerr, categoryinfo });

    producterr = null;
    imageerr = null;
  } catch (error) {
    console.log(error);
    res.redirect("/admin/addproduct");
  }
}
export function postaddProduct(req, res) {
  return new Promise(async (resolve, reject) => {
    try {
      const productinfo = await products.findOne({
        productName: req.body.productName,
      });

      if (!productinfo) {
        sharp(req.files.mainImage[0].path)
          .png()
          .resize(300, 300, {
            kernel: sharp.kernel.nearest,
            fit: "contain",
            position: "center",
            background: { r: 255, g: 255, b: 255, alpha: 0 },
          })
          .toFile(req.files.mainImage[0].path + ".png")
          .then(() => {
            req.files.mainImage[0].filename =
              req.files.mainImage[0].filename + ".png";
            req.files.mainImage[0].path = req.files.mainImage[0].path + ".png";
          });
        const productadd = new products({
          productName: req.body.productName,
          category: req.body.category,
          quantity: req.body.quantity,
          MRP: req.body.MRP,
          price: req.body.price,
          mainImage: req.files.mainImage,
          subImages: req.files.subImages,
          description: req.body.description,
        });
        await productadd.save();
        res.redirect("/admin/productManagement");
      } else {
        producterr = "already exist";
        res.redirect("/admin/addproduct");
      }
    } catch (err) {
      imageerr = "not a image";
      console.log(err);
      res.redirect("/admin/addproduct");
    }
  });
}
export async function getgategoriesManagemenet(req, res) {
  try {
    const categoryinfo = await categories.find();
    res.render("categoriesManagement", { categoryinfo });
  } catch (error) {
    console.log(error);
  }
}
export async function getaddcategories(req, res) {
  res.render("addcategory", { categorieserr });
  categorieserr = null;
}

export async function postaddcategories(req, res) {
  console.log(req.body);
  try {
    const { Category, subCategory } = req.body;

    if (!Category && !subCategory) {
      throw new Error("No category or subcategory provided");
    }

    if (Category) {
      const categoryName = Category.toLowerCase();
      const categoryInfo = await categories.findOne({ name: categoryName });
      if (!categoryInfo) {
        const categoriesAdd = new categories({ name: categoryName });
        await categoriesAdd.save();
        return res.redirect("/admin/categoriesManagement");
      }
    }

    if (subCategory) {
      const subCategoryName = subCategory.toLowerCase();
      const subCategoryInfo = await subCategories.findOne({
        name: subCategoryName,
      });
      if (!subCategoryInfo) {
        const subCategoriesAdd = new subCategories({ name: subCategoryName });
        await subCategoriesAdd.save();
        return res.redirect("/admin/categoriesManagement");
      }
    }

    categorieserr = "already exits";
    res.redirect("/admin/addcategories");
  } catch (error) {
    console.log(error);
    res.redirect("/admin/addcategories");
  }
}

export async function editcategory(req, res) {
  try {
    const categoryinfo = await categories.findById(req.params.id);

    res.render("editcategory", { categoryinfo });
  } catch (error) {
    res.send(error);
  }
}
export async function posteditcategory(req, res) {
  try {
    let category;
    const categoryinfo = await categories.findOne({ name: req.body.name });
    if (!categoryinfo) {
      category = await categories.updateOne(
        { _id: req.params.id },
        {
          $set: {
            name: req.body.name,
          },
        }
      );
      res.redirect("/admin/categoriesManagement");
    } else {
      res.redirect(304,"/admin/editcategory");
    }
  } catch (error) {
    res.send(error);
  }
}

export async function getEditProduct(req, res) {
  try {
    const categoryinfo = await categories.find();
    const productinfo = await products.findById(req.params.id);
    res.render("productedit", { categoryinfo, imageerr, productinfo });
  } catch (error) {
    console.log(error);
    imageerr = "not a image";
  }
}
export async function postEditProduct(req, res) {
  const id = req.params.id;
  const { productName, category, quantity, price, MRP, description } = req.body;
  try {
    let product;
    product = await products.updateOne(
      { _id: id },
      {
        $set: {
          productName: productName,
          category: category,
          quantity: quantity,
          price: price,
          MRP: MRP,
          description: description,
          mainImage: req.files.mainImage,
          subImages: req.files.subImages,
        },
      }
    );

    res.redirect("/admin/productManagement");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export async function deleteProduct(req, res) {
  try {
    products.findByIdAndDelete(
      { _id: req.params.id },
      req.body,
      (err, data) => {
        if (err) {
          next(err);
        } else {
          res.redirect("/admin/productManagement");
        }
      }
    );
  } catch (error) {
    res.redirect("/admin/productManagement");
    alert("not success");
  }
}

export async function couponManagement(req, res) {
  try {
    const couponinfo = await coupon.find();

    res.render("couponManagement", { couponinfo });
  } catch (error) {
    console.log(error);
  }
}
export async function postCouponManagement(req, res) {
  try {
    let addcoupon = new coupon({
      name: req.body.name,
      couponCode: req.body.couponCode,
      minamount: req.body.minamount,
      discount: req.body.discount,
      maxdiscount: req.body.maxdiscount,
      expiry: req.body.expiry,
    });
    await addcoupon.save();
    res.redirect("/admin/couponManagement");
  } catch (error) {
    console.log(error);
  }
}
export async function banner(req, res) {
  let banner = await bannerimage.find();

  let bannerimage1 = banner.map((item) => item.mainImage[0]);

  res.render("bannerManagement", { bannerimage1 });
}
export async function postBanner(req, res) {
  try {
    const imageadd = new bannerimage({
      mainImage: req.files.mainImage,
    });
    await imageadd.save();

    res.redirect("/admin/banner");
  } catch (error) {
    console.log(error);

    res.redirect("/admin/banner");
  }
}
export async function ordermanagement(req, res) {
  const orderinfo = await orderModel.find().sort({ _id: -1 });

  res.render("orderManagement", { orderinfo });
}
export async function salesReport(req, res) {
  const orderinfo = await orderModel.find().sort({ _id: -1 });
  let revenue = await orderModel.aggregate([
    { $match: { paid: true } },
    {
      $group: {
        _id: "",
        users: { $addToSet: "$userId" },
        usersCount: { $sum: { $cond: [{ $eq: ["$userId", null] }, 0, 1] } },
        revenue: { $sum: "$amountPayable" },
        count: { $sum: 1 }
      }
    },
    { $project: { _id: 0,revenue:1,count:1, usersCount: { $size: "$users" } } }
  ]);
  
 
  

  
console.log(revenue[0]);

  res.render("salesReport",{orderinfo,revenue});
}

export function adminlogout(req, res) {
  console.log("adminlogout");
  delete req.session.admin;
  res.redirect("/admin");
}

//axios

export function unlistcategory(req, res) {
  return new Promise(async (resolve, reject) => {
    try {
      const categoryinfo = await categories.findById({ _id: req.params.id });

      const { list, name } = categoryinfo;
      if (list == false) {
        await categories.updateOne(
          { _id: req.params.id },
          { $set: { list: "true" } }
        );
        res.json({ success: false });
      } else {
        await categories.updateOne(
          { _id: req.params.id },
          { $set: { list: "false" } }
        );
        res.json({ success: true });
      }
    } catch (error) {
      console.log(error);
      res.send("Failed to unlist category.");
    }
  });
}
export function unlistproduct(req, res) {
  return new Promise(async (resolve, reject) => {
    try {
      const productinfo = await products.findById({ _id: req.params.id });
      const { list, name } = productinfo;
      if (list == false) {
        await products.updateOne(
          { _id: req.params.id },
          { $set: { list: "true" } }
        );
        res.json({ success: false });
      } else {
        await products.updateOne(
          { _id: req.params.id },
          { $set: { list: "false" } }
        );
        res.json({ success: true });
      }
    } catch (error) {
      console.log(error);
      res.send("Failed to unlist category.");
    }
  });
}
export async function userban(req, res) {
  try {
    const userinfo = await users.findById({
      _id: req.params.id,
    });
    const { ban } = userinfo;
    if (ban == false) {
      await users.updateOne(
        {
          _id: req.params.id,
        },
        { $set: { ban: "true" } }
      );

      res.json({ success: true });
    } else {
      await users.updateOne(
        {
          _id: req.params.id,
        },
        { $set: { ban: "false" } }
      );

      res.json({ success: false });
    }
  } catch (error) {
    res.send(error);
  }
}
export async function deleteFromProductEdit(req, res) {
  const { pId, data } = req.query;
  try {
    const productinfo = await products
      .updateOne(
        {
          _id: pId,
        },
        { $pull: { subImages: { filename: req.query.data } } }
      )
      .then((result) => {
        console.log(result);
      });
    res.json({ success: true });
  } catch (error) {}
}
export async function listCoupon(req, res) {
  try {
    const couponinfo = await coupon.findById({
      _id: req.params.id,
    });
    const { list } = couponinfo;
    if (list == false) {
      await coupon.updateOne(
        {
          _id: req.params.id,
        },
        { $set: { list: "true" } }
      );

      res.json({ success: true });
    } else {
      await coupon.updateOne(
        {
          _id: req.params.id,
        },
        { $set: { list: "false" } }
      );

      res.json({ success: false });
    }
  } catch (error) {
    res.send(error);
  }
}

export async function changestatus(req, res) {
  try {
    const { id, toChange } = req.query;

    if (toChange == "pending") {
      await orderModel.updateOne(
        {
          _id: id,
        },
        { $set: { orderStatus: toChange } }
      );
      res.json({ status: "pending" });
    } else if (toChange == "shipped") {
      await orderModel.updateOne(
        {
          _id: id,
        },
        { $set: { orderStatus: toChange } }
      );
      res.json({ status: "shipped" });
    } else if (toChange == "out for delivery") {
      await orderModel.updateOne(
        {
          _id: id,
        },
        { $set: { orderStatus: toChange } }
      );
      res.json({ status: "outForDelivery" });
    } else if (toChange == "delivered") {
      await orderModel.updateOne(
        { _id: id },
        {
          $set: {
            orderStatus: toChange,
            paid: true,
            deliveredDate: new Date(),
          },
        }
      );

      res.json({ status: "delivered" });
    } else {
      console.log("not matched");
    }
  } catch (error) {
    res.send(error);
  }
}
export async function deletecoupon(req,res){
  console.log(req.params.id);
  await coupon.findByIdAndDelete({_id:req.params.id}).then((result)=>console.log(result))
  res.json({success:true})
}
export async function salesReportData(req,res){
  console.log(req.query);
}
