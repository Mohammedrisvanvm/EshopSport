import createDocument from "../helpers/insertToDb.js";
import { users } from "../models/userSchema.js";
import sentOTP from "../helpers/emailSend.js";
import otpGenerator from "otp-generator";
import bcrypt from "bcrypt";
import { products } from "../models/productSchema.js";
import uniqid from "uniqid";
import { coupon } from "../models/couponSchema.js";
import { orderModel } from "../models/orderSchema.js";

import { bannerModel } from "../models/bannerSchema.js";
import { createId } from "../helpers/createId.js";
import Razorpay from "razorpay";


let passworderr = null;
let emailerr = null;

let loginvalue = null;
let otperr = null;
let addressError = null;
let quantityerr = null;


let otp = otpGenerator.generate(6, {
  upperCaseAlphabets: false,
  specialChars: false,
});
var instance = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});
export async function guestpage(req, res) {
  try {
    const jerseyinfo = await products
      .aggregate([
        { $match: { category: "jersey", list: true } },
        { $sort: { _id: -1 } },
        { $limit: 4 },
      ])
      .exec();
    const shortsinfo = await products
      .aggregate([
        { $match: { category: "shorts", list: true } },
        { $sort: { _id: -1 } },
        { $limit: 4 },
      ])
      .exec();
    const socksinfo = await products
      .aggregate([
        { $match: { category: "socks", list: true } },
        { $sort: { _id: -1 } },
        { $limit: 4 },
      ])
      .exec();
      let ifuser=req.session.user
    let banner = await bannerModel.find({ list: true });

    res.render("guest", { jerseyinfo, shortsinfo, socksinfo, banner, ifuser });
  } catch (error) {
    res.status(500).send("Error fetching product data.");
  }
}
export async function shop(req, res) {
  let ifuser=req.session.user
  try {
    let productinfo;
    let pipeline = [];
    let sort = req.query.sort ?? 0;
    if (req.query.sort) {
      pipeline.push({ $sort: { price: parseInt(req.query.sort) } });
    }
    let filter = req.query.filter ?? "";
    if (req.query.filter) {
      pipeline.push({ $match: { category: req.query.filter } });
    }
    let search = req.query.search ?? "";
    if (req.query.search) {
      pipeline.push({ $match: { productName: RegExp(req.query.search, "i") } });
    } else {
      pipeline.push({ $match: { list: true } });

      productinfo = await products.aggregate(pipeline);
    }

    // pagination
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = 4;
    const skip = (page - 1) * limit;

    let countPipeline = [...pipeline];
    countPipeline.push({ $count: "total" });
    const countResult = await products.aggregate(countPipeline);
    const productCount = countResult.length > 0 ? countResult[0].total : 0;
    const totalPage = Math.ceil(productCount / limit);
    let pagination = [];

    for (let i = 1; i <= totalPage; i++) {
      pagination.push(i);
    }

    pipeline.push({ $skip: skip }, { $limit: limit });
    productinfo = await products.aggregate(pipeline);

    res.render("shop", {
      productinfo,
      ifuser,
      pagination,
      sort,
      filter,
      search,
    });
  } catch (error) {
    res.status(500).send("Error fetching product data.");
  }
}

