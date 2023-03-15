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

let otp = otpGenerator.generate(6, {
  upperCaseAlphabets: false,
  specialChars: false,
});

export async function guestpage(req, res) {
  try {
    const productinfo = await products.find({ list: true });
let cImage=await bannerimage.find()
cImage=cImage.map((item)=>item.mainImage[0])



    res.render("guest", { productinfo,cImage, ifuser });
  } catch (error) {
    console.log(error);
  }
  
}
export function userGetLogin(req, res) {
  if (!req.session.user) {
    res.render("login", { emailerr });
    emailerr = null;
  } else {
    res.redirect("/");
  }
}

export async function userPostLogin(req, res) {
  try {
    console.log(req.body);
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
      console.log("forget", loginvalue);
    }
  } catch (error) {
    console.log(error);
  }
}

//product page

export async function productPage(req, res) {
  try {
    const productinfo = await products.findById(req.params.id).lean()

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
       
      
      res.render("wishlist", { productsdetails, ifuser  });
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
          { cart: 1 })
        ;
        console.log(userinfo);
        let count=0
        const countf = userinfo.cart.map((item) => {
          count=count+1
     
        

          return count;
        });
        console.log(count,"=========");

        const productIDs = userinfo.cart.map((item) => {
          cartQuantity[item.product_id] = item.quantity;

          return item.product_id;
        });
        console.log(productIDs);

        let productsdetails = await products
          .find({ _id: { $in: productIDs } })
          .lean();


            console.log(productsdetails, "123456789");
        productsdetails = productsdetails.map((item) => {
          return { ...item, cartQuantity: cartQuantity[item._id] };
        });
        let sum = 0;
        for (const i of productsdetails) {
          i.productTotal = i.cartQuantity * i.price;
          sum = sum + i.productTotal;
        }
        productsdetails.sum = sum;

        // console.log(productsdetails, "123456789");
        

        res.render("cart", {
          productsdetails,
          ifuser,
          count
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
  console.log(req.body.promo);
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

    // console.log(productsdetails, "123456789");
    let count=0
    const count1 = userinfo.cart.map((item) => {
      count=count+1
 
    

      return count;
    });
 
    //address

    const useraddress = await users.findOne(
      { _id: req.session.user._id },
      { address: 1, _id: 0 }
    );

    res.render("checkout", {
      productsdetails,
      ifuser,
      useraddress,
      count
    });
  } catch (error) {
    console.log(error);
  }
}

export async function postcheckout(req, res) {
  console.log(req.body.promo);
  try {
    if (!req.session.user) {
      res.redirect("/login");
    } else {
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
        return { ...item, cartQuantity: cartQuantity[item._id]};
      });
      let promo=0
      if (req.body.promo) {
        const code = await coupon.findOne({ couponCode: req.body.promo });
        console.log(code);
        productsdetails.promo = code.discount;
      }else{
        productsdetails.promo = promo
      }
      let sum = 0;
      for (const i of productsdetails) {
        i.productTotal = i.cartQuantity * i.price;
        sum = sum + i.productTotal;
      }
   

      productsdetails.sum = sum-productsdetails.promo
      

    
    

      console.log(productsdetails.promo);


     
      let address = await users.findOne(
        {
          _id: req.session.user._id,
          "address._id": req.body.address,
        },
        { address: { $elemMatch: { _id: req.body.address } } }
      );
      let deladdress = address.address[0];
      let orders = [];
      let i = 1;
      let ordercount = await orderModel.find().count();
     
      for (let product of productsdetails) {
        orders.push({
          address: deladdress,
          product: product,
          userId: req.session.user._id,
          quantity: cartQuantity[product._id],
          total: product.productTotal,
          amountPayable: product.sum,
          paymentType: req.body.paymentType,
          orderId: ordercount + 1,
        });
        i++;
      }
      await orderModel.create(orders);

     
  
      res.render("orderConfirmationPage", {
        ifuser,
        productsdetails,
      });
    }
  } catch (error) {
    console.log(error);
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
      console.log("vaue not");
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
      console.log(
        //useraddress,
        useraddress.address,
        "11111111111111"
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
      console.log("vaue not");
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
      console.log(
        //useraddress,
        useraddress.address,
        "11111111111111"
      );

      
      res.redirect("/checkout");
    }
  } catch (error) {
    console.log(error);
  }
}
export async function editaddress(req, res) {
  try {
    console.log(req.params);

    const useraddress = await users
      .findOne({ _id: req.session.user._id })
      .select("address")
      .elemMatch("address", { _id: req.params.data })
      .exec();

    console.log("11111111111", useraddress);

    res.render("editprofile", { i: useraddress, ifuser });
  } catch (error) {
    console.log(error);
  }
}
export function payment(req, res) {
  console.log(req.body);
  res.render("address");
}

