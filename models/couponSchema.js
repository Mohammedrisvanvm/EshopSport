import mongoose from "mongoose";
const couponSchema=new mongoose.Schema({

name:{
    type:String,
    required:true
},
couponCode:{
    type:String,
    required:true

},
minamout:{
    type:Number,
    required:true

},
discount:{
    type:Number,
    required:true
},
maxdiscount:{
    type:Number,
    required:true
},
expiry:{
    type:Date,
    required:true
},
list:{
    type:Boolean,
    required:false
}},
{timestamps:true})
export const coupon=new mongoose.model("coupon",couponSchema)