export async function jersey(req, res) {
  let ifuser=req.session.user
  try {
    let search = req.query.search 
let productinfo
    if (search) {
    productinfo = await products.find(
       {
            category: "jersey",
            list: true,
            productName: RegExp(search, "i"),
          },
       
      )
    }else{
 productinfo = await products.find({ category: "jersey", list: true });
    } 
  

    res.render("jersey", { productinfo, ifuser });
   
  } catch (error) {
    res.status(500).send("Error fetching product data.");
    console.log(error);
  }
}
export async function shorts(req, res) {
  let ifuser=req.session.user
  try {
    let search = req.query.search 
    let productinfo
        if (search) {
        productinfo = await products.find(
           {
                category: "shorts",
                list: true,
                productName: RegExp(search, "i"),
              },
           
          )
        }else{
     productinfo = await products.find({ category: "shorts", list: true });
        } 
    res.render("shorts", { productinfo, ifuser });
  } catch (error) {
    res.status(500).send("Error fetching product data.");
  }
}
export async function socks(req, res) {
  let ifuser=req.session.user
  try {
    let search = req.query.search 
    let productinfo
        if (search) {
        productinfo = await products.find(
           {
                category: "socks",
                list: true,
                productName: RegExp(search, "i"),
              },
           
          )
        }else{
     productinfo = await products.find({ category: "socks", list: true });
        } 
    res.render("socks", { productinfo, ifuser });
  } catch (error) {
    res.status(500).send("Error fetching product data.");
  }
}

export function userGetLogin(req, res) {
  try {
    if (!req.session.user) {
      res.render("login", { emailerr });
      emailerr = null;
    } else {
      res.redirect("/");
    }
  } catch (error) {
    res.status(500).send("Error fetching product data.");
  }
}

export async function userPostLogin(req, res) {
  try {
    const { email, password } = req.body;

    const userinfo = await users.findOne({ email });

    if (!userinfo) {
      emailerr = "not found email";
      res.redirect("/login");
    } else if (userinfo.ban == false) {
      emailerr = "you are banned";
      res.redirect("/login");
    } else {
      bcrypt.compare(password, userinfo.password).then((result) => {
        if (email == userinfo.email && result == true) {
          req.session.user = userinfo;

          res.redirect("/");
        } else {
          emailerr = "password error";
          res.redirect("/login");
        }
      });
    }
  } catch (error) {
    res.status(500).send("Error fetching product data.");
  }
}
export function userGetSignup(req, res) {
  res.render("signup", { passworderr, emailerr, warning: false });
  passworderr = null;
  emailerr = null;
}
export async function userPostSignup(req, res) {
  try {
    const { password, conpassword, email } = req.body;
    if (password == conpassword) {
      const userinfo = await users.findOne({ email });

      if (!userinfo) {
        req.session.value = req.body;
        req.session.email = email;
        sentOTP(email, otp);
        req.session.otp = otp;

        res.redirect("/signUpOtp");
      } else {
        emailerr = "email is already exist";
        res.redirect("/signup");
      }
    } else {
      passworderr = "password is not matching";

      res.redirect("/signup");
    }
  } catch (error) {
    res.status(500).send("Error fetching product data.");
  }
}
export function getsignUpOtp(req, res) {
  res.render("signUpOtp", { otperr });
  otperr = null;
}
export function postsignUpOtp(req, res) {
  if (req.body.otp == req.session.otp) {
    createDocument(req.session.value);
    res.redirect("/login");
    req.session.value = null;
  } else {
    otperr = "wrong otp";
    res.redirect("/signUpOtp");
  }
}
export function signupresendOTP(req, res) {
  let otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
  });

  sentOTP(req.session.email, otp);
  req.session.otp = otp;

  res.redirect("/signupotp");
}
//signup closed

