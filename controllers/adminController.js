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
    console.log(req.session.admin);
    if (req.session.admin) {
      console.log("getdash");
      res.render("index");
    } else {
      console.log("getlogin");
      res.render("adminLogin", { error: emailerr });
      console.log(emailerr);
      emailerr = null;
    }
  } catch (error) {
    console.log(error);
  }
}

export async function postAdminPage(req, res) {
  try {
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
        req.session.admin = {
          id: userinfo._id,
        };
        console.log(req.session.admin);
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
  console.log("admin");
  res.redirect("/admin");
}
export async function getuserManagement(req, res) {
  try {
    console.log("usermanage");
    const userinfo = await users.find().lean();

    res.render("userManagement", { userinfo });
  } catch (error) {
    console.log(error);
  }
}

export async function getProductManagement(req, res) {
  try {
    const productinfo = await products.find().lean();

    console.log("admin profile");

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
export async function postaddProduct(req, res) {
  try {
    console.log("hi");
    console.log(req.body);
    console.log(req.files);
    const productinfo = await products.findOne({
      productName: req.body.productName,
    });
    console.log(productinfo);
    if (!productinfo) {
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
      console.log("no");
      res.redirect("/admin/productManagement");
    } else {
      producterr = "already exist";
      res.redirect("/admin/addproduct");
    }
  } catch (err) {
    imageerr = "not a image";
    console.log("not a image");
    console.log(err);
    res.redirect("/admin/addproduct");
  }
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
  console.log("get add categories");

  res.render("addcategory", { categorieserr });
  categorieserr = null;
}
export async function postaddcategories(req, res) {
  try {
    console.log("post addcategory");
    const categoryinfo = await categories.findOne({ name: req.body.name });
    console.log(categoryinfo);
    if (!categoryinfo) {
      try {
        const categoriesadd = new categories({
          name: req.body.name,
        });
        await categoriesadd.save();
        console.log("no");
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
export async function getEditProduct(req, res) {
  try {
    const categoryinfo = await categories.find();
    console.log(req.params);
    const productinfo = await products.findById(req.params.id);

    res.render("productedit", { categoryinfo, imageerr, productinfo });
  } catch (error) {
    console.log(error);
    imageerr = "not a image";
  }
}
export async function postEditProduct(req, res) {
  console.log(req.body);
 const id=req.params.id
  const{productName,category,quantity,price,MRP,description}=req.body
  try {
    let product;
    console.log(id);
    if (req.files?.mainImage && req.files?.subImages) {
      product = await products.updateOne(
        { _id:id },
        {
          $set: {
            productName,
            category,
            
            quantity,
            price,
            MRP,
            description,
            mainImage: req.files.mainImage[0],
            subImages: req.files.subimage,
          },
        }
      );
    } else if (!req.files?.mainImage && req.files?.subImages) {
      product = await products.updateOne(
        {_id: id },
        {
          $set: {
            productName,
            category,
            quantity,
            price,
            MRP,
            description,
            subImages: req.files.subImages,
          },
        }
      );
    } else if (!req.files?.mainImage && !req.files?.subImages) {
      product = await products.updateOne(
        { _id:id },
        {
          $set: {
            productName,
            category,
            quantity,
            price,
            MRP,
            description,
          },

        }
      );
    } else if (req.files?.mainImage && !req.files?.subImages) {
      product = await products.updateOne(
        { _id:id },
        {
          $set: {
            productName,
            category,
            quantity,
            price,
            MRP,
            description,
            MainImage: req.files.mainImage[0],
          },
        }
      );
    }
     res.redirect("/admin/productManagement");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};


export async function deleteProduct(req, res) {
  try {
    console.log(req.params);

    console.log("success");
    products.findByIdAndDelete(
      { _id: req.params.id },
      req.body,
      (err, data) => {
        if (err) {
          console.log("not get");
          next(err);
        } else {
          console.log("deleted successfullyyy");
          res.redirect("/admin/productManagement");
        }
      }
    );
  } catch (error) {
    res.redirect("/admin/productManagement");
    alert("not success");
  }
}

export function adminlogout(req, res) {
  console.log("logout");
  delete req.session.admin;
  res.redirect("/admin");
}
