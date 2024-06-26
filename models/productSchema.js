import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    default:true,
  },
  // subCategory: {
  //   type: String,
  //   required: true,
  // },
  quantity: {
    type: Number,
    required: true,
  },
  MRP: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  mainImage: {
    type: Array,
    required: true,
  },
  subImages: {
    type: Array,
    required: true,
  },
  list: {
    type: Boolean,
    default: true,
  },
  uploadedAt: {
    type: Date,
    default: new Date(),
  },
  description: {
    type: String,
    required: true,
  },
  review: {
    type: String,
  },
});

export const products = new mongoose.model("product", productSchema);
