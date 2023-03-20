import createDocument from "../helpers/insertToDb.js";
import { users } from "../models/userSchema.js";
import sentOTP from "../helpers/emailSend.js";
import otpGenerator from "otp-generator";
import bcrypt from "bcrypt";
import { products } from "../models/productSchema.js";
import uniqid from "uniqid";
import { coupon } from "../models/couponSchema.js";
import { orderModel } from "../models/orderSchema.js";
import { ifuser } from "../middleware/middleware.js";
import { bannerimage } from "../models/bannerSchema.js";

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

    let cImage = await bannerimage.find();
    cImage = cImage.map((item) => item.mainImage[0]);

    res.render("guest", { jerseyinfo, shortsinfo,socksinfo, cImage, ifuser });
  } catch (error) {
    console.log(error);
  }
}
export async function shop(req, res) {
  try {
    let productinfo = await products.find({ list: true });
    if (req.session.searchdata) {
      productinfo = req.session.searchdata;
      res.render("shop", { productinfo, ifuser });
      req.session.searchdata = null;
      console.log(req.session.searchdata);
    } else {
      res.render("shop", { productinfo, ifuser });
    }
  } catch (error) {
    res.send(error);
  }
}
export async function jersey(req, res) {
  try {
    const productinfo = await products.find({ category: "jersey", list: true });

    res.render("jersey", { productinfo, ifuser });
  } catch (error) {
    res.send(error);
  }
}
export async function shorts(req, res) {
  try {
    const productinfo = await products.find({ category: "shorts", list: true });

    res.render("shorts", { productinfo, ifuser });
  } catch (error) {
    res.send(error);
  }
}
export async function socks(req, res) {
  try {
    const productinfo = await products.find({ category: "socks", list: true });

    res.render("socks", { productinfo, ifuser });
  } catch (error) {
    res.send(error);
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
  } catch (error) {}
}

export async function userPostLogin(req, res) {
  try {
    const { email, password } = req.body;

    const userinfo = await users.findOne({ email });

    if (!userinfo) {
      emailerr = "not found email";
      res.redirect("/login");
    } else {
      bcrypt.compare(password, userinfo.password).then((result) => {
        if (email == userinfo.email && result == true) {
          req.session.user = userinfo;
          req.session.userid = userinfo.id;

          res.redirect("/");
          console.log("postlogin");
        } else {
          emailerr = "password error";
          res.redirect("/login");
        }
      });
    }
  } catch (error) {
    console.log(error);
  }
}
export function userGetSignup(req, res) {
  res.render("signup", { passworderr, emailerr, warning: false });
  passworderr = null;
  emailerr = null;
}
export async function userPostSignup(req, res) {
  console.log(otp);
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
    console.log(error);
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
      console.log(otp);
      req.session.email = email;
      req.session.otp = otp;
      loginvalue = req.body;
      res.redirect("/otpValidate");
    }
  } catch (error) {
    console.log(error);
  }
}
export function resendOTP(req, res) {
  let otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
  });

  console.log(req.session.email);
  sentOTP(req.session.email, otp);
  req.session.email = req.session.email;
  req.session.otp = otp;

  res.redirect("/otpValidate");
}
export function getOtpValidate(req, res) {
  console.log(req.body);

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
    console.log(error);
  }
}

//product page

export async function productPage(req, res) {
  try {
    const productinfo = await products.findById(req.params.id).lean();

    res.render("productPage", { productinfo, ifuser });
  } catch (error) {
    console.log(error);
  }
}

export async function wishlist(req, res) {
  const userid = req.session.userid;

  try {
    const wishlistdetails = await users.findOne(
      { _id: userid },
      { wishlist: 1 }
    );

    const productId = wishlistdetails.wishlist.map((item) => item.product_id);
    const productsdetails = await products
      .find({ _id: { $in: productId } })
      .lean();

    res.render("wishlist", { productsdetails, ifuser });
  } catch (error) {
    console.log(error);
  }
}

export async function cart(req, res) {
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
        console.log(userinfo);
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
        console.log(productsdetails);
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
        console.log(error);
      }
    }
  } catch (error) {
    console.log(error);
  }
}