export function forgottenPassword(req, res) {
  res.render("otp", { emailerr });
  emailerr = null;
}
export async function postForgottenPassword(req, res) {
  try {
    const email = req.body.email;

    const userinfo = await users.findOne({ email });
    if (!userinfo) {
      emailerr = "not found please signup";
      res.redirect("/otp");
    } else {
      sentOTP(email, otp);

      req.session.email = email;
      req.session.otp = otp;
      loginvalue = req.body;
      res.redirect("/otpValidate");
    }
  } catch (error) {
    res.status(500).send("Error fetching product data.");
  }
}
export function resendOTP(req, res) {
  let otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
  });

  sentOTP(req.session.email, otp);
  req.session.email = req.session.email;
  req.session.otp = otp;

  res.redirect("/otpValidate");
}
export function getOtpValidate(req, res) {
  res.render("otpValidation", { otperr });
  otperr = null;
}
export function postOtpValidate(req, res) {
  if (req.session.otp == req.body.otp) {
    res.redirect("/forget3");
  } else {
    otperr = "otp invalid";
    res.redirect("/otpValidate");
  }
}
export function getforget3(req, res) {
  res.render("newPassword", { passworderr });
  passworderr = null;
}
export async function postforget3(req, res) {
  try {
    let email = req.session.email;
    const userinfo = await users.findOne({ email });

    if (req.body.password == req.body.repassword) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
      const update = await users.updateOne(
        { _id: userinfo._id },
        { $set: { password: req.body.password } }
      );
      res.redirect("/login");
      loginvalue = null;
    } else {
      passworderr = "not matching";
      res.redirect("/forget3");
    }
  } catch (error) {
    res.status(500).send("Error fetching product data.");
  }
}

//product page

export async function productPage(req, res) {
  let ifuser=req.session.user
  try {
    const productinfo = await products.findById(req.params.id).lean();

    res.render("productPage", { productinfo, ifuser });
  } catch (error) {
    res.status(500).send("Error fetching product data.");
  }
}

export async function wishlist(req, res) {
  let ifuser=req.session.user
  try {
    const wishlistdetails = await users.findOne(
      { _id: req.session.user._id },
      { wishlist: 1 }
    );

    const productId = wishlistdetails.wishlist.map((item) => item.product_id);
    const productsdetails = await products
      .find({ _id: { $in: productId } })
      .lean();

    res.render("wishlist", { productsdetails, ifuser });
  } catch (error) {
    res.status(500).send("Error fetching product data.");
  }
}

export async function cart(req, res) {
  let ifuser=req.session.user
  try {
    if (!req.session.user) {
      res.redirect("/login");
    } else {
      const cartQuantity = {};
      try {
        const userinfo = await users.findOne(
          { _id: req.session.user._id },
          { cart: 1 }
        );

        let count = 0;
        const countf = userinfo.cart.map((item) => {
          count = count + 1;

          return count;
        });

        const productIDs = userinfo.cart.map((item) => {
          cartQuantity[item.product_id] = item.quantity;

          return item.product_id;
        });

        let productsdetails = await products
          .find({ _id: { $in: productIDs } })
          .lean();

        productsdetails = productsdetails.map((item) => {
          return { ...item, cartQuantity: cartQuantity[item._id] };
        });

        let sum = 0;
        for (const i of productsdetails) {
          i.productTotal = i.cartQuantity * i.price;
          sum = sum + i.productTotal;
        }
        productsdetails.sum = sum;

        res.render("cart", {
          productsdetails,
          ifuser,
          count,
        });
      } catch (error) {
        res.status(500).send("Error fetching product data.");
      }
    }
  } catch (error) {
    res.status(500).send("Error fetching product data.");
  }
}

export async function userprofile(req, res) {
  let ifuser=req.session.user
  try {
    const userinfo = await users.findOne({ _id: req.session.user._id });
    const useraddress = await users.findOne(
      { _id: req.session.user._id },
      { address: 1, _id: 0 }
    );

    res.render("profile", { userinfo, useraddress, ifuser });
  } catch (error) {
    res.status(500).send("Error fetching product data.");
  }
}
export async function editProfile(req, res) {
  let ifuser=req.session.user
  const { Name, Email, Phone, Mobile } = req.body;
  if (Name && Email && Phone && Mobile) {
    try {
      await users.findByIdAndUpdate(req.session.user._id, {
        name: Name,
        email: Email,
        phone: Phone,
        mobile: Mobile,
      });
      res.redirect("/profile");
    } catch (error) {
      res.status(500).send("An error occurred while updating the user profile");
    }
  } else {
    res.status(400).send("All fields are required");
  }
}



