import sharp from "sharp";
import { admins } from "../models/adminSchema.js";
import { categories } from "../models/categorySchema.js";
import { coupon } from "../models/couponSchema.js";
import { products } from "../models/productSchema.js";
import { users } from "../models/userSchema.js";

import { bannerModel } from "../models/bannerSchema.js";
import { orderModel } from "../models/orderSchema.js";
import { name } from "ejs";

let emailerr = null;
let producterr = null;
let categorieserr = null;
let imageerr = null;
let couponErr = null;

export async function getAdminPage(req, res) {
  try {
    if (req.session.admin) {
      let monthlyDataArray = await orderModel.aggregate([
        { $match: { paid: true } },

        {
          $group: {
            _id: { $month: "$createdAt" },
            revenue: { $sum: "$amountPayable" },
          },
        },
      ]);

      let monthlyDataObject = {};
      monthlyDataArray.map((item) => {
        monthlyDataObject[item._id] = item.revenue;
      });

      let monthlyData = [];
      for (let i = 1; i <= 12; i++) {
        monthlyData[i - 1] = monthlyDataObject[i] ?? 0;
      }

      res.render("index", { monthlyData });
    } else {
      res.render("adminLogin", { error: emailerr });

      emailerr = null;
    }
  } catch (error) {
    res.status(500).send(error);
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
    res.status(500).send(error);
  }
}

export async function getuserManagement(req, res) {
  try {
    const userinfo = await users.find().lean();

    res.render("userManagement", { userinfo });
  } catch (error) {
    res.status(500).send(error);
  }
}

export async function getProductManagement(req, res) {
  try {
    const productinfo = await products.find().lean();
    res.render("productManagement", { producterr, productinfo });
    producterr = null;
  } catch (error) {
    res.status(500).send(error);
  }
}
export async function getaddProduct(req, res) {
  try {
    const categoryinfo = await categories.find();

    res.render("addProduct", { producterr, imageerr, categoryinfo });

    producterr = null;
    imageerr = null;
  } catch (error) {
    res.status(500).send(error);
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
      res.status(500).send(error);
      res.redirect("/admin/addproduct");
    }
  });
}
export async function getgategoriesManagemenet(req, res) {
  try {
    const categoryinfo = await categories.find();
    res.render("categoriesManagement", { categoryinfo });
  } catch (error) {
    res.status(500).send(error);
  }
}
export async function getaddcategories(req, res) {
  res.render("addCategory", { categorieserr });
  categorieserr = null;
}

export async function postaddcategories(req, res) {
  try {
    const { CategoryName } = req.body;
    console.log(req.body);

    if (!CategoryName) {
      categorieserr = "input field is empty";
      return res.redirect("/admin/addcategories");
    }
  

    const Category = CategoryName.toLowerCase();
    const categoryInfo = await categories.findOne({ name: Category });
    if (!categoryInfo) {
      const categoriesAdd = new categories({ name: Category });
      await categoriesAdd.save();
   return   res.redirect("/admin/categoriesManagement");
    } else {
      categorieserr = "already exits";
    return  res.redirect("/admin/addcategories");
    }
  } catch (error) {
 return   res.status(500).send(error).redirect("/admin/addcategories");
    // res.redirect("/admin/addcategories");
  }
}

export async function editcategory(req, res) {
  try {
    const categoryinfo = await categories.findById(req.params.id);

    res.render("editcategory", { categoryinfo });
  } catch (error) {
    res.status(500).send(error);
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
      res.redirect(304, "/admin/editcategory");
    }
  } catch (error) {
    res.status(500).send(error);
  }
}