export async function userprofile(req, res) {
  try {
    const userinfo = await users.findOne({ _id: req.session.userid });
    const useraddress = await users.findOne(
      { _id: req.session.user._id },
      { address: 1, _id: 0 }
    );

    res.render("profile", { userinfo, useraddress, ifuser });
  } catch (error) {
    console.log(error);
  }
}
export function contactus(req, res) {
  res.render("contactus", { ifuser });
}

export async function getcheckout(req, res) {
  try {
    const cartQuantity = {};
    const userinfo = await users.findOne(
      { _id: req.session.user._id },
      { cart: 1 }
    );

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

    //address

    const useraddress = await users.findOne(
      { _id: req.session.user._id },
      { address: 1, _id: 0 }
    );

    const coupon1 = await coupon.findOne({ list: false });

    if (coupon1) {
      await coupon.findByIdAndUpdate(coupon1._id, { $set: { list: true } });
    }

    let coupons = await coupon.find({ list: "true" });

    res.render("checkout", {
      productsdetails,
      ifuser,
      useraddress,
      count,
      coupons,
      addressError,
      quantityerr,
    });
    addressError = null;
    quantityerr = null;
  } catch (error) {
    console.log(error);
  }
}
export async function postcheckout(req, res) {
  try {
    const cartQuantity = {};

    const userinfo = await users.findOne(
      { _id: req.session.user._id },
      { cart: 1 }
    );

    const productIDs = userinfo.cart.map((item) => {
      cartQuantity[item.product_id] = item.quantity;

      return item.product_id;
    });

    let productsdetails = await products
      .find({ _id: { $in: productIDs } })
      .lean();

    let promo = 0;
    if (req.body.promo) {
      const code = await coupon.findOne({ couponCode: req.body.promo });

      promo = code.discount;
    }

    let sum = 0;

    productsdetails = productsdetails.map((item) => {
      return {
        ...item,
        cartQuantity: cartQuantity[item._id],
        coupon: promo,
      };
    });

    productsdetails.forEach((item) => {
      console.log(item.quantity, item.cartQuantity);
      if (item.quantity < item.cartQuantity) {
        quantityerr = "out of stock";
        res.redirect("/checkout");
      }
    });

    for (const i of productsdetails) {
      i.productTotal = i.cartQuantity * i.price;
      sum = sum + i.productTotal;
    }

    sum = productsdetails.reduce((acc, item) => acc + item.productTotal, 0);

    let total = sum - promo;

    productsdetails = productsdetails.map((item) => {
      return {
        ...item,
        total: sum,
        payableAmount: total,
      };
    });

    let address = await users.findOne(
      {
        _id: req.session.user._id,
        "address._id": req.body.address,
      },
      { address: { $elemMatch: { _id: req.body.address } } }
    );
    let deladdress = address.address[0];

    let quantity = await products.findOne(
      { _id: productIDs },
      { _id: 0, quantity: 1 }
    );
    productsdetails.forEach(async (i) => {
      await products.updateOne(
        {
          _id: i._id,
        },
        { $inc: { quantity: -i.cartQuantity } }
      );
    });

    let ordercount = await orderModel.find().count();

    let orders = productsdetails.map((product) => ({
      address: deladdress,
      product: product,
      userId: req.session.user._id,
      quantity: product.cartQuantity,
      total: product.total,
      coupon: product.coupon,
      amountPayable: product.payableAmount,
      paymentType: req.body.paymentType,
      orderId: ordercount + 1,
    }));

    await orderModel.create(orders);

    res.redirect("/orderConfirmationPage");
  } catch (error) {
    addressError = "address is not found";
    res.redirect("/checkout");
  }
}
export function addresspage(req, res) {
  res.render("address", { ifuser });
}
export async function postaddressprofile(req, res) {
  try {
    const {
      firstName,
      lastName,
      phonenumber,
      Email,
      address,
      country,
      state,
      pincode,
    } = req.body;

    const user = await users.findOne({ _id: req.session.user._id });

    if (
      firstName == "" ||
      lastName == "" ||
      phonenumber == "" ||
      Email == "" ||
      address == "" ||
      country == "" ||
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
              firstName,
              lastName,
              phonenumber,
              Email,
              address,
              country,
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
    console.log(error);
  }
}

export async function postaddresspage(req, res) {
  try {
    const {
      firstName,
      lastName,
      phonenumber,
      Email,
      address,
      country,
      state,
      pincode,
    } = req.body;

    const user = await users.findOne({ _id: req.session.user._id });
    console.log(user);

    if (
      firstName == "" ||
      lastName == "" ||
      phonenumber == "" ||
      Email == "" ||
      address == "" ||
      country == "" ||
      state == "" ||
      pincode == ""
    ) {
      res.redirect("/checkout");
    } else {
      users
        .updateOne(
          { _id: req.session.user._id },
          {
            $push: {
              address: {
                _id: uniqid(),
                firstName,
                lastName,
                phonenumber,
                Email,
                address,
                country,
                state,
                pincode,
              },
            },
          }
        )
        .then((result) => {
          console.log(result);
        });

      const useraddress = await users.findOne(
        { _id: req.session.user._id },
        { address: 1, _id: 0 }
      );

      res.redirect("/checkout");
    }
  } catch (error) {
    console.log(error);
  }
}
export async function editaddress(req, res) {
  try {
    const useraddress = await users
      .findOne({ _id: req.session.user._id })
      .select("address")
      .elemMatch("address", { _id: req.params.data })
      .exec();

    res.render("editprofile", { i: useraddress, ifuser });
  } catch (error) {
    console.log(error);
  }
}
export function payment(req, res) {
  res.render("address");
}
export function orderconfirmationpage(req, res) {
  res.render("orderconfirmationpage", { ifuser });
}
export async function orderDetails(req, res) {
  const orderDetails = await orderModel.find().sort({ _id: -1 });

  let user = await users.findOne(req.session.user);
  console.log(user);
  res.render("order", { ifuser, orderDetails });
}

export async function newp(req, res) {

  res.render("new");
}

//orderpage

export function userlogout(req, res) {
  console.log("userlogout");
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
    console.log(error);
  }
}

