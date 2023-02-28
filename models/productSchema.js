import mongoose from "mongoose";

const productSchema =new mongoose.Schema( {
  productName: {
    type: String,
    required: true,
  },category:{
    type: String,
    required: true,
  },
  quantity:{
    type: Number,
    required:true,
  },
  price:{
    type:Number,
    required:true,
  },
  list:{
    type:Boolean,
    default:true,
  },
  Image:{
    type:String,
    required:true,
  },
  description:{
    type:String,
    required:true,
  },
  review:{
    type:String,
    
  }
})

  export const products=new mongoose.model("product",productSchema)