export async function getcheckout(req, res) {
  let ifuser=req.session.user
  try {
    const cartQuantity = {};
    const userinfo = await users.findOne({ _id: req.session.user._id });

    const productIDs = userinfo.cart.map((item) => {
      cartQuantity[item.product_id] = item.quantity;

      return item.product_id;
    });

    let productsdetails = await products
      .find({ _id: { $in: productIDs } })
      .lean();

    productsdetails = productsdetails.map((item) => {
      return { ...item, cartQuantity: cartQuantity[item._id] };
    });

    let sum = 0;
    for (const i of productsdetails) {
      i.productTotal = i.cartQuantity * i.price;
      sum = sum + i.productTotal;
    }
    productsdetails.sum = sum;

    let count = 0;
    const count1 = userinfo.cart.map((item) => {
      count = count + 1;

      return count;
    });

    let coupons = await coupon.find({
      list: "true",
      expiry: { $gt: new Date().getTime() },
    });

    res.render("checkout", {
      productsdetails,
      ifuser,
      userinfo,
      count,
      coupons,
      quantityerr,
      addressError,
    });
    addressError = null;
    quantityerr = null;
  } catch (error) {
    res.status(500).send("Error fetching product data.");
  }
}
export async function postcheckout(req, res) {
  let ifuser=req.session.user
  try {
    let { totalAmount, address } = req.body;

    const userinfo = await users.findOne(
      { _id: req.session.user._id },
      { cart: 1 }
    );
    const productIDs = userinfo.cart.map((item) => item.product_id);
    const cartQuantity = userinfo.cart.reduce((acc, item) => {
      acc[item.product_id] = item.quantity;
      return acc;
    }, {});

    let productsdetails = await products
      .find({ _id: { $in: productIDs } })
      .lean();
    let promo = 0;
    if (req.body.promo) {
      const code = await coupon.findOne({ couponCode: req.body.promo });
      promo = code.discount;
    }
    let paymentType = req.body.paymentType;

    let wallet = 0;
    if (req.session.wallet) {
      wallet = Number(req.session.wallet);

      paymentType = req.body.paymentType + "& Wallet";
    }

    let sum = 0;
    for (const product of productsdetails) {
      if (product.quantity < cartQuantity[product._id]) {
        res.redirect("/checkout");
        quantityerr = "out of stock";
        return;
      }
      product.cartQuantity = cartQuantity[product._id];
      product.coupon = promo;
      product.wallet = wallet;

      product.productTotal = product.cartQuantity * product.price;
      sum += product.productTotal;
      req.session.quantity = product.cartQuantity;
    }

    const total = sum - promo - wallet;
    productsdetails = productsdetails.map((product) => ({
      ...product,
      total,
      payableAmount: total,
    }));

    address = await users
      .findOne(
        { _id: req.session.user._id, "address._id": address },
        { address: { $elemMatch: { _id: address } } }
      )
      .lean();

    if (!address) {
      res.redirect("/checkout");
      addressError = "create address ";
    }

    const deliveryAddress = address.address[0];
    const ordercount = await orderModel.countDocuments();
    const order = productsdetails.map((product) => ({
      address: deliveryAddress,
      product,
      userId: req.session.user._id,
      quantity: product.cartQuantity,
      total: product.total,
      coupon: product.coupon,
      wallet: product.wallet,
      amountPayable: product.payableAmount,
      paymentType: paymentType,
      orderId: ordercount + 1,
    }));
    req.session.order = order;
    req.session.productsdetails = productsdetails;

    if (req.body.paymentType == "Cash On Delivery") {
      for (const product of productsdetails) {
        await products.updateOne(
          { _id: product._id },
          { $inc: { quantity: -product.cartQuantity } }
        );
      }
      await users.updateOne(
        { _id: req.session.user._id },
        { $inc: { wallet: -Number(req.session.wallet) } }
      );
      req.session.wallet = 0;

      await orderModel.create(order);
      res.redirect("/orderConfirmationPage");
    } else {
      res.render("paymentTemp");
    }
  } catch (error) {
    res.status(500).send("Error fetching product data.");
  }
}

