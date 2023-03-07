import sharp from "sharp";
import { admins } from "../models/adminSchema.js";
import { categories } from "../models/categorySchema.js";
import { products } from "../models/productSchema.js";
import { users } from "../models/userSchema.js";

let emailerr = null;
let producterr = null;
let categorieserr = null;
let imageerr = null;

export function getAdminPage(req, res) {
  try {
    if (req.session.admin) {
      res.render("index");
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
export function getdashboard(req, res) {
  res.redirect("/admin");
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
  try {
    const categoryname = req.body.name.toLowerCase();
    const categoryinfo = await categories.findOne({ name: categoryname });
    if (!categoryinfo) {
      try {
        const categoriesadd = new categories({
          name: categoryname,
        });
        await categoriesadd.save();
        res.redirect("/admin/categoriesManagement");
      } catch (err) {
        console.log(err);
      }
    } else {
      categorieserr = "already exist";
      res.redirect("/admin/addcategories");
    }
  } catch (error) {
    console.log(error);
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
      res.redirect("/admin/editcategory/");
    }
  } catch (error) {
    res.send(error);
  }
}

export async function deletecategory(req, res) {
  try {
    categories.findByIdAndDelete(
      { _id: req.params.id },
      req.body,
      (err, data) => {
        if (err) {
          next(err);
        } else {
          res.redirect("/admin/categoriesManagement");
        }
      }
    );
  } catch (error) {
    res.redirect("/admin/categoriesManagement");
    alert("not success");
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
export function adminlogout(req, res) {
  console.log("adminlogout");
  delete req.session.admin;
  res.redirect("/admin");
}