export function userlogout(req, res) {
  console.log("userlogout");
  delete req.session.user;
  res.redirect("/");
}

//axios function start

export async function addtowishlist(req, res) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    try {
      let id = req.params.data;

      const user = await users.findOne(
        { _id: req.session.user._id },
        { _id: 0, wishlist: 1 }
      );
      const productId = user.wishlist.map((item) => {
        return item.product_id;
      });

      if (!productId.includes(id)) {
        users
          .updateOne(
            { _id: req.session.user._id },
            { $push: { wishlist: { product_id: req.params.data } } }
          )
          .then((result) => {
            console.log(result);
          });
      } else {
        console.log("22222222222222");
      }
    } catch (error) {
      console.log(error);
    }
  }
}
export async function deletefromwishlist(req, res) {
  try {
    users
      .updateOne(
        { _id: req.session.user._id },
        { $pull: { wishlist: { product_id: req.params.data } } }
      )
      .then((result) => {
        console.log(result);
      });
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

      const productin = await users.findOne(
        { _id: req.session.user._id },
        { _id: 0, cart: 1 }
      );
      const productId = productin.cart.map((item) => {
        return item.product_id;
      });

      if (!productId.includes(id)) {
        users
          .updateOne(
            { _id: req.session.user._id },
            { $push: { cart: { product_id: req.params.data, quantity: 1 } } }
          )
          .then((result) => {
            console.log(result);
          });
      } else {
        console.log("22222222222222222222222");
      }
    } catch (error) {
      console.log(error);
    }
  }
}
export async function deletefromcart(req, res) {
  try {
    users
      .updateOne(
        { _id: req.session.user._id },
        { $pull: { cart: { product_id: req.params.data } } }
      )
      .then((result) => console.log(result));
  } catch (error) {
    console.log(error);
  }
}

export async function incdec(req, res) {
  try {
    console.log(req.query.data, "1234");

    if (req.query.cond == "inc") {
      users
        .updateOne(
          {
            _id: req.session.user._id,
            cart: { $elemMatch: { product_id: req.query.data } },
          },
          { $inc: { "cart.$.quantity": 1 } }
        )
        .then((result) => {
          console.log(result, "11111");
        });
      res.json({ success: true });
    } else {
      users
        .updateOne(
          {
            _id: req.session.user._id,
            cart: { $elemMatch: { product_id: req.query.data } },
          },
          { $inc: { "cart.$.quantity": -1 } }
        )
        .then((result) => {
          console.log(result, "2222");
        });
      res.json({ success: true });
    }
  } catch (error) {}
}
export async function deletefromaddress(req, res) {
  try {
    users
      .updateOne(
        { _id: req.session.user._id },
        { $pull: { address: { _id: req.params.data } } }
      )
      .then((result) => console.log(result));
  } catch (error) {
    console.log(error);
  }
}
export async function promoCode(req, res) {
  console.log(req.params);
  try {
    if (!req.params.data) {
      res.json({ success: false });
    } else {
      const code = await coupon.findOne({ couponCode: req.params.data });

      if (!code) {
        console.log("1111111111111111111");
        res.json({ success: false });
      } else {
        console.log("3222222222");
        res.json({ success: true, code: code.discount });
      }
    }
  } catch (error) {
    console.log(error);
  }
}

//axios function end
export function newp(req,res){
  res.render("new home")
}