export async function getUserPayment(req, res) {
  
  try {
    let amount = Number(req.session.order[0].amountPayable * 100);

    let receiptId = Math.floor(Math.random() * 100000) + Date.now();
    let options = {
      amount: amount, // amount in the smallest currency unit
      currency: "INR",
      receipt: receiptId,
    };

    instance.orders.create(options, function (err, order) {
      res.json({ success: true, key: process.env.KEY_ID, order });
    });
  } catch (error) {
    console.error(error);

    res.redirect("/checkout");
  }
}
export async function onlineorderconfirm(req, res) {
  try {
    const paymentDocument = await instance.payments.fetch(
      req.body.razorpay_payment_id
    );

    if (paymentDocument.status === "captured") {
      const order = req.session.order;
      const productsdetails = req.session.productsdetails;
      await orderModel.create(order);
      let orderup = await orderModel.aggregate([
        { $sort: { _id: -1 } },
        { $limit: 1 },
      ]);
      for (const product of productsdetails) {
        await products.updateOne(
          { _id: product._id },
          { $inc: { quantity: -product.cartQuantity } }
        );
      }
      const updateResult = await orderModel.updateOne(
        { _id: orderup[0]._id },
        { $set: { paid: true, orderId: paymentDocument.id } }
      );
      await users.updateOne(
        { _id: req.session.user._id },
        { $inc: { wallet: -Number(req.session.wallet) } }
      );
      req.session.wallet = 0;

      res.redirect("/orderconfirmationpage");
    } else {
      res.redirect("/checkout");
    }
  } catch (error) {
    res.status(500).send("Error fetching product data.");
  }
}

export function addresspage(req, res) {
  res.render("address", { ifuser });
}
export async function postaddressprofile(req, res) {
  try {
    const { HouseName, phonenumber, Place, District, state, pincode } =
      req.body;

    const user = await users.findOne({ _id: req.session.user._id });

    if (
      HouseName == "" ||
      phonenumber == "" ||
      Place == "" ||
      District == "" ||
      state == "" ||
      pincode == ""
    ) {
      res.redirect("/profile");
    } else {
      await users.updateOne(
        { _id: req.session.user._id },
        {
          $push: {
            address: {
              _id: uniqid(),
              HouseName,
              phonenumber,
              Place,
              District,
              state,
              pincode,
            },
          },
        }
      );

      const useraddress = await users.findOne(
        { _id: req.session.user._id },
        { address: 1, _id: 0 }
      );

      res.redirect("/profile");
    }
  } catch (error) {
    res.status(500).send("Error fetching product data.");
  }
}

export async function postaddresspage(req, res) {
  try {
    const { HouseName, phonenumber, Place, District, state, pincode } =
      req.body;

    const user = await users.findOne({ _id: req.session.user._id });

    if (
      HouseName == "" ||
      phonenumber == "" ||
      Place == "" ||
      District == "" ||
      state == "" ||
      pincode == ""
    ) {
      res.redirect("/checkout");
    } else {
      await users.updateOne(
        { _id: req.session.user._id },
        {
          $push: {
            address: {
              _id: uniqid(),
              HouseName,
              phonenumber,
              Place,
              District,
              state,
              pincode,
            },
          },
        }
      );

      const useraddress = await users.findOne(
        { _id: req.session.user._id },
        { address: 1, _id: 0 }
      );

      res.redirect("/checkout");
    }
  } catch (error) {
    res.status(500).send("Error fetching product data.");
  }
}
export async function editAddress(req, res) {
  try {
    const { HouseName, phonenumber, place, District, state, pincode } =
      req.body;
    await users.updateOne(
      {
        _id: req.session.user._id,
        address: { $elemMatch: { _id: req.query.id } },
      },
      {
        $set: {
          "address.$.HouseName": HouseName,
          "address.$.phonenumber": phonenumber,
          "address.$.Place": place,
          "address.$.District": District,
          "address.$.state": state,
          "address.$.pincode": pincode,
        },
      }
    );

    res.redirect("back");
  } catch (error) {
    res.status(500).send("Error fetching product data.");
    res.status(500).json({ message: "Internal server error" });
  }
}

