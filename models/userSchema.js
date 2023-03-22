import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  ban: {
    type: Boolean,
    default: true,
  },
  cart: {
    type: Array,
  },
  address:{
    type:Array
  },
  wishlist: {
    type: Array,
  },
  wallet:{
    type:Number,
    default:0
  },
  
  date: {
    type: Date,
    default: Date.now(),
  },
});
export const users = new mongoose.model("user", userSchema);