export async function deletefromwishlist(req, res) {
  try {
    users.updateOne(
      { _id: req.session.user._id },
      { $pull: { wishlist: { product_id: req.params.data } } }
    );
  } catch (error) {
    console.log(error);
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
      console.log(error);
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

    await users.updateOne(
      {
        _id: req.session.user._id,
        cart: { $elemMatch: { product_id: data } },
      },
      { $inc: { "cart.$.quantity": 1 } }
    );
  } catch (error) {
    console.log(error);
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
      { $pull: { address: { _id: req.params.data } } }
    );
  } catch (error) {
    console.log(error);
  }
}
export async function promoCode(req, res) {
  console.log(req.query);
  try {
    if (!req.query.data) {
      res.json({ success: false });
    } else {
      const code = await coupon.findOne({
        couponCode: req.query.data,
        list: true,
      });
      if (code) {
        if (code.minamount <= req.query.price) {
          await coupon.updateOne(
            { couponCode: req.query.data },
            { $set: { list: false } }
          );
          res.json({ success: true, code: code.discount });
        } else {
          await coupon.updateOne(
            { couponCode: req.query.data },
            { $set: { list: true } }
          );
          res.json({ success: false });
        }
      } else {
        res.json({ success: false });
      }
    }
  } catch (error) {
    console.log(error);
  }
}
export async function productReturn(req, res) {
  try {
    let p=await orderModel.findOne({_id:req.query.data})
    console.log(p.quantity);
    await products.updateOne(
      {
        _id: req.query.proid,
      },
      { $inc: { quantity: p.quantity } }
    );
    await orderModel.updateOne(
      {
        _id: req.query.data,
      },
      { $set: { orderStatus: "Returned", paid: false } }
    );
    res.json({ success: true });
  } catch (error) {
    res.send(error);
  }
}

//axios function end
export async function uniqueorder(req, res) {
  const user = await users.findOne({ _id: req.session.user });
  console.log(user.name);
  const orderDetails = await orderModel.findOne({ _id: req.query.data });

  res.render("orderdetails", { ifuser, orderDetails, user });
}

export async function search(req, res) {
  console.log(req.body);
  let searchdata = await products.find({
    productName: RegExp(req.body.search, "i"),
  });
  console.log(searchdata);
  req.session.searchdata = searchdata;
  res.redirect("/shop");
}