export function payment(req, res) {
  res.render("address");
}
export async function orderconfirmationpage(req, res) {
  req.session.order = null;
  const orderDetails = await orderModel.find().sort({ _id: -1 }).limit(1);

  res.render("orderconfirmationpage", {
    ifuser,
    orderDetails,
    user: req.session.user,
  });
}
export async function orderDetails(req, res) {
  const orderDetails = await orderModel.find().sort({ _id: -1 });

  let user = await users.findOne(req.session.user);

  res.render("order", { ifuser, orderDetails });
}



//orderpage

export function userlogout(req, res) {
  delete req.session.user;
  res.redirect("/");
}

//axios function start

export async function addtowishlist(req, res) {
  try {
    await users.updateOne(
      { _id: req.session.user._id },
      { $addToSet: { wishlist: { product_id: req.params.data } } }
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).send("Error fetching product data.");
  }
}

export async function deletefromwishlist(req, res) {
  try {
    await users.updateOne(
      { _id: req.session.user._id },
      { $pull: { wishlist: { product_id: req.params.data } } }
    );
  } catch (error) {
    res.status(500).send("Error fetching product data.");
  }
}
export async function addtocart(req, res) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    try {
      let id = req.params.data;
      let quantity = await products.findOne(
        { _id: req.query.data },
        { _id: 0, quantity: 1 }
      );
      const productin = await users.findOne(
        { _id: req.session.user._id },
        { _id: 0, cart: 1 }
      );
      const productId = productin.cart.map((item) => {
        return item.product_id;
      });

      if (!productId.includes(id)) {
        await users.updateOne(
          { _id: req.session.user._id },
          { $push: { cart: { product_id: req.params.data, quantity: 1 } } }
        );

        // await products.updateOne(
        //   { _id: req.params.data },
        //   { $inc: { quantity: -1 } }
        // );
      } else {
        res.send("not worked");
      }
    } catch (error) {
      res.status(500).send("Error fetching product data.");
    }
  }
}
export async function deletefromcart(req, res) {
  try {
    let { data, quantity } = req.query;
    quantity = parseInt(quantity);
    await users.updateOne(
      { _id: req.session.user._id },
      { $pull: { cart: { product_id: data } } }
    );

    let use = await users.findOne(
      { _id: req.session.user._id },
      { cart: 1, _id: 0 }
    );

    if (use.cart.length <= 0) {
      res.json({ reload: true });
    } else {
      res.json({ reload: true });
    }
  } catch (error) {
    res.status(500).send("Error fetching product data.");
  }
}