export async function getEditProduct(req, res) {
  try {
    const categoryinfo = await categories.find();
    const productinfo = await products.findById(req.params.id);
    res.render("productedit", { categoryinfo, imageerr, productinfo });
  } catch (error) {
    res.status(500).send(error);
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

    res.render("couponManagement", { couponinfo, couponErr });
    couponErr = null;
  } catch (error) {
    res.status(500).send(error);
  }
}
export async function postCouponManagement(req, res) {
  try {
    console.log(req.body);
    const { name, couponCode, minamount, discount, maxdiscount, expiry } =
      req.body;
    let couponinfo = await coupon.findOne({ couponCode: "couponCode" });
    console.log(couponCode);
    if (!couponinfo) {
      let addcoupon = new coupon({
        name: name,
        couponCode: couponCode,
        minamount: minamount,
        discount: discount,
        maxdiscount: maxdiscount,
        expiry: expiry,
      });
      await addcoupon.save();
      res.redirect("/admin/couponManagement");
    } else {
      couponErr = "couponcode is already created";
      res.redirect("/admin/couponManagement");
    }
  } catch (error) {
    res.status(500).send(error);
  }
}
export async function banner(req, res) {
  let banner = await bannerModel.find();

  res.render("bannerManagement", { banner });
}
export async function addBanner(req, res) {
  res.render("addBanner");
}
export async function postBanner(req, res) {
  try {
    const imageadd = new bannerModel({
      Name: req.body.Name,
      mainImage: req.files.mainImage,
    });
    await imageadd.save();

    res.redirect("/admin/banner");
  } catch (error) {
    res.status(500).send(error);

    res.redirect("/admin/banner");
  }
}
export async function ordermanagement(req, res) {
  const orderinfo = await orderModel.find().sort({ _id: -1 });

  res.render("orderManagement", { orderinfo });
}
export async function salesReport(req, res) {
  const orderinfo = await orderModel.find().sort({ _id: -1 });
  let result = await orderModel.aggregate([
    { $match: { paid: true } },
    {
      $group: {
        _id: "",
        users: { $addToSet: "$userId" },
        usersCount: { $sum: { $cond: [{ $eq: ["$userId", null] }, 0, 1] } },
        revenue: { $sum: "$amountPayable" },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        revenue: 1,
        count: 1,
        usersCount: { $size: "$users" },
      },
    },
  ]);

  res.render("salesReport", { orderinfo, result });
}

export function adminlogout(req, res) {
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
      res.status(500).send(error);
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
      res.status(500).send(error);
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
    res.status(500).send(error);
  }
}
export async function deleteFromProductEdit(req, res) {
  const { pId, data } = req.query;
  try {
    const productinfo = await products.updateOne(
      {
        _id: pId,
      },
      { $pull: { subImages: { filename: req.query.data } } }
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
}
export async function deleteBanner(req, res) {
  const { pId, data } = req.query;
  try {
    const productinfo = await bannerModel.deleteOne({
      _id: pId,
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
}
export async function listBanner(req, res) {
  try {
    const bannerinfo = await bannerModel.findById({
      _id: req.query.id,
    });

    if (bannerinfo.list == false) {
      await bannerModel.updateOne(
        {
          _id: req.query.id,
        },
        { $set: { list: true } }
      );

      res.json({ success: true });
    } else {
      await bannerModel.updateOne(
        {
          _id: req.query.id,
        },
        { $set: { list: false } }
      );

      res.json({ success: false });
    }
  } catch (error) {
    res.status(500).send(error);
  }
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
    res.status(500).send(error);
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
    }
  } catch (error) {
    res.status(500).send(error);
  }
}
export async function deletecoupon(req, res) {
  await coupon.findByIdAndDelete({ _id: req.params.id });

  res.json({ success: true });
}
export async function editcoupon(req, res) {
  try {
    const { name, couponCode, minamount, discount, maxdiscount, expiry } =
      req.body;
    await coupon.findByIdAndUpdate(
      { _id: req.query.id },
      {
        $set: {
          name: name,
          couponCode: couponCode,
          minamount: minamount,
          discount: discount,
          maxdiscount: maxdiscount,
        },
      }
    );
    if (expiry) {
      await coupon.updateOne(
        { _id: req.query.id },
        {
          $set: {
            expiry: expiry,
          },
        }
      );
    }

    res.redirect("back");
  } catch (error) {
    res.status(500).send(error);
  }
}
export async function salesReportData(req, res) {
  try {
    const { startDate, endDate } = req.query;

    let datedata = await orderModel
      .find({ createdAt: { $gte: startDate, $lt: endDate } })
      .sort({ _id: -1 })
      .lean();

    res.json({ success: true, orderinfo: datedata });
  } catch (error) {
    res.status(500).send(error);
  }
}
