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
import { createId } from "../helpers/createId.js";
import axios from "axios";

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
    console.log(ifuser);
    res.render("guest", { jerseyinfo, shortsinfo, socksinfo, cImage, ifuser });
  } catch (error) {
    console.log(error);
  }
}
export async function shop(req, res) {
  const { sort, filter } = req.query;

  try {
    let productinfo;
    let pipeline = [];

    if (sort) {
      pipeline.push({ $sort: { price: parseInt(sort) } });
    }

    if (filter) {
      pipeline.push({ $match: { category: filter } });
    }

    if (req.session.searchdata) {
      productinfo = req.session.searchdata;
      req.session.searchdata = null;
    } else {
      pipeline.push({ $match: { list: true } });
      productinfo = await products.aggregate(pipeline);
    }

    res.render("shop", { productinfo, ifuser });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error fetching product data.");
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
    console.log(userinfo);

    if (!userinfo) {
      emailerr = "not found email";
      res.redirect("/login");
    }else if(userinfo.ban==false){
      emailerr="you are banned"
      res.redirect('/login')

    } else {
      bcrypt.compare(password, userinfo.password).then((result) => {
        if (email == userinfo.email && result == true) {
          req.session.user = userinfo;
        

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
    const userinfo = await users.findOne({ _id: req.session.user._id });
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
  console.log(req.body);
  try {
    let {totalAmount,address} = req.body;

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
    
    let sum = 0;
    for (const product of productsdetails) {
      if (product.quantity < cartQuantity[product._id]) {
        console.log("1111");
        res.redirect("/checkout");
        console.log("1111");
        return;
      }
      product.cartQuantity = cartQuantity[product._id];
      product.coupon = promo;
      product.productTotal = product.cartQuantity * product.price;
      sum += product.productTotal;
      await products.updateOne(
        { _id: product._id },
        { $inc: { quantity: -product.cartQuantity } }
        );
      }
      
      const total = sum - promo;
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
          addressError = "not ";
          return;
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
          amountPayable: product.payableAmount,
          paymentType: req.body.paymentType,
          orderId: ordercount + 1,
        }));
        req.session.order = order;
    
     totalAmount=parseInt(totalAmount)
    // console.log(typeof(totalAmount)); 

       
    if (req.body.paymentType !== "Cash On Delivery") {

      if (req.body.paymentType == "wallet") {
       
        let user=await users.findOne({_id:req.session.user._id},{wallet:1,_id:0})
       
        if(totalAmount<=user.wallet){
         let wallet=user.wallet-totalAmount
          console.log(wallet);
          await users.updateOne({_id:req.session.user._id},{$set:{wallet:wallet}})
          await orderModel.create(order);
          res.redirect("")
          
        }else{
          console.log(wallet);
        }
      }
      const orderId = `order_${createId()}`;

      const options = {
        method: "POST",
        url: "https://sandbox.cashfree.com/pg/orders",
        headers: {
          accept: "application/json",
          "x-api-version": "2022-09-01",
          "x-client-id": "TEST3454899ddecf8df0eadc531a25984543",
          "x-client-secret": "TEST195cb915f5d6fb28aa881b2dbe7bd701db6d64cf",
          "content-type": "application/json",
        },
        data: {
          order_id: orderId,
          order_amount:totalAmount,
          order_currency: "INR",
          customer_details: {
            customer_id: req.session.user._id,
            customer_email: "risvanguest0000@gmail.com",
            customer_phone: "9946357406",
          },
          order_meta: {
            return_url: `http://localhost:3000/verifyPayment?order_id=${orderId}`,
          },
        },
      };

      try { 
        
        console.log("11111111111111111");
        const response = await axios.request(options)
       console.log(response);
        console.log(response.data.payment_session_id);

        return res.render("paymentTemp", {
          orderId,
          sessionId: response.data.payment_session_id,
        });
      } catch (error) {
      //  console.error(error);
      }
    } else {
      await orderModel.create(order);
    }

    res.redirect("/orderConfirmationPage");
  } catch (error) {
    res.redirect("/checkout");
  }
}

export async function getUserPayment(req, res) {
  console.log(user, "12333333");
  const userId = req.session.user._id;
  const user = await users.findById(userId).lean();

  const cart = user.cart;
  const cartList = cart.map((item) => {
    return item.product_id;
  });
  const product = await products.find({ _id: { $in: cartList } }).lean();

  const order_id = req.query.order_id;

  const options = {
    method: "GET",
    url: "https://sandbox.cashfree.com/pg/orders/" + order_id,
    headers: {
      accept: "application/json",
      "x-api-version": "2022-09-01",
      "x-client-id": "TEST3454899ddecf8df0eadc531a25984543",
      "x-client-secret": "TEST195cb915f5d6fb28aa881b2dbe7bd701db6d64cf",
      "content-type": "application/json",
    },
  };

  try {
    const response = await axios.request(options);
    if (response.data.order_status === "PAID") {
      await orderModel.create(req.session.orders);
      for (let i = 0; i < products.length; i++) {
        await products.updateOne(
          { _id: product[i]._id },
          { $inc: { quantity: -req.session.orders.orderItems[i].quantity } }
        );
      }
      await users.findByIdAndUpdate(userId, { $set: { cart: [] } });
      res.redirect("/orderconfirmationpage");
    } else {
      res.redirect("/checkout");
    }
  } catch (error) {
    console.error(error);

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
export async function orderconfirmationpage(req, res) {
  const orderDetails = await orderModel.find().sort({ _id: -1 }).limit(1)
 

  res.render("orderconfirmationpage", { ifuser,orderDetails,user:req.session.user });
}
export async function orderDetails(req, res) {
  const orderDetails = await orderModel.find().sort({ _id: -1 });

  let user = await users.findOne(req.session.user);

  res.render("order", { ifuser, orderDetails });
}

export async function newp(req, res) {
  try {
    let productinfo = await products.find({ list: true });
    if (req.session.searchdata) {
      productinfo = req.session.searchdata;
      res.render("new", { productinfo, ifuser });
      req.session.searchdata = null;
    } else {
      res.render("new", { ifuser, productinfo });
    }
  } catch (error) {
    res.send(error);
  }
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
  console.log(req.params);
  try {
   await users.updateOne(
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

    let use = await users.findOne(
      { _id: req.session.user._id },
      { cart: 1, _id: 0 }
    );
    console.log(use);
    if (use.cart.length <= 0) {
      res.json({ reload: true });
    } else {
      res.json({ reload: true });
    }
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
    let p = await orderModel.findOne({ _id: req.query.data });
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
  console.log(orderDetails);

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

export async function sort(req, res) {
  console.log(req.query);
}