export async function incdec(req, res) {
  try {
    if (req.query.cond == "inc") {
      let quantity = await products.findOne(
        { _id: req.query.data },
        { _id: 0, quantity: 1 }
      );

      if (quantity.quantity > req.query.quantity) {
        await users.updateOne(
          {
            _id: req.session.user._id,
            cart: { $elemMatch: { product_id: req.query.data } },
          },
          { $inc: { "cart.$.quantity": 1 } }
        );

        res.json({ success: true });
      } else {
        res.json({ success: false });
      }
    } else {
      await users.updateOne(
        {
          _id: req.session.user._id,
          cart: { $elemMatch: { product_id: req.query.data } },
        },
        { $inc: { "cart.$.quantity": -1 } }
      );

      res.json({ success: true });
    }
  } catch (error) {}
}
export async function deletefromaddress(req, res) {
  try {
    await users.updateOne(
      { _id: req.session.user._id },
      { $pull: { address: { _id: req.query.id } } }
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).send("Error fetching product data.");
  }
}
export async function promoCode(req, res) {
  res.status(500).send("Error fetching product data.");
  try {
    if (!req.query.data) {
      res.json({ success: false });
    } else {
      const code = await coupon.findOne({
        couponCode: req.query.data,
        list: true,
      });

      let todayDate = new Date();
      let expiryDate = new Date(code.expiry);

      if (code) {
        if (expiryDate.getTime() < todayDate.getTime()) {
          res.json({ success: true, exp: false });
        } else {
          if (code.minamount <= req.query.price) {
            res.json({ success: true, code: code.discount, exp: true });
          } else {
            res.json({ success: false });
          }
        }
      } else {
        res.json({ success: false });
      }
    }
  } catch (error) {
    res.status(500).send("Error fetching product data.");
  }
}
export async function wallet(req, res) {
  try {
    if (req.query.price == 0 || req.query.price == "") {
      res.json({ success: true });
    } else {
      let user = await users.findOne({
        _id: req.session.user._id,
      });

      if (user) {
        let wallet = 0;
        if (user.wallet >= req.query.price) {
          wallet = user.wallet - req.query.price;
          req.session.wallet = req.query.price;

          let tp = 0;

          res.json({ success: true, wallet: wallet, tp });
        } else {
          let tp = 0;
          tp = req.query.price - user.wallet;
          req.session.wallet = user.wallet;

          res.json({ success: true, wallet: wallet, tp: tp });
        }
      } else {
        res.json({ success: false });
      }
    }
  } catch (error) {
    res.status(500).send("Error fetching product data.");
  }
}

export async function productReturn(req, res) {
  try {
    const order = await orderModel.findOne({ _id: req.query.data });
    const productId = req.query.proid;

    // Increase the product quantity by the returned quantity
    await products.updateOne(
      { _id: productId },
      { $inc: { quantity: order.quantity } }
    );

    // Update the order status to "Returned" and mark it as unpaid
    await orderModel.updateOne(
      { _id: req.query.data },
      { $set: { orderStatus: "Returned", paid: false } }
    );

    // Refund the customer's wallet if applicable
    const walletUpdate = { $inc: { wallet: order.amountPayable } };
    if (order.wallet !== 0) {
      walletUpdate.$inc.wallet += order.wallet;
    }
    await users.updateOne({ _id: req.session.user._id }, walletUpdate);

    res.json({ success: true });
  } catch (error) {
    res.status(500).send("Error fetching product data.");
  }
}
export async function productCancel(req, res) {
  try {
    const order = await orderModel.findOne({ _id: req.query.data });
    const productId = req.query.proid;

    // Increase the product quantity by the returned quantity
    await products.updateOne(
      { _id: productId },
      { $inc: { quantity: order.quantity } }
    );

    // Update the order status to "Returned" and mark it as unpaid
    await orderModel.updateOne(
      { _id: req.query.data },
      { $set: { orderStatus: "cancelled", paid: false } }
    );

    // Refund the customer's wallet if applicable
    const walletUpdate = { $inc: { wallet: order.amountPayable } };
    if (order.wallet !== 0) {
      walletUpdate.$inc.wallet += order.wallet;
    }
    await users.updateOne({ _id: req.session.user._id }, walletUpdate);

    res.json({ success: true });
  } catch (error) {
    res.status(500).send("Error fetching product data.");
  }
}

//axios function end
export async function uniqueorder(req, res) {
  let ifuser=req.session.user
  const user = await users.findOne({ _id: req.session.user });

  const orderDetails = await orderModel.findOne({ _id: req.query.data });

  res.render("orderdetails", { ifuser, orderDetails, user });
}

export async function search(req, res) {
  let searchdata = await products.find({
    productName: RegExp(req.body.search, "i"),
  });

  req.session.searchdata = searchdata;
  res.redirect("/shop");
